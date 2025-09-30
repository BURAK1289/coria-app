import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PremiumService } from '../premium.service';
import { LoggerService } from '@/common/services/logger.service';

// Decorator to mark endpoints as requiring premium
export const RequiresPremium = (feature?: string) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata('premium-feature', feature || 'premium_access', descriptor.value);
    }
  };
};

// Decorator to mark endpoints as allowing premium users only
export const PremiumOnly = () => RequiresPremium('premium_access');

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly premiumService: PremiumService,
    private readonly logger: LoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get the required feature from metadata
    const requiredFeature = this.reflector.get<string>('premium-feature', context.getHandler());

    if (!requiredFeature) {
      // No premium requirement, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      this.logger.warn('Premium guard: No user found in request', 'PremiumGuard');
      throw new ForbiddenException('Authentication required');
    }

    try {
      // Check premium access
      const accessResult = await this.premiumService.checkPremiumAccess({
        userId: user.id,
        feature: requiredFeature,
        operation: 'access_check',
      });

      if (!accessResult.hasAccess) {
        this.logger.log(
          `Premium access denied for user ${user.id}: ${accessResult.reason}`,
          'PremiumGuard'
        );

        // Provide specific error messages based on the reason
        let errorMessage = 'Premium subscription required';

        switch (accessResult.reason) {
          case 'No active premium subscription':
            errorMessage = 'This feature requires an active premium subscription';
            break;
          case 'Premium subscription expired':
            errorMessage = 'Your premium subscription has expired. Please renew to access this feature';
            break;
          case 'Rate limit exceeded':
            errorMessage = 'Rate limit exceeded. Please try again later';
            break;
          default:
            if (accessResult.reason?.includes('not included')) {
              errorMessage = `This feature is not included in your current subscription plan`;
            }
        }

        throw new ForbiddenException({
          message: errorMessage,
          reason: accessResult.reason,
          subscription: accessResult.subscription ? {
            planType: accessResult.subscription.plan?.planType,
            expiresAt: accessResult.subscription.expiresAt,
            features: accessResult.subscription.features,
          } : null,
        });
      }

      // Add subscription info to request for downstream use
      request.premiumSubscription = accessResult.subscription;

      this.logger.debug(
        `Premium access granted for user ${user.id}, feature: ${requiredFeature}`,
        'PremiumGuard'
      );

      return true;

    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(
        `Error checking premium access for user ${user.id}`,
        error,
        'PremiumGuard'
      );

      throw new ForbiddenException('Unable to verify premium access');
    }
  }
}