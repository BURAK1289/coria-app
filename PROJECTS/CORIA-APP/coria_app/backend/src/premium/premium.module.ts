import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Controllers and Services
import { PremiumController } from './premium.controller';
import { PremiumService } from './premium.service';

// Premium-specific services
import { PremiumRateLimiterService } from './services/premium-rate-limiter.service';
import { AntiReplayService } from './services/anti-replay.service';

// Processors
import { PremiumProcessor } from '@/jobs/processors/premium.processor';

// Guards
import { PremiumGuard } from './guards/premium.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';

// External dependencies
import { PaymentsModule } from '@/payments/payments.module';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [
    // Queue for premium-specific jobs
    BullModule.registerQueue({
      name: 'premium',
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),

    // Rate limiting configuration - module-level throttling
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60, // 1 minute
          limit: 100, // 100 requests per minute (global fallback)
        },
      ],
    }),

    // Schedule module for cron jobs
    ScheduleModule.forRoot(),

    // Dependencies
    PaymentsModule,
    CommonModule,
  ],
  controllers: [PremiumController],
  providers: [
    // Core services
    PremiumService,
    PremiumRateLimiterService,
    AntiReplayService,

    // Job processors
    PremiumProcessor,

    // Guards
    PremiumGuard,
    RateLimitGuard,
  ],
  exports: [
    // Export services for use in other modules
    PremiumService,
    PremiumRateLimiterService,
    AntiReplayService,

    // Export guards for use in other modules
    PremiumGuard,
    RateLimitGuard,
  ],
})
export class PremiumModule {}