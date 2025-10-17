/**
 * Rate Limiter for Foundation Applications
 *
 * Implements IP-based rate limiting to prevent abuse.
 * Supports in-memory storage (dev/small scale) and Redis (production scale).
 *
 * Limits:
 * - 5 requests per minute per IP
 * - 50 requests per day per IP
 */

import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import type { RateLimiterAbstract } from 'rate-limiter-flexible';

// Configuration
const RATE_LIMIT_ENABLED = process.env.RATE_LIMIT !== 'false';
const REQUESTS_PER_MINUTE = 5;
const REQUESTS_PER_DAY = 50;
const BLOCK_DURATION = 15 * 60; // 15 minutes in seconds

// Rate limiters
let minuteLimiter: RateLimiterAbstract;
let dayLimiter: RateLimiterAbstract;

// Initialize rate limiters
function initializeRateLimiters() {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    // Production: Use Redis for distributed rate limiting
    try {
      const Redis = require('ioredis');
      const redisClient = new Redis(redisUrl, {
        enableOfflineQueue: false,
      });

      minuteLimiter = new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: 'foundation_rl_min',
        points: REQUESTS_PER_MINUTE,
        duration: 60, // per minute
        blockDuration: BLOCK_DURATION,
      });

      dayLimiter = new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: 'foundation_rl_day',
        points: REQUESTS_PER_DAY,
        duration: 24 * 60 * 60, // per day
        blockDuration: BLOCK_DURATION,
      });

      console.log('[RateLimit] Initialized with Redis');
    } catch (error) {
      console.warn('[RateLimit] Redis initialization failed, falling back to memory');
      initializeMemoryLimiters();
    }
  } else {
    // Development/Small scale: Use in-memory rate limiting
    initializeMemoryLimiters();
  }
}

function initializeMemoryLimiters() {
  minuteLimiter = new RateLimiterMemory({
    keyPrefix: 'foundation_rl_min',
    points: REQUESTS_PER_MINUTE,
    duration: 60,
    blockDuration: BLOCK_DURATION,
  });

  dayLimiter = new RateLimiterMemory({
    keyPrefix: 'foundation_rl_day',
    points: REQUESTS_PER_DAY,
    duration: 24 * 60 * 60,
    blockDuration: BLOCK_DURATION,
  });

  console.log('[RateLimit] Initialized with in-memory storage');
}

// Initialize on module load
if (RATE_LIMIT_ENABLED) {
  initializeRateLimiters();
}

/**
 * Extract IP address from request
 */
export function getClientIp(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to connection remote address (not available in edge runtime)
  return 'unknown';
}

/**
 * Check rate limit for an IP address
 */
export async function checkRateLimit(
  ip: string
): Promise<{
  success: boolean;
  retryAfter?: number;
  remaining?: number;
  limit?: number;
}> {
  if (!RATE_LIMIT_ENABLED) {
    return { success: true };
  }

  try {
    // Check minute limit
    const minuteResult = await minuteLimiter.consume(ip, 1);

    // Check day limit
    const dayResult = await dayLimiter.consume(ip, 1);

    return {
      success: true,
      remaining: Math.min(minuteResult.remainingPoints, dayResult.remainingPoints),
      limit: REQUESTS_PER_MINUTE,
    };
  } catch (rateLimiterRes: any) {
    // Rate limit exceeded
    const retryAfterMs = rateLimiterRes?.msBeforeNext || BLOCK_DURATION * 1000;
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

    return {
      success: false,
      retryAfter: retryAfterSeconds,
      remaining: 0,
      limit: REQUESTS_PER_MINUTE,
    };
  }
}

/**
 * Reset rate limit for an IP (admin use only)
 */
export async function resetRateLimit(ip: string): Promise<void> {
  if (!RATE_LIMIT_ENABLED) {
    return;
  }

  try {
    await minuteLimiter.delete(ip);
    await dayLimiter.delete(ip);
    console.log(`[RateLimit] Reset limits for IP: ${ip}`);
  } catch (error) {
    console.error(`[RateLimit] Error resetting limit for IP ${ip}:`, error);
    throw error;
  }
}

/**
 * Get current rate limit status for an IP
 */
export async function getRateLimitStatus(ip: string): Promise<{
  minuteRemaining: number;
  dayRemaining: number;
  minuteLimit: number;
  dayLimit: number;
}> {
  if (!RATE_LIMIT_ENABLED) {
    return {
      minuteRemaining: REQUESTS_PER_MINUTE,
      dayRemaining: REQUESTS_PER_DAY,
      minuteLimit: REQUESTS_PER_MINUTE,
      dayLimit: REQUESTS_PER_DAY,
    };
  }

  try {
    const minuteRes = await minuteLimiter.get(ip);
    const dayRes = await dayLimiter.get(ip);

    return {
      minuteRemaining: minuteRes?.remainingPoints ?? REQUESTS_PER_MINUTE,
      dayRemaining: dayRes?.remainingPoints ?? REQUESTS_PER_DAY,
      minuteLimit: REQUESTS_PER_MINUTE,
      dayLimit: REQUESTS_PER_DAY,
    };
  } catch (error) {
    console.error(`[RateLimit] Error getting status for IP ${ip}:`, error);
    throw error;
  }
}

/**
 * Hash IP address for privacy (one-way hash for logging)
 */
export function hashIp(ip: string): string {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(ip + process.env.RATE_LIMIT_SALT || 'coria-foundation-salt')
    .digest('hex')
    .substring(0, 16);
}
