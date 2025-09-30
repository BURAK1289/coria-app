import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsUUID, IsObject, IsNumber, Min } from 'class-validator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PremiumGuard, RequiresPremium, PremiumOnly } from './guards/premium.guard';
import { RateLimitGuard, RateLimit } from './guards/rate-limit.guard';
import { PremiumService, ActivatePremiumDto } from './premium.service';
import { AntiReplayService } from './services/anti-replay.service';
import { LoggerService } from '@/common/services/logger.service';

export class GenerateNonceDto {
  @IsString()
  @ApiProperty({ description: 'Operation name for nonce generation' })
  operation: string;

  @IsObject()
  @IsOptional()
  @ApiProperty({ description: 'Additional metadata for nonce generation' })
  metadata?: Record<string, any>;
}

export class ActivatePremiumRequestDto {
  @IsUUID('4')
  @ApiProperty({ description: 'Payment ID that confirms premium purchase' })
  paymentId: string;

  @IsEnum(['monthly', 'yearly', 'lifetime'])
  @ApiProperty({ description: 'Premium plan type' })
  planType: 'monthly' | 'yearly' | 'lifetime';

  @IsString()
  @ApiProperty({ description: 'Anti-replay nonce' })
  nonce: string;
}

export class TrackUsageRequestDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  @ApiProperty({ description: 'Amount to increment usage by (default: 1)' })
  incrementBy?: number;

  @IsObject()
  @IsOptional()
  @ApiProperty({ description: 'Additional metadata for usage tracking' })
  metadata?: Record<string, any>;
}

export class CancelSubscriptionDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Reason for cancellation' })
  reason?: string;
}

@ApiTags('Premium')
@Controller('premium')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PremiumController {
  constructor(
    private readonly premiumService: PremiumService,
    private readonly antiReplayService: AntiReplayService,
    private readonly logger: LoggerService,
  ) {}

  @Post('nonce')
  @RateLimit({ operation: 'generate_nonce', limitType: 'user' })
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate anti-replay nonce',
    description: 'Generate a cryptographically secure nonce for preventing replay attacks on premium operations.',
  })
  @ApiBody({ type: GenerateNonceDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Nonce generated successfully',
    schema: {
      type: 'object',
      properties: {
        nonce: { type: 'string', description: 'Generated nonce' },
        expiresAt: { type: 'string', description: 'Nonce expiration time' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Rate limit exceeded',
  })
  async generateNonce(
    @Body(ValidationPipe) body: GenerateNonceDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;

    this.logger.log(`Generating nonce for user ${userId}, operation ${body.operation}`, 'PremiumController');

    const nonce = await this.antiReplayService.generateNonce({
      userId,
      operation: body.operation,
      metadata: {
        ...body.metadata,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      },
    });

    return {
      nonce,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    };
  }

  @Post('activate')
  @RateLimit({ operation: 'activate_premium', limitType: 'user' })
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activate premium subscription',
    description: 'Activate a premium subscription using a confirmed payment and anti-replay nonce.',
  })
  @ApiBody({ type: ActivatePremiumRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Premium activated successfully',
    schema: {
      type: 'object',
      properties: {
        subscription: {
          type: 'object',
          description: 'Premium subscription details',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid payment, nonce, or activation parameters',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already has active premium subscription',
  })
  async activatePremium(
    @Body(ValidationPipe) body: ActivatePremiumRequestDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;

    this.logger.log(`Activating premium for user ${userId}, plan ${body.planType}`, 'PremiumController');

    const subscription = await this.premiumService.activatePremium({
      userId,
      paymentId: body.paymentId,
      planType: body.planType,
      nonce: body.nonce,
    });

    return { subscription };
  }

  @Get('subscription')
  @RateLimit({ operation: 'subscription_management', limitType: 'user' })
  @UseGuards(RateLimitGuard)
  @ApiOperation({
    summary: 'Get current premium subscription',
    description: 'Retrieve the user\'s current premium subscription details.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription details retrieved',
    schema: {
      type: 'object',
      properties: {
        subscription: {
          type: 'object',
          description: 'Premium subscription details (null if no active subscription)',
        },
      },
    },
  })
  async getSubscription(@Request() req: any) {
    const userId = req.user.id;
    const subscription = await this.premiumService.getPremiumSubscription(userId);

    return { subscription };
  }

  @Post('check-access/:feature')
  @RateLimit({ operation: 'check_access', limitType: 'user' })
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check premium feature access',
    description: 'Check if the user has access to a specific premium feature.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access check completed',
    schema: {
      type: 'object',
      properties: {
        hasAccess: { type: 'boolean', description: 'Whether user has access' },
        reason: { type: 'string', description: 'Reason if access denied' },
        subscription: { type: 'object', description: 'User subscription details' },
      },
    },
  })
  async checkAccess(
    @Param('feature') feature: string,
    @Request() req: any,
  ) {
    const userId = req.user.id;

    const result = await this.premiumService.checkPremiumAccess({
      userId,
      feature,
      operation: 'feature_access_check',
    });

    return result;
  }

  @Post('track-usage/:feature')
  @RequiresPremium()
  @RateLimit({ operation: 'track_usage', limitType: 'user' })
  @UseGuards(PremiumGuard, RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Track premium feature usage',
    description: 'Track usage of a premium feature for analytics and limits.',
  })
  @ApiBody({ type: TrackUsageRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usage tracked successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Whether tracking was successful' },
        currentUsage: { type: 'number', description: 'Current usage count for the period' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Premium subscription required',
  })
  async trackUsage(
    @Param('feature') feature: string,
    @Body(ValidationPipe) body: TrackUsageRequestDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;

    const result = await this.premiumService.trackFeatureUsage({
      userId,
      feature,
      incrementBy: body.incrementBy,
      metadata: body.metadata,
    });

    return result;
  }

  @Post('pay-with-sol')
  @RateLimit({ operation: 'premium_payment', limitType: 'user' })
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Pay for premium with SOL (custodial wallet)',
    description: 'Activate premium subscription by paying with SOL from custodial wallet.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        wallet_id: { type: 'string', description: 'Custodial wallet ID' },
        plan_id: { type: 'string', description: 'Premium plan ID (monthly, yearly, lifetime)' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Premium activated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        signature: { type: 'string', description: 'Transaction signature' },
        premium_expires_at: { type: 'string', description: 'Premium expiration date' },
      },
    },
  })
  async payWithSol(
    @Body() body: { wallet_id: string; plan_id: string },
    @Request() req: any,
  ) {
    const userId = req.user.sub;

    this.logger.log(`Processing premium SOL payment for user ${userId}`, 'PremiumController');

    const result = await this.premiumService.payPremiumWithSol(userId, body.wallet_id, body.plan_id);

    return {
      success: true,
      signature: result.signature,
      premium_expires_at: result.expiresAt,
    };
  }

  @Delete('cancel')
  @PremiumOnly()
  @RateLimit({ operation: 'subscription_management', limitType: 'user' })
  @UseGuards(PremiumGuard, RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel premium subscription',
    description: 'Cancel the user\'s active premium subscription.',
  })
  @ApiBody({ type: CancelSubscriptionDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Whether cancellation was successful' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No active premium subscription found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Premium subscription required',
  })
  async cancelSubscription(
    @Body(ValidationPipe) body: CancelSubscriptionDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;

    const success = await this.premiumService.cancelSubscription(userId, body.reason);

    return { success };
  }

  @Get('plans')
  @ApiOperation({
    summary: 'Get available premium plans',
    description: 'Retrieve all available premium subscription plans.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Premium plans retrieved',
    schema: {
      type: 'object',
      properties: {
        plans: {
          type: 'array',
          description: 'Available premium plans',
        },
      },
    },
  })
  async getPlans() {
    const plans = await this.premiumService.getPremiumPlans();
    return { plans };
  }

  @Get('features')
  @PremiumOnly()
  @UseGuards(PremiumGuard)
  @ApiOperation({
    summary: 'Get available premium features',
    description: 'Get the list of premium features available to the user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Premium features retrieved',
    schema: {
      type: 'object',
      properties: {
        features: { type: 'array', description: 'Available premium features' },
        planType: { type: 'string', description: 'Current plan type' },
        expiresAt: { type: 'string', description: 'Subscription expiry date' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Premium subscription required',
  })
  async getFeatures(@Request() req: any) {
    const subscription = req.premiumSubscription;

    return {
      features: subscription?.features || [],
      planType: subscription?.plan?.planType,
      expiresAt: subscription?.expiresAt,
    };
  }

  @Get('stats/nonces')
  @RequiresPremium('admin')
  @UseGuards(PremiumGuard)
  @ApiOperation({
    summary: 'Get nonce statistics (Admin only)',
    description: 'Retrieve statistics about anti-replay nonces for monitoring.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Nonce statistics retrieved',
  })
  async getNonceStats() {
    const stats = await this.antiReplayService.getNonceStatistics();
    return { stats };
  }
}