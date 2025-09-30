import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '@/common/services/supabase.service';
import { LoggerService } from '@/common/services/logger.service';
import { PaymentsService } from '@/payments/payments.service';
import { AntiReplayService } from './services/anti-replay.service';
import { PremiumRateLimiterService } from './services/premium-rate-limiter.service';

export interface PremiumPlan {
  id: string;
  planType: 'monthly' | 'yearly' | 'lifetime';
  name: string;
  description?: string;
  priceLamports: number;
  priceSol: number;
  durationDays?: number;
  features: string[];
  maxScansPerMonth?: number;
  isActive: boolean;
}

export interface PremiumSubscription {
  id: string;
  userId: string;
  planId: string;
  paymentId?: string;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  startedAt: Date;
  expiresAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  autoRenew: boolean;
  features: string[];
  usageLimits: Record<string, any>;
  metadata: Record<string, any>;
  plan?: PremiumPlan;
}

export interface ActivatePremiumDto {
  userId: string;
  paymentId: string;
  planType: 'monthly' | 'yearly' | 'lifetime';
  nonce: string;
}

export interface CheckAccessDto {
  userId: string;
  feature: string;
  operation: string;
}

export interface TrackUsageDto {
  userId: string;
  feature: string;
  incrementBy?: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class PremiumService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly logger: LoggerService,
    private readonly paymentsService: PaymentsService,
    private readonly antiReplayService: AntiReplayService,
    private readonly rateLimiterService: PremiumRateLimiterService,
  ) {}

  /**
   * Activate premium subscription for a user
   */
  async activatePremium(dto: ActivatePremiumDto): Promise<PremiumSubscription> {
    const { userId, paymentId, planType, nonce } = dto;

    this.logger.log(`Activating premium subscription for user ${userId}`, 'PremiumService');

    try {
      // Validate anti-replay nonce
      const isValidNonce = await this.antiReplayService.validateNonce({
        userId,
        nonce,
        operation: 'activate_premium',
      });

      if (!isValidNonce) {
        await this.auditLog({
          userId,
          action: 'premium_activation_failed',
          entityType: 'subscription',
          success: false,
          errorMessage: 'Invalid or expired nonce',
          severity: 'warn',
        });
        throw new BadRequestException('Invalid or expired nonce');
      }

      // Verify payment exists and is confirmed
      const serviceClient = this.supabaseService.getServiceClient();

      const { data: payment, error: paymentError } = await serviceClient
        .from('solana_payments')
        .select('id, user_id, type, status, amount_lamports, amount_sol')
        .eq('id', paymentId)
        .eq('user_id', userId)
        .eq('type', 'premium')
        .eq('status', 'confirmed')
        .single();

      if (paymentError || !payment) {
        await this.auditLog({
          userId,
          action: 'premium_activation_failed',
          entityType: 'subscription',
          entityId: paymentId,
          success: false,
          errorMessage: 'Payment not found or not confirmed',
          severity: 'warn',
        });
        throw new BadRequestException('Payment not found or not confirmed');
      }

      // Get premium plan
      const { data: plan, error: planError } = await serviceClient
        .from('premium_plans')
        .select('*')
        .eq('plan_type', planType)
        .eq('is_active', true)
        .single();

      if (planError || !plan) {
        throw new BadRequestException('Premium plan not found');
      }

      // Verify payment amount matches plan price
      if (payment.amount_lamports < plan.price_lamports) {
        await this.auditLog({
          userId,
          action: 'premium_activation_failed',
          entityType: 'subscription',
          entityId: paymentId,
          success: false,
          errorMessage: 'Insufficient payment amount',
          severity: 'warn',
        });
        throw new BadRequestException('Insufficient payment amount for selected plan');
      }

      // Check for existing active subscription
      const { data: existingSubscription } = await serviceClient
        .from('premium_subscriptions')
        .select('id, status, expires_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (existingSubscription) {
        await this.auditLog({
          userId,
          action: 'premium_activation_failed',
          entityType: 'subscription',
          entityId: existingSubscription.id,
          success: false,
          errorMessage: 'User already has active subscription',
          severity: 'info',
        });
        throw new ConflictException('User already has an active premium subscription');
      }

      // Calculate expiry date
      const startedAt = new Date();
      const expiresAt = plan.duration_days
        ? new Date(startedAt.getTime() + plan.duration_days * 24 * 60 * 60 * 1000)
        : null; // Lifetime subscription

      // Create premium subscription
      const { data: subscription, error: subscriptionError } = await serviceClient
        .from('premium_subscriptions')
        .insert({
          user_id: userId,
          plan_id: plan.id,
          payment_id: paymentId,
          status: 'active',
          started_at: startedAt.toISOString(),
          expires_at: expiresAt?.toISOString(),
          auto_renew: false,
          features: plan.features,
          usage_limits: {},
          metadata: {
            activatedAt: startedAt.toISOString(),
            paymentAmount: payment.amount_lamports,
            planType,
          },
        })
        .select('*')
        .single();

      if (subscriptionError) {
        this.logger.error('Failed to create premium subscription', subscriptionError, 'PremiumService');
        throw new BadRequestException('Failed to activate premium subscription');
      }

      // Update user profile premium status
      await serviceClient
        .from('user_profiles')
        .update({
          is_premium: true,
          premium_expires_at: expiresAt?.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      // Create initial feature usage records
      if (plan.features && plan.features.length > 0) {
        const usageRecords = plan.features.map(feature => ({
          user_id: userId,
          subscription_id: subscription.id,
          feature_name: feature,
          usage_count: 0,
          period_start: new Date(startedAt.getFullYear(), startedAt.getMonth(), 1).toISOString(),
          period_end: new Date(startedAt.getFullYear(), startedAt.getMonth() + 1, 1).toISOString(),
        }));

        await serviceClient
          .from('premium_feature_usage')
          .insert(usageRecords);
      }

      // Consume the nonce
      await this.antiReplayService.consumeNonce(nonce);

      // Audit log
      await this.auditLog({
        userId,
        subscriptionId: subscription.id,
        action: 'premium_activated',
        entityType: 'subscription',
        entityId: subscription.id,
        newValues: subscription,
        success: true,
        severity: 'info',
        metadata: { planType, paymentId },
      });

      this.logger.log(`Premium subscription activated for user ${userId}`, 'PremiumService');

      return this.formatSubscription(subscription, plan);
    } catch (error) {
      this.logger.error(`Failed to activate premium for user ${userId}`, error, 'PremiumService');

      await this.auditLog({
        userId,
        action: 'premium_activation_error',
        entityType: 'subscription',
        success: false,
        errorMessage: error.message,
        severity: 'error',
      });

      throw error;
    }
  }

  /**
   * Get user's premium subscription
   */
  async getPremiumSubscription(userId: string): Promise<PremiumSubscription | null> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();

      const { data: subscription, error } = await serviceClient
        .from('premium_subscriptions')
        .select(`
          *,
          premium_plans (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        this.logger.error(`Failed to get premium subscription for user ${userId}`, error, 'PremiumService');
        return null;
      }

      if (!subscription) {
        return null;
      }

      return this.formatSubscription(subscription, subscription.premium_plans);
    } catch (error) {
      this.logger.error(`Error getting premium subscription for user ${userId}`, error, 'PremiumService');
      return null;
    }
  }

  /**
   * Check if user has access to premium feature
   */
  async checkPremiumAccess(dto: CheckAccessDto): Promise<{ hasAccess: boolean; reason?: string; subscription?: PremiumSubscription }> {
    const { userId, feature, operation } = dto;

    try {
      // Check rate limit first
      const rateLimitResult = await this.rateLimiterService.checkRateLimit({
        userId,
        operation,
        tier: 'premium', // Default to premium, will be adjusted based on subscription
      });

      if (!rateLimitResult.allowed) {
        return {
          hasAccess: false,
          reason: 'Rate limit exceeded',
        };
      }

      // Get user's subscription
      const subscription = await this.getPremiumSubscription(userId);

      if (!subscription) {
        // Update rate limit tier to free
        await this.rateLimiterService.checkRateLimit({
          userId,
          operation,
          tier: 'free',
        });

        return {
          hasAccess: false,
          reason: 'No active premium subscription',
        };
      }

      // Check if subscription is expired
      if (subscription.expiresAt && new Date() > subscription.expiresAt) {
        // Mark subscription as expired
        await this.expireSubscription(subscription.id);

        return {
          hasAccess: false,
          reason: 'Premium subscription expired',
        };
      }

      // Check if feature is included in subscription
      if (!subscription.features.includes(feature)) {
        return {
          hasAccess: false,
          reason: `Feature '${feature}' not included in subscription`,
          subscription,
        };
      }

      // Check feature usage limits (if any)
      const usageCheck = await this.checkFeatureUsageLimit(userId, subscription.id, feature);
      if (!usageCheck.allowed) {
        return {
          hasAccess: false,
          reason: usageCheck.reason,
          subscription,
        };
      }

      return {
        hasAccess: true,
        subscription,
      };
    } catch (error) {
      this.logger.error(`Error checking premium access for user ${userId}`, error, 'PremiumService');
      return {
        hasAccess: false,
        reason: 'Internal error checking access',
      };
    }
  }

  /**
   * Track premium feature usage
   */
  async trackFeatureUsage(dto: TrackUsageDto): Promise<{ success: boolean; currentUsage: number }> {
    const { userId, feature, incrementBy = 1, metadata = {} } = dto;

    try {
      const subscription = await this.getPremiumSubscription(userId);
      if (!subscription) {
        throw new BadRequestException('No active premium subscription');
      }

      const serviceClient = this.supabaseService.getServiceClient();
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      // Upsert feature usage record
      const { data: usage, error } = await serviceClient
        .rpc('upsert_premium_feature_usage', {
          p_user_id: userId,
          p_subscription_id: subscription.id,
          p_feature_name: feature,
          p_increment: incrementBy,
          p_period_start: periodStart.toISOString(),
          p_period_end: periodEnd.toISOString(),
          p_metadata: metadata,
        });

      if (error) {
        this.logger.error(`Failed to track feature usage for user ${userId}`, error, 'PremiumService');
        throw new BadRequestException('Failed to track feature usage');
      }

      // Audit log
      await this.auditLog({
        userId,
        subscriptionId: subscription.id,
        action: 'feature_usage_tracked',
        entityType: 'feature_usage',
        success: true,
        severity: 'debug',
        metadata: { feature, incrementBy, currentUsage: usage },
      });

      return {
        success: true,
        currentUsage: usage,
      };
    } catch (error) {
      this.logger.error(`Error tracking feature usage for user ${userId}`, error, 'PremiumService');
      throw error;
    }
  }

  /**
   * Cancel premium subscription
   */
  async cancelSubscription(userId: string, reason?: string): Promise<boolean> {
    try {
      const subscription = await this.getPremiumSubscription(userId);
      if (!subscription) {
        throw new NotFoundException('No active premium subscription found');
      }

      const serviceClient = this.supabaseService.getServiceClient();
      const cancelledAt = new Date();

      // Update subscription status
      const { error } = await serviceClient
        .from('premium_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: cancelledAt.toISOString(),
          cancellation_reason: reason,
          updated_at: cancelledAt.toISOString(),
        })
        .eq('id', subscription.id);

      if (error) {
        this.logger.error(`Failed to cancel subscription for user ${userId}`, error, 'PremiumService');
        throw new BadRequestException('Failed to cancel subscription');
      }

      // Update user profile
      await serviceClient
        .from('user_profiles')
        .update({
          is_premium: false,
          premium_expires_at: null,
          updated_at: cancelledAt.toISOString(),
        })
        .eq('user_id', userId);

      // Audit log
      await this.auditLog({
        userId,
        subscriptionId: subscription.id,
        action: 'subscription_cancelled',
        entityType: 'subscription',
        entityId: subscription.id,
        oldValues: { status: 'active' },
        newValues: { status: 'cancelled', cancelledAt, reason },
        success: true,
        severity: 'info',
      });

      this.logger.log(`Premium subscription cancelled for user ${userId}`, 'PremiumService');
      return true;
    } catch (error) {
      this.logger.error(`Error cancelling subscription for user ${userId}`, error, 'PremiumService');
      throw error;
    }
  }

  /**
   * Expire a subscription (called by cron job)
   */
  async expireSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();

      // Get subscription details
      const { data: subscription, error: getError } = await serviceClient
        .from('premium_subscriptions')
        .select('*, user_profiles(user_id)')
        .eq('id', subscriptionId)
        .single();

      if (getError || !subscription) {
        this.logger.warn(`Subscription ${subscriptionId} not found for expiry`, 'PremiumService');
        return false;
      }

      // Update subscription status
      const { error } = await serviceClient
        .from('premium_subscriptions')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      if (error) {
        this.logger.error(`Failed to expire subscription ${subscriptionId}`, error, 'PremiumService');
        return false;
      }

      // Update user profile
      await serviceClient
        .from('user_profiles')
        .update({
          is_premium: false,
          premium_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', subscription.user_id);

      // Audit log
      await this.auditLog({
        userId: subscription.user_id,
        subscriptionId,
        action: 'subscription_expired',
        entityType: 'subscription',
        entityId: subscriptionId,
        oldValues: { status: 'active' },
        newValues: { status: 'expired' },
        success: true,
        severity: 'info',
      });

      this.logger.log(`Subscription ${subscriptionId} expired for user ${subscription.user_id}`, 'PremiumService');
      return true;
    } catch (error) {
      this.logger.error(`Error expiring subscription ${subscriptionId}`, error, 'PremiumService');
      return false;
    }
  }

  /**
   * Get all premium plans
   */
  async getPremiumPlans(): Promise<PremiumPlan[]> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();

      const { data: plans, error } = await serviceClient
        .from('premium_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_lamports', { ascending: true });

      if (error) {
        this.logger.error('Failed to get premium plans', error, 'PremiumService');
        return [];
      }

      return plans.map(plan => ({
        id: plan.id,
        planType: plan.plan_type,
        name: plan.name,
        description: plan.description,
        priceLamports: plan.price_lamports,
        priceSol: plan.price_sol,
        durationDays: plan.duration_days,
        features: plan.features,
        maxScansPerMonth: plan.max_scans_per_month,
        isActive: plan.is_active,
      }));
    } catch (error) {
      this.logger.error('Error getting premium plans', error, 'PremiumService');
      return [];
    }
  }

  /**
   * Check feature usage limit
   */
  private async checkFeatureUsageLimit(userId: string, subscriptionId: string, feature: string): Promise<{ allowed: boolean; reason?: string }> {
    // For unlimited features, always allow
    const unlimitedFeatures = ['unlimited_scans', 'ai_assistant', 'export_data'];
    if (unlimitedFeatures.includes(feature)) {
      return { allowed: true };
    }

    // Get current usage for this month
    const serviceClient = this.supabaseService.getServiceClient();
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: usage, error } = await serviceClient
      .from('premium_feature_usage')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('subscription_id', subscriptionId)
      .eq('feature_name', feature)
      .eq('period_start', periodStart.toISOString())
      .single();

    if (error && error.code !== 'PGRST116') {
      this.logger.error(`Failed to check feature usage limit for ${feature}`, error, 'PremiumService');
      return { allowed: true }; // Default to allow on error
    }

    // For now, all premium features are unlimited
    // This can be extended with specific limits per plan
    return { allowed: true };
  }

  /**
   * Format subscription data
   */
  private formatSubscription(subscription: any, plan?: any): PremiumSubscription {
    return {
      id: subscription.id,
      userId: subscription.user_id,
      planId: subscription.plan_id,
      paymentId: subscription.payment_id,
      status: subscription.status,
      startedAt: new Date(subscription.started_at),
      expiresAt: subscription.expires_at ? new Date(subscription.expires_at) : undefined,
      cancelledAt: subscription.cancelled_at ? new Date(subscription.cancelled_at) : undefined,
      cancellationReason: subscription.cancellation_reason,
      autoRenew: subscription.auto_renew,
      features: subscription.features || [],
      usageLimits: subscription.usage_limits || {},
      metadata: subscription.metadata || {},
      plan: plan ? {
        id: plan.id,
        planType: plan.plan_type,
        name: plan.name,
        description: plan.description,
        priceLamports: plan.price_lamports,
        priceSol: plan.price_sol,
        durationDays: plan.duration_days,
        features: plan.features,
        maxScansPerMonth: plan.max_scans_per_month,
        isActive: plan.is_active,
      } : undefined,
    };
  }

  /**
   * Audit logging helper
   */
  private async auditLog(params: {
    userId?: string;
    subscriptionId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: any;
    newValues?: any;
    success: boolean;
    errorMessage?: string;
    severity: 'debug' | 'info' | 'warn' | 'error' | 'critical';
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();

      await serviceClient
        .from('premium_audit_logs')
        .insert({
          user_id: params.userId,
          subscription_id: params.subscriptionId,
          action: params.action,
          entity_type: params.entityType,
          entity_id: params.entityId,
          old_values: params.oldValues,
          new_values: params.newValues,
          success: params.success,
          error_message: params.errorMessage,
          severity: params.severity,
          metadata: params.metadata || {},
        });
    } catch (error) {
      this.logger.error('Failed to write audit log', error, 'PremiumService');
      // Don't throw here to avoid breaking the main operation
    }
  }

  /**
   * Pay for premium with SOL from custodial wallet
   */
  async payPremiumWithSol(
    userId: string,
    walletId: string,
    planId: string,
  ): Promise<{ signature: string; expiresAt: string }> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();

      // Verify wallet ownership
      const { data: wallet, error: walletError } = await serviceClient
        .from('solana_wallets')
        .select('*')
        .eq('id', walletId)
        .eq('user_id', userId)
        .eq('is_custodial', true)
        .single();

      if (walletError || !wallet) {
        throw new BadRequestException('Wallet not found or not custodial');
      }

      // Get plan details
      const plan = await this.getPlanById(planId);
      if (!plan) {
        throw new BadRequestException('Invalid plan ID');
      }

      // Create payment through payments service
      const payment = await this.paymentsService.createPending({
        userId,
        walletId,
        type: 'premium',
        amountLamports: plan.priceLamports,
        idempotencyKey: `premium_${userId}_${Date.now()}`,
        metadata: {
          plan_id: planId,
          plan_type: plan.planType,
        },
      });

      // Confirm payment (this will send the transaction)
      const confirmation = await this.paymentsService.confirmPayment(payment.id);

      if (confirmation.status !== 'confirmed') {
        throw new BadRequestException(`Payment failed: ${confirmation.reason}`);
      }

      // Activate premium
      const expiresAt = plan.durationDays
        ? new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      await serviceClient
        .from('premium_subscriptions')
        .upsert({
          user_id: userId,
          plan_id: planId,
          payment_id: payment.id,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: expiresAt,
          auto_renew: false,
          features: plan.features,
          usage_limits: {},
          metadata: {},
        }, {
          onConflict: 'user_id',
        });

      this.logger.log(`Premium activated for user ${userId} via SOL payment`, 'PremiumService');

      return {
        signature: confirmation.ledgerEntryId || payment.id,
        expiresAt: expiresAt || 'lifetime',
      };
    } catch (error) {
      this.logger.error(`Premium SOL payment failed for user ${userId}:`, error, 'PremiumService');
      throw error;
    }
  }

  private async getPlanById(planId: string): Promise<PremiumPlan | null> {
    const serviceClient = this.supabaseService.getServiceClient();
    const { data } = await serviceClient
      .from('premium_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    return data || null;
  }
}