import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StructuredLoggerService } from './structured-logger.service';
import { SupabaseService } from './supabase.service';

interface TokenBucket {
  tokens: number;
  capacity: number;
  refillRate: number; // tokens per second
  lastRefill: number;
  blocked: boolean;
  blockUntil?: number;
}

interface RateLimitConfig {
  capacity: number;
  refillRate: number;
  burstCapacity?: number; // Allow burst up to this many tokens
  blockDuration?: number; // Block duration in seconds when limit exceeded
  enabled: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number; // seconds to wait before retry
}

export interface RateLimitOptions {
  identifier: string; // User ID, IP, API key, etc.
  operation: string; // scan, payment, api_call, etc.
  cost?: number; // Token cost for this operation (default: 1)
  tier?: string; // premium, free, etc.
}

@Injectable()
export class TokenBucketRateLimiterService implements OnModuleInit {
  private buckets = new Map<string, TokenBucket>();
  private configs = new Map<string, RateLimitConfig>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: StructuredLoggerService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async onModuleInit() {
    this.initializeDefaultConfigs();
    this.startCleanupTask();
    await this.loadPersistedBuckets();
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private initializeDefaultConfigs() {
    // Default rate limit configurations
    const configs: Array<[string, RateLimitConfig]> = [
      // Scanner operations
      ['scan:free', { capacity: 10, refillRate: 0.1, burstCapacity: 5, blockDuration: 60, enabled: true }],
      ['scan:premium', { capacity: 100, refillRate: 1, burstCapacity: 50, blockDuration: 30, enabled: true }],

      // Payment operations
      ['payment:free', { capacity: 5, refillRate: 0.05, burstCapacity: 2, blockDuration: 300, enabled: true }],
      ['payment:premium', { capacity: 50, refillRate: 0.5, burstCapacity: 25, blockDuration: 120, enabled: true }],

      // API calls
      ['api:free', { capacity: 100, refillRate: 1, burstCapacity: 50, blockDuration: 60, enabled: true }],
      ['api:premium', { capacity: 1000, refillRate: 10, burstCapacity: 500, blockDuration: 30, enabled: true }],

      // Authentication attempts
      ['auth:login', { capacity: 5, refillRate: 0.1, burstCapacity: 3, blockDuration: 900, enabled: true }],
      ['auth:register', { capacity: 3, refillRate: 0.05, burstCapacity: 1, blockDuration: 1800, enabled: true }],

      // Service role operations (very restrictive)
      ['service_role:admin', { capacity: 10, refillRate: 0.1, burstCapacity: 5, blockDuration: 300, enabled: true }],
    ];

    configs.forEach(([key, config]) => {
      this.configs.set(key, config);
    });

    this.logger.logWithMetadata('info', 'Token bucket rate limiter initialized', {
      configCount: configs.length,
      configs: Object.fromEntries(configs),
    }, 'TokenBucketRateLimiter');
  }

  /**
   * Check rate limit and consume tokens if allowed
   */
  async checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
    const { identifier, operation, cost = 1, tier = 'free' } = options;
    const configKey = `${operation}:${tier}`;
    const bucketKey = `${identifier}:${configKey}`;

    const config = this.configs.get(configKey);
    if (!config || !config.enabled) {
      // No rate limiting configured, allow the request
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now() + 60000,
      };
    }

    const bucket = this.getOrCreateBucket(bucketKey, config);
    this.refillBucket(bucket, config);

    // Check if bucket is blocked
    if (bucket.blocked && bucket.blockUntil && Date.now() < bucket.blockUntil) {
      const retryAfter = Math.ceil((bucket.blockUntil - Date.now()) / 1000);

      this.logger.logRateLimit('limit_exceeded', identifier, operation, 0, config.capacity, {
        bucketKey,
        retryAfter,
        blocked: true,
      });

      return {
        allowed: false,
        remaining: 0,
        resetTime: bucket.blockUntil,
        retryAfter,
      };
    }

    // Check if enough tokens available
    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;

      // Log warning if tokens are running low
      const utilizationPercent = ((config.capacity - bucket.tokens) / config.capacity) * 100;
      if (utilizationPercent > 80) {
        this.logger.logRateLimit('limit_warning', identifier, operation,
          config.capacity - bucket.tokens, config.capacity, {
            bucketKey,
            utilizationPercent,
            tokensRemaining: bucket.tokens,
          });
      }

      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetTime: this.calculateResetTime(bucket, config),
      };
    } else {
      // Rate limit exceeded - block the bucket
      if (config.blockDuration) {
        bucket.blocked = true;
        bucket.blockUntil = Date.now() + (config.blockDuration * 1000);
      }

      this.logger.logRateLimit('limit_exceeded', identifier, operation,
        config.capacity - bucket.tokens, config.capacity, {
          bucketKey,
          tokensRequested: cost,
          tokensAvailable: bucket.tokens,
          blocked: bucket.blocked,
          blockDuration: config.blockDuration,
        });

      // Persist the rate limit violation
      await this.persistRateLimitViolation(identifier, operation, tier, config);

      const retryAfter = config.blockDuration || 60;
      return {
        allowed: false,
        remaining: 0,
        resetTime: bucket.blockUntil || Date.now() + (retryAfter * 1000),
        retryAfter,
      };
    }
  }

  /**
   * Get bucket status without consuming tokens
   */
  async getBucketStatus(identifier: string, operation: string, tier = 'free'): Promise<RateLimitResult> {
    const configKey = `${operation}:${tier}`;
    const bucketKey = `${identifier}:${configKey}`;

    const config = this.configs.get(configKey);
    if (!config || !config.enabled) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now() + 60000,
      };
    }

    const bucket = this.getOrCreateBucket(bucketKey, config);
    this.refillBucket(bucket, config);

    if (bucket.blocked && bucket.blockUntil && Date.now() < bucket.blockUntil) {
      const retryAfter = Math.ceil((bucket.blockUntil - Date.now()) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: bucket.blockUntil,
        retryAfter,
      };
    }

    return {
      allowed: bucket.tokens >= 1,
      remaining: Math.floor(bucket.tokens),
      resetTime: this.calculateResetTime(bucket, config),
    };
  }

  /**
   * Reset rate limit for a specific identifier/operation
   */
  async resetRateLimit(identifier: string, operation: string, tier = 'free'): Promise<void> {
    const configKey = `${operation}:${tier}`;
    const bucketKey = `${identifier}:${configKey}`;

    this.buckets.delete(bucketKey);

    this.logger.logRateLimit('limit_reset', identifier, operation, 0, 0, {
      bucketKey,
      resetBy: 'admin',
    });
  }

  /**
   * Add rate limit configuration
   */
  setRateLimitConfig(operation: string, tier: string, config: RateLimitConfig): void {
    const configKey = `${operation}:${tier}`;
    this.configs.set(configKey, config);

    this.logger.logWithMetadata('info', 'Rate limit configuration updated', {
      configKey,
      config,
    }, 'TokenBucketRateLimiter');
  }

  /**
   * Get rate limit statistics
   */
  async getRateLimitStats(identifier?: string): Promise<any> {
    const stats = {
      totalBuckets: this.buckets.size,
      blockedBuckets: 0,
      bucketDetails: [] as any[],
    };

    for (const [bucketKey, bucket] of this.buckets.entries()) {
      if (bucket.blocked) {
        stats.blockedBuckets++;
      }

      if (!identifier || bucketKey.startsWith(identifier)) {
        stats.bucketDetails.push({
          key: bucketKey,
          tokens: Math.floor(bucket.tokens),
          capacity: bucket.capacity,
          blocked: bucket.blocked,
          blockUntil: bucket.blockUntil,
          utilizationPercent: Math.round(((bucket.capacity - bucket.tokens) / bucket.capacity) * 100),
        });
      }
    }

    return stats;
  }

  // Private helper methods

  private getOrCreateBucket(bucketKey: string, config: RateLimitConfig): TokenBucket {
    let bucket = this.buckets.get(bucketKey);

    if (!bucket) {
      bucket = {
        tokens: config.capacity,
        capacity: config.capacity,
        refillRate: config.refillRate,
        lastRefill: Date.now(),
        blocked: false,
      };
      this.buckets.set(bucketKey, bucket);
    }

    return bucket;
  }

  private refillBucket(bucket: TokenBucket, config: RateLimitConfig): void {
    const now = Date.now();
    const timePassed = (now - bucket.lastRefill) / 1000; // seconds
    const tokensToAdd = timePassed * config.refillRate;

    bucket.tokens = Math.min(config.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Clear blocked status if block period has expired
    if (bucket.blocked && bucket.blockUntil && now >= bucket.blockUntil) {
      bucket.blocked = false;
      bucket.blockUntil = undefined;
    }
  }

  private calculateResetTime(bucket: TokenBucket, config: RateLimitConfig): number {
    if (bucket.tokens >= config.capacity) {
      return Date.now() + 60000; // Already full, reset in 1 minute
    }

    const tokensNeeded = config.capacity - bucket.tokens;
    const timeToFill = (tokensNeeded / config.refillRate) * 1000;
    return Date.now() + timeToFill;
  }

  private async persistRateLimitViolation(
    identifier: string,
    operation: string,
    tier: string,
    config: RateLimitConfig
  ): Promise<void> {
    try {
      const { error } = await this.supabaseService.getServiceClient()
        .from('rate_limit_violations')
        .insert({
          identifier,
          operation,
          tier,
          capacity: config.capacity,
          refill_rate: config.refillRate,
          block_duration: config.blockDuration,
          violated_at: new Date().toISOString(),
        });

      if (error) {
        this.logger.error('Failed to persist rate limit violation', error, 'TokenBucketRateLimiter');
      }
    } catch (error) {
      this.logger.error('Error persisting rate limit violation', error, 'TokenBucketRateLimiter');
    }
  }

  private async loadPersistedBuckets(): Promise<void> {
    try {
      // Load recent rate limit violations to reconstruct blocked buckets
      const { data: violations, error } = await this.supabaseService.getServiceClient()
        .from('rate_limit_violations')
        .select('*')
        .gte('violated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('violated_at', { ascending: false });

      if (error) {
        this.logger.error('Failed to load persisted rate limit data', error, 'TokenBucketRateLimiter');
        return;
      }

      let restoredCount = 0;
      for (const violation of violations || []) {
        const configKey = `${violation.operation}:${violation.tier}`;
        const bucketKey = `${violation.identifier}:${configKey}`;

        const violatedAt = new Date(violation.violated_at).getTime();
        const blockDuration = violation.block_duration * 1000;
        const blockUntil = violatedAt + blockDuration;

        // Only restore if still within block period
        if (Date.now() < blockUntil) {
          const config = this.configs.get(configKey);
          if (config) {
            const bucket = this.getOrCreateBucket(bucketKey, config);
            bucket.blocked = true;
            bucket.blockUntil = blockUntil;
            restoredCount++;
          }
        }
      }

      this.logger.logWithMetadata('info', 'Rate limit buckets restored from persistence', {
        restoredCount,
        totalViolations: violations?.length || 0,
      }, 'TokenBucketRateLimiter');

    } catch (error) {
      this.logger.error('Error loading persisted rate limit data', error, 'TokenBucketRateLimiter');
    }
  }

  private startCleanupTask(): void {
    // Clean up old buckets every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldBuckets();
    }, 5 * 60 * 1000);
  }

  private cleanupOldBuckets(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    let cleanedCount = 0;

    for (const [bucketKey, bucket] of this.buckets.entries()) {
      const age = now - bucket.lastRefill;
      const isBlocked = bucket.blocked && bucket.blockUntil && now < bucket.blockUntil;

      // Remove buckets that are old and not blocked
      if (age > maxAge && !isBlocked) {
        this.buckets.delete(bucketKey);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.logWithMetadata('debug', 'Cleaned up old rate limit buckets', {
        cleanedCount,
        remainingBuckets: this.buckets.size,
      }, 'TokenBucketRateLimiter');
    }
  }
}