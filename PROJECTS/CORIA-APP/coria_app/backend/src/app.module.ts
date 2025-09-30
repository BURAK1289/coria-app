import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

// Core modules
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { WalletsModule } from './wallets/wallets.module';
import { PaymentsModule } from './payments/payments.module';
import { PremiumModule } from './premium/premium.module';
import { DonationsModule } from './donations/donations.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: parseInt(process.env.THROTTLE_TTL || '60'),
            limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
          },
        ],
      }),
    }),

    // Redis and job queue
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB || '0'),
        },
      }),
    }),

    // Task scheduling
    ScheduleModule.forRoot(),

    // Application modules
    CommonModule,
    HealthModule,
    AuthModule,
    WalletsModule,
    PaymentsModule,
    PremiumModule,
    DonationsModule,
    WebhooksModule,
    JobsModule,
  ],
})
export class AppModule {}