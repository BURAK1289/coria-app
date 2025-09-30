import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@/common/services/supabase.service';
import { LoggerService } from '@/common/services/logger.service';

export interface RateLimitConfig {
  operation: string;
  tier: 'free' | 'premium' | 'admin';
  windowMinutes: number;
  maxRequests: number;
  burstAllowance?: number; // Additional requests allowed in burst
}

export interface CheckRateLimitDto {
  userId?: string;
  identifier?: string; // IP address or custom identifier
  operation: string;
  tier: 'free' | 'premium' | 'admin';
  limitType?: 'user' | 'ip' | 'global';
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  totalLimit: number;
  windowStart: Date;
  windowEnd: Date;
}

@Injectable()
export class PremiumRateLimiterService {
  private readonly defaultConfigs: Record<string, RateLimitConfig[]> = {
    // Premium activation operations
    'activate_premium': [
      { operation: 'activate_premium', tier: 'free', windowMinutes: 60, maxRequests: 3, burstAllowance: 1 },
      { operation: 'activate_premium', tier: 'premium', windowMinutes: 60, maxRequests: 5, burstAllowance: 2 },
      { operation: 'activate_premium', tier: 'admin', windowMinutes: 60, maxRequests: 50, burstAllowance: 10 },
    ],

    // Premium feature access checks
    'check_access': [
      { operation: 'check_access', tier: 'free', windowMinutes: 1, maxRequests: 10 },
      { operation: 'check_access', tier: 'premium', windowMinutes: 1, maxRequests: 100 },
      { operation: 'check_access', tier: 'admin', windowMinutes: 1, maxRequests: 1000 },
    ],

    // Feature usage tracking
    'track_usage': [
      { operation: 'track_usage', tier: 'free', windowMinutes: 1, maxRequests: 20 },
      { operation: 'track_usage', tier: 'premium', windowMinutes: 1, maxRequests: 500 },
      { operation: 'track_usage', tier: 'admin', windowMinutes: 1, maxRequests: 2000 },
    ],

    // Nonce generation
    'generate_nonce': [
      { operation: 'generate_nonce', tier: 'free', windowMinutes: 5, maxRequests: 10 },
      { operation: 'generate_nonce', tier: 'premium', windowMinutes: 5, maxRequests: 50 },
      { operation: 'generate_nonce', tier: 'admin', windowMinutes: 5, maxRequests: 200 },
    ],

    // Subscription management
    'subscription_management': [
      { operation: 'subscription_management', tier: 'free', windowMinutes: 10, maxRequests: 5 },
      { operation: 'subscription_management', tier: 'premium', windowMinutes: 10, maxRequests: 20 },
      { operation: 'subscription_management', tier: 'admin', windowMinutes: 10, maxRequests: 100 },
    ],

    // Payment operations
    'payment_operations': [
      { operation: 'payment_operations', tier: 'free', windowMinutes: 60, maxRequests: 10 },
      { operation: 'payment_operations', tier: 'premium', windowMinutes: 60, maxRequests: 50 },
      { operation: 'payment_operations', tier: 'admin', windowMinutes: 60, maxRequests: 200 },
    ],
  };

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Check if request is within rate limits
   */
  async checkRateLimit(dto: CheckRateLimitDto): Promise<RateLimitResult> {
    const { userId, identifier, operation, tier, limitType = 'user' } = dto;

    try {
      // Get rate limit configuration
      const config = this.getRateLimitConfig(operation, tier);
      if (!config) {
        // If no config found, default to allow with warning
        this.logger.warn(`No rate limit config found for operation ${operation}, tier ${tier}`, 'PremiumRateLimiterService');
        return this.createDefaultAllowedResult();
      }

      // Determine identifier for rate limiting
      const limitIdentifier = this.getLimitIdentifier(userId, identifier, limitType);

      // Calculate window boundaries
      const now = new Date();
      const windowStart = new Date(now.getTime() - (now.getTime() % (config.windowMinutes * 60 * 1000)));
      const windowEnd = new Date(windowStart.getTime() + config.windowMinutes * 60 * 1000);

      // Get or create rate limit record
      const currentUsage = await this.getCurrentUsage(limitIdentifier, operation, windowStart, windowEnd, tier);

      // Check if request exceeds limit
      const totalLimit = config.maxRequests + (config.burstAllowance || 0);
      const isAllowed = currentUsage < totalLimit;

      if (isAllowed) {
        // Increment usage
        await this.incrementUsage(limitIdentifier, operation, windowStart, windowEnd, tier, userId);
      } else {
        // Log rate limit exceeded
        await this.logRateLimitExceeded(userId, identifier, operation, tier, currentUsage, totalLimit);
      }

      return {
        allowed: isAllowed,
        remaining: Math.max(0, totalLimit - currentUsage - (isAllowed ? 1 : 0)),
        resetTime: windowEnd,
        totalLimit,
        windowStart,
        windowEnd,
      };

    } catch (error) {
      this.logger.error(`Error checking rate limit for operation ${operation}`, error, 'PremiumRateLimiterService');

      // On error, default to allowing the request but log the issue
      return this.createDefaultAllowedResult();
    }
  }

  /**
   * Get current usage for a rate limit window
   */
  private async getCurrentUsage(
    identifier: string,
    operation: string,
    windowStart: Date,
    windowEnd: Date,
    tier: string
  ): Promise<number> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();

      const { data, error } = await serviceClient
        .from('rate_limits')
        .select('request_count')
        .eq('identifier', identifier)
        .eq('operation', operation)
        .eq('window_start', windowStart.toISOString())
        .eq('tier', tier)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        this.logger.error(`Failed to get current usage for ${identifier}`, error, 'PremiumRateLimiterService');
        return 0;
      }

      return data?.request_count || 0;

    } catch (error) {
      this.logger.error(`Error getting current usage for ${identifier}`, error, 'PremiumRateLimiterService');
      return 0;
    }
  }

  /**
   * Increment usage count for rate limit window
   */
  private async incrementUsage(
    identifier: string,
    operation: string,
    windowStart: Date,
    windowEnd: Date,
    tier: string,
    userId?: string
  ): Promise<void> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();

      // Use upsert to handle concurrent requests
      const { error } = await serviceClient
        .rpc('upsert_rate_limit', {
          p_identifier: identifier,
          p_operation: operation,
          p_window_start: windowStart.toISOString(),
          p_window_end: windowEnd.toISOString(),
          p_tier: tier,
          p_user_id: userId,
          p_increment: 1,
        });

      if (error) {
        this.logger.error(`Failed to increment usage for ${identifier}`, error, 'PremiumRateLimiterService');
      }

    } catch (error) {
      this.logger.error(`Error incrementing usage for ${identifier}`, error, 'PremiumRateLimiterService');
    }
  }

  /**
   * Get rate limit configuration for operation and tier
   */
  private getRateLimitConfig(operation: string, tier: string): RateLimitConfig | null {
    // First, try exact operation match
    const configs = this.defaultConfigs[operation];
    if (configs) {
      const config = configs.find(c => c.tier === tier);
      if (config) return config;
    }

    // Then try operation category matching
    const categoryMappings: Record<string, string> = {
      'activate_premium': 'activate_premium',
      'cancel_subscription': 'subscription_management',
      'get_subscription': 'subscription_management',
      'check_premium_access': 'check_access',
      'track_feature_usage': 'track_usage',
      'generate_nonce': 'generate_nonce',
      'create_payment': 'payment_operations',
      'confirm_payment': 'payment_operations',
    };

    const category = categoryMappings[operation];
    if (category && this.defaultConfigs[category]) {
      const config = this.defaultConfigs[category].find(c => c.tier === tier);
      if (config) return { ...config, operation }; // Override operation name
    }

    return null;
  }

  /**
   * Generate identifier for rate limiting
   */
  private getLimitIdentifier(userId?: string, identifier?: string, limitType: string = 'user'): string {
    switch (limitType) {
      case 'user':
        return userId || identifier || 'anonymous';
      case 'ip':
        return identifier || 'unknown_ip';
      case 'global':
        return 'global';
      default:
        return userId || identifier || 'anonymous';
    }
  }

  /**
   * Log rate limit exceeded event
   */
  private async logRateLimitExceeded(
    userId?: string,
    identifier?: string,
    operation?: string,
    tier?: string,
    currentUsage?: number,
    limit?: number
  ): Promise<void> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();

      // Log as security event
      await serviceClient
        .from('security_events')
        .insert({
          user_id: userId,
          event_type: 'rate_limit_exceeded',
          severity: 'medium',
          description: `Rate limit exceeded for operation: ${operation}`,
          risk_score: 40,
          metadata: {
            operation,
            tier,
            currentUsage,
            limit,
            identifier,
          },
        });

      this.logger.warn(
        `Rate limit exceeded for ${tier || 'user'} ${identifier || userId}: ${operation} (${currentUsage}/${limit})`,
        'PremiumRateLimiterService'
      );

    } catch (error) {
      this.logger.error('Failed to log rate limit exceeded event', error, 'PremiumRateLimiterService');
    }
  }

  /**
   * Create default allowed result for error cases
   */
  private createDefaultAllowedResult(): RateLimitResult {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    return {
      allowed: true,
      remaining: 1000, // High number to indicate no limit
      resetTime: windowEnd,
      totalLimit: 1000,
      windowStart: now,
      windowEnd,
    };
  }

  /**
   * Clean up old rate limit records
   */
  async cleanupOldRecords(): Promise<number> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();

      // Remove records older than 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const { data, error } = await serviceClient
        .from('rate_limits')
        .delete()
        .lt('window_end', oneDayAgo.toISOString())
        .select('id');

      if (error) {
        this.logger.error('Failed to cleanup old rate limit records', error, 'PremiumRateLimiterService');
        return 0;
      }

      const cleanedCount = data?.length || 0;
      if (cleanedCount > 0) {
        this.logger.log(`Cleaned up ${cleanedCount} old rate limit records`, 'PremiumRateLimiterService');
      }

      return cleanedCount;

    } catch (error) {
      this.logger.error('Error cleaning up old rate limit records', error, 'PremiumRateLimiterService');
      return 0;
    }
  }

  /**
   * Get rate limit statistics for monitoring
   */
  async getRateLimitStatistics(): Promise<{
    totalActiveWindows: number;
    topOperations: Array<{ operation: string; requests: number }>;
    topUsers: Array<{ userId: string; requests: number }>;
    tierDistribution: Record<string, number>;
  }> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      // Get total active windows
      const { count: totalActiveWindows } = await serviceClient
        .from('rate_limits')
        .select('id', { count: 'exact' })
        .gt('window_end', oneHourAgo.toISOString());

      // Get top operations by request count
      const { data: operationsData } = await serviceClient
        .from('rate_limits')
        .select('operation, request_count')
        .gt('window_end', oneHourAgo.toISOString())
        .order('request_count', { ascending: false })
        .limit(10);

      // Get top users by request count
      const { data: usersData } = await serviceClient
        .from('rate_limits')
        .select('user_id, request_count')
        .not('user_id', 'is', null)
        .gt('window_end', oneHourAgo.toISOString())
        .order('request_count', { ascending: false })
        .limit(10);

      // Get tier distribution
      const { data: tierData } = await serviceClient
        .from('rate_limits')
        .select('tier, request_count')
        .gt('window_end', oneHourAgo.toISOString());

      // Process the data
      const operationCounts = new Map<string, number>();
      operationsData?.forEach(row => {
        const current = operationCounts.get(row.operation) || 0;
        operationCounts.set(row.operation, current + row.request_count);
      });

      const userCounts = new Map<string, number>();
      usersData?.forEach(row => {
        const current = userCounts.get(row.user_id) || 0;
        userCounts.set(row.user_id, current + row.request_count);
      });

      const tierCounts: Record<string, number> = {};
      tierData?.forEach(row => {
        tierCounts[row.tier] = (tierCounts[row.tier] || 0) + row.request_count;
      });

      return {
        totalActiveWindows: totalActiveWindows || 0,
        topOperations: Array.from(operationCounts.entries()).map(([operation, requests]) => ({
          operation,
          requests,
        })),
        topUsers: Array.from(userCounts.entries()).map(([userId, requests]) => ({
          userId,
          requests,
        })),
        tierDistribution: tierCounts,
      };

    } catch (error) {
      this.logger.error('Error getting rate limit statistics', error, 'PremiumRateLimiterService');
      return {
        totalActiveWindows: 0,
        topOperations: [],
        topUsers: [],
        tierDistribution: {},
      };
    }
  }

  /**
   * Reset rate limits for a user (admin function)
   */
  async resetUserRateLimits(userId: string, operation?: string): Promise<boolean> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();

      let query = serviceClient
        .from('rate_limits')
        .delete()
        .eq('user_id', userId);

      if (operation) {
        query = query.eq('operation', operation);
      }

      const { error } = await query;

      if (error) {
        this.logger.error(`Failed to reset rate limits for user ${userId}`, error, 'PremiumRateLimiterService');
        return false;
      }

      this.logger.log(`Reset rate limits for user ${userId}${operation ? ` operation ${operation}` : ''}`, 'PremiumRateLimiterService');
      return true;

    } catch (error) {
      this.logger.error(`Error resetting rate limits for user ${userId}`, error, 'PremiumRateLimiterService');
      return false;
    }
  }
}