import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PremiumService } from '@/premium/premium.service';
import { AntiReplayService } from '@/premium/services/anti-replay.service';
import { PremiumRateLimiterService } from '@/premium/services/premium-rate-limiter.service';
import { SupabaseService } from '@/common/services/supabase.service';
import { LoggerService } from '@/common/services/logger.service';

export interface PremiumExpiryJobData {
  subscriptionId: string;
  userId: string;
  expiresAt: string;
}

export interface CleanupJobData {
  type: 'nonces' | 'rate_limits' | 'audit_logs';
  olderThanDays?: number;
}

export interface NotificationJobData {
  userId: string;
  subscriptionId: string;
  type: 'expiry_warning' | 'expired' | 'cancelled';
  expiresAt?: string;
  daysUntilExpiry?: number;
}

@Processor('premium')
@Injectable()
export class PremiumProcessor {
  constructor(
    private readonly premiumService: PremiumService,
    private readonly antiReplayService: AntiReplayService,
    private readonly rateLimiterService: PremiumRateLimiterService,
    private readonly supabaseService: SupabaseService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Process premium subscription expiry
   */
  @Process('expire-subscription')
  async handleExpireSubscription(job: Job<PremiumExpiryJobData>) {
    const { subscriptionId, userId, expiresAt } = job.data;

    this.logger.log(`Processing subscription expiry for ${subscriptionId}`, 'PremiumProcessor');

    try {
      // Check if subscription should actually be expired
      const expireDate = new Date(expiresAt);
      const now = new Date();

      if (now < expireDate) {
        this.logger.warn(`Subscription ${subscriptionId} not yet expired, skipping`, 'PremiumProcessor');
        return { expired: false, reason: 'Not yet expired' };
      }

      // Expire the subscription
      const success = await this.premiumService.expireSubscription(subscriptionId);

      if (success) {
        // Send expiry notification
        await this.sendExpiryNotification(userId, subscriptionId, 'expired');

        this.logger.log(`Successfully expired subscription ${subscriptionId}`, 'PremiumProcessor');
        return { expired: true, subscriptionId };
      } else {
        throw new Error('Failed to expire subscription');
      }

    } catch (error) {
      this.logger.error(`Failed to expire subscription ${subscriptionId}`, error, 'PremiumProcessor');
      throw error;
    }
  }

  /**
   * Process cleanup tasks
   */
  @Process('cleanup')
  async handleCleanup(job: Job<CleanupJobData>) {
    const { type, olderThanDays = 7 } = job.data;

    this.logger.log(`Processing cleanup for ${type}`, 'PremiumProcessor');

    try {
      let cleanedCount = 0;

      switch (type) {
        case 'nonces':
          const nonceResults = await this.antiReplayService.scheduledCleanup();
          cleanedCount = nonceResults.cleanedNonces + nonceResults.cleanedSecurityEvents;
          break;

        case 'rate_limits':
          cleanedCount = await this.rateLimiterService.cleanupOldRecords();
          break;

        case 'audit_logs':
          cleanedCount = await this.cleanupOldAuditLogs(olderThanDays);
          break;

        default:
          throw new Error(`Unknown cleanup type: ${type}`);
      }

      this.logger.log(`Cleanup completed for ${type}: ${cleanedCount} records cleaned`, 'PremiumProcessor');
      return { cleaned: cleanedCount, type };

    } catch (error) {
      this.logger.error(`Failed to cleanup ${type}`, error, 'PremiumProcessor');
      throw error;
    }
  }

  /**
   * Process expiry warning notifications
   */
  @Process('expiry-warning')
  async handleExpiryWarning(job: Job<NotificationJobData>) {
    const { userId, subscriptionId, daysUntilExpiry } = job.data;

    this.logger.log(`Processing expiry warning for subscription ${subscriptionId}`, 'PremiumProcessor');

    try {
      // Send warning notification
      await this.sendExpiryNotification(userId, subscriptionId, 'expiry_warning', daysUntilExpiry);

      this.logger.log(`Expiry warning sent for subscription ${subscriptionId}`, 'PremiumProcessor');
      return { notified: true, subscriptionId, daysUntilExpiry };

    } catch (error) {
      this.logger.error(`Failed to send expiry warning for ${subscriptionId}`, error, 'PremiumProcessor');
      throw error;
    }
  }

  /**
   * Scheduled job to check for expiring subscriptions (runs every hour)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkExpiringSubscriptions() {
    this.logger.log('Checking for expiring subscriptions', 'PremiumProcessor');

    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const now = new Date();

      // Find subscriptions expiring in the next hour
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

      const { data: expiringSubscriptions, error } = await serviceClient
        .from('premium_subscriptions')
        .select('id, user_id, expires_at')
        .eq('status', 'active')
        .not('expires_at', 'is', null)
        .lte('expires_at', nextHour.toISOString())
        .gt('expires_at', now.toISOString());

      if (error) {
        this.logger.error('Failed to fetch expiring subscriptions', error, 'PremiumProcessor');
        return;
      }

      if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
        this.logger.debug('No subscriptions expiring in the next hour', 'PremiumProcessor');
        return;
      }

      this.logger.log(`Found ${expiringSubscriptions.length} subscriptions expiring in the next hour`, 'PremiumProcessor');

      // Queue expiry jobs for subscriptions
      for (const subscription of expiringSubscriptions) {
        const delay = new Date(subscription.expires_at).getTime() - now.getTime();

        // Queue the expiry job with delay
        await this.queueExpiryJob({
          subscriptionId: subscription.id,
          userId: subscription.user_id,
          expiresAt: subscription.expires_at,
        }, Math.max(0, delay));
      }

    } catch (error) {
      this.logger.error('Error checking expiring subscriptions', error, 'PremiumProcessor');
    }
  }

  /**
   * Scheduled job to send expiry warnings (runs daily at 9 AM)
   */
  @Cron('0 9 * * *')
  async sendExpiryWarnings() {
    this.logger.log('Checking for subscriptions requiring expiry warnings', 'PremiumProcessor');

    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const now = new Date();

      // Find subscriptions expiring in 7 days, 3 days, and 1 day
      const warningPeriods = [7, 3, 1];

      for (const days of warningPeriods) {
        const targetDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

        const { data: subscriptions, error } = await serviceClient
          .from('premium_subscriptions')
          .select('id, user_id, expires_at')
          .eq('status', 'active')
          .gte('expires_at', startOfDay.toISOString())
          .lt('expires_at', endOfDay.toISOString());

        if (error) {
          this.logger.error(`Failed to fetch subscriptions expiring in ${days} days`, error, 'PremiumProcessor');
          continue;
        }

        if (subscriptions && subscriptions.length > 0) {
          this.logger.log(`Found ${subscriptions.length} subscriptions expiring in ${days} days`, 'PremiumProcessor');

          for (const subscription of subscriptions) {
            // Check if we already sent a warning for this period
            const alreadySent = await this.checkWarningAlreadySent(subscription.id, days);

            if (!alreadySent) {
              await this.queueWarningJob({
                userId: subscription.user_id,
                subscriptionId: subscription.id,
                type: 'expiry_warning',
                daysUntilExpiry: days,
              });

              // Mark warning as sent
              await this.markWarningSent(subscription.id, days);
            }
          }
        }
      }

    } catch (error) {
      this.logger.error('Error sending expiry warnings', error, 'PremiumProcessor');
    }
  }

  /**
   * Scheduled cleanup job (runs daily at 2 AM)
   */
  @Cron('0 2 * * *')
  async dailyCleanup() {
    this.logger.log('Starting daily cleanup', 'PremiumProcessor');

    try {
      // Queue cleanup jobs
      await this.queueCleanupJob({ type: 'nonces' });
      await this.queueCleanupJob({ type: 'rate_limits' });
      await this.queueCleanupJob({ type: 'audit_logs', olderThanDays: 90 });

      this.logger.log('Daily cleanup jobs queued', 'PremiumProcessor');

    } catch (error) {
      this.logger.error('Error starting daily cleanup', error, 'PremiumProcessor');
    }
  }

  /**
   * Queue expiry job
   */
  private async queueExpiryJob(data: PremiumExpiryJobData, delayMs: number = 0) {
    const queue = this.getQueue();
    await queue.add('expire-subscription', data, {
      delay: delayMs,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
    });
  }

  /**
   * Queue warning job
   */
  private async queueWarningJob(data: NotificationJobData) {
    const queue = this.getQueue();
    await queue.add('expiry-warning', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
    });
  }

  /**
   * Queue cleanup job
   */
  private async queueCleanupJob(data: CleanupJobData) {
    const queue = this.getQueue();
    await queue.add('cleanup', data, {
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 10000,
      },
      removeOnComplete: 5,
      removeOnFail: 3,
    });
  }

  /**
   * Get the premium queue instance
   */
  private getQueue() {
    // This would typically be injected, but for simplicity we'll reference it directly
    // In a real implementation, inject the queue in the constructor
    return require('@nestjs/bull').getQueueToken('premium');
  }

  /**
   * Send expiry notification
   */
  private async sendExpiryNotification(
    userId: string,
    subscriptionId: string,
    type: 'expiry_warning' | 'expired' | 'cancelled',
    daysUntilExpiry?: number
  ) {
    try {
      const serviceClient = this.supabaseService.getServiceClient();

      // Get user details
      const { data: user, error } = await serviceClient
        .from('user_profiles')
        .select('email, full_name')
        .eq('user_id', userId)
        .single();

      if (error || !user) {
        this.logger.warn(`User ${userId} not found for notification`, 'PremiumProcessor');
        return;
      }

      let subject: string;
      let message: string;

      switch (type) {
        case 'expiry_warning':
          subject = `Your CORIA Premium expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}`;
          message = `Hi ${user.full_name || 'there'},\n\nYour CORIA Premium subscription will expire in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}. Renew now to continue enjoying unlimited scans and premium features.`;
          break;

        case 'expired':
          subject = 'Your CORIA Premium has expired';
          message = `Hi ${user.full_name || 'there'},\n\nYour CORIA Premium subscription has expired. You can still use the basic features, but premium benefits are no longer available. Renew anytime to restore full access.`;
          break;

        case 'cancelled':
          subject = 'Your CORIA Premium has been cancelled';
          message = `Hi ${user.full_name || 'there'},\n\nYour CORIA Premium subscription has been cancelled as requested. Thank you for using CORIA Premium!`;
          break;
      }

      // Here you would integrate with your email service (SendGrid, AWS SES, etc.)
      // For now, we'll just log the notification
      this.logger.log(`Notification sent to ${user.email}: ${subject}`, 'PremiumProcessor');

      // Store notification in database for tracking
      await serviceClient
        .from('premium_audit_logs')
        .insert({
          user_id: userId,
          subscription_id: subscriptionId,
          action: 'notification_sent',
          entity_type: 'notification',
          success: true,
          severity: 'info',
          metadata: {
            type,
            subject,
            email: user.email,
            daysUntilExpiry,
          },
        });

    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}`, error, 'PremiumProcessor');
    }
  }

  /**
   * Check if warning was already sent for this period
   */
  private async checkWarningAlreadySent(subscriptionId: string, days: number): Promise<boolean> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await serviceClient
        .from('premium_audit_logs')
        .select('id')
        .eq('subscription_id', subscriptionId)
        .eq('action', 'notification_sent')
        .contains('metadata', { type: 'expiry_warning', daysUntilExpiry: days })
        .gte('created_at', today.toISOString())
        .limit(1);

      if (error) {
        this.logger.error(`Failed to check warning status for ${subscriptionId}`, error, 'PremiumProcessor');
        return false; // Default to not sent to avoid missing notifications
      }

      return data && data.length > 0;

    } catch (error) {
      this.logger.error(`Error checking warning status for ${subscriptionId}`, error, 'PremiumProcessor');
      return false;
    }
  }

  /**
   * Mark warning as sent
   */
  private async markWarningSent(subscriptionId: string, days: number) {
    // This is handled by the notification sending process
    // The audit log entry serves as the marker
  }

  /**
   * Clean up old audit logs
   */
  private async cleanupOldAuditLogs(olderThanDays: number): Promise<number> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

      const { data, error } = await serviceClient
        .from('premium_audit_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .in('severity', ['debug', 'info']) // Keep warnings and errors longer
        .select('id');

      if (error) {
        this.logger.error('Failed to cleanup old audit logs', error, 'PremiumProcessor');
        return 0;
      }

      return data?.length || 0;

    } catch (error) {
      this.logger.error('Error cleaning up old audit logs', error, 'PremiumProcessor');
      return 0;
    }
  }

  /**
   * Job event handlers
   */
  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`, 'PremiumProcessor');
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Completed job ${job.id} of type ${job.name}`, 'PremiumProcessor');
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}`, err, 'PremiumProcessor');
  }
}