import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PremiumRateLimiterService } from '../services/premium-rate-limiter.service';
import { LoggerService } from '@/common/services/logger.service';

// Decorator to configure rate limiting for specific endpoints
export const RateLimit = (config: {
  operation: string;
  limitType?: 'user' | 'ip' | 'global';
}) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata('rate-limit-config', config, descriptor.value);
    }
  };
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimiterService: PremiumRateLimiterService,
    private readonly logger: LoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get rate limit configuration from metadata
    const rateLimitConfig = this.reflector.get<{
      operation: string;
      limitType?: 'user' | 'ip' | 'global';
    }>('rate-limit-config', context.getHandler());

    if (!rateLimitConfig) {
      // No rate limiting configured, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const user = request.user;

    // Determine user tier
    let tier: 'free' | 'premium' | 'admin' = 'free';

    if (user) {
      // Check if user has premium subscription
      if (request.premiumSubscription?.status === 'active') {
        tier = 'premium';
      }

      // Check if user is admin (you can implement admin role check here)
      if (user.role === 'admin') {
        tier = 'admin';
      }
    }

    // Get identifier for rate limiting
    const identifier = this.getIdentifier(request, rateLimitConfig.limitType || 'user');

    try {
      // Check rate limit
      const rateLimitResult = await this.rateLimiterService.checkRateLimit({
        userId: user?.id,
        identifier,
        operation: rateLimitConfig.operation,
        tier,
        limitType: rateLimitConfig.limitType || 'user',
      });

      // Add rate limit headers to response
      response.setHeader('X-RateLimit-Limit', rateLimitResult.totalLimit);
      response.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
      response.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetTime.getTime() / 1000));
      response.setHeader('X-RateLimit-Window', `${rateLimitResult.windowStart.toISOString()}/${rateLimitResult.windowEnd.toISOString()}`);

      if (!rateLimitResult.allowed) {
        this.logger.warn(
          `Rate limit exceeded for ${identifier} on operation ${rateLimitConfig.operation}`,
          'RateLimitGuard'
        );

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Rate limit exceeded',
            operation: rateLimitConfig.operation,
            tier,
            limit: rateLimitResult.totalLimit,
            remaining: rateLimitResult.remaining,
            resetTime: rateLimitResult.resetTime,
            windowStart: rateLimitResult.windowStart,
            windowEnd: rateLimitResult.windowEnd,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      this.logger.debug(
        `Rate limit check passed for ${identifier} on operation ${rateLimitConfig.operation} (${rateLimitResult.remaining}/${rateLimitResult.totalLimit} remaining)`,
        'RateLimitGuard'
      );

      return true;

    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === HttpStatus.TOO_MANY_REQUESTS) {
        // Add rate limit headers even for rejected requests
        const errorResponse = error.getResponse() as any;
        if (errorResponse.resetTime) {
          response.setHeader('Retry-After', Math.ceil(errorResponse.resetTime.getTime() / 1000));
        }
        throw error;
      }

      this.logger.error(
        `Error checking rate limit for ${identifier}`,
        error,
        'RateLimitGuard'
      );

      // On error, allow the request but log the issue
      return true;
    }
  }

  /**
   * Get identifier for rate limiting based on limit type
   */
  private getIdentifier(request: any, limitType: string): string {
    switch (limitType) {
      case 'user':
        return request.user?.id || this.getClientIP(request);
      case 'ip':
        return this.getClientIP(request);
      case 'global':
        return 'global';
      default:
        return request.user?.id || this.getClientIP(request);
    }
  }

  /**
   * Extract client IP address from request
   */
  private getClientIP(request: any): string {
    const forwarded = request.headers['x-forwarded-for'];
    const ip = forwarded
      ? forwarded.split(',')[0].trim()
      : request.connection?.remoteAddress ||
        request.socket?.remoteAddress ||
        request.ip ||
        'unknown';

    return ip;
  }
}