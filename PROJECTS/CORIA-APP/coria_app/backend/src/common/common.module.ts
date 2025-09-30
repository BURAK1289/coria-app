import { Module, Global } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SupabaseService } from './services/supabase.service';
import { SolanaService } from './services/solana.service';
import { SolanaTransactionService } from './services/solana-transaction.service';
import { SigningService } from './services/signing.service';
import { LoggerService } from './services/logger.service';
import { StructuredLoggerService } from './services/structured-logger.service';
import { TokenBucketRateLimiterService } from './services/token-bucket-rate-limiter.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { MonitoringService } from './services/monitoring.service';

@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    SupabaseService,
    SolanaService,
    SolanaTransactionService,
    SigningService,
    LoggerService,
    StructuredLoggerService,
    TokenBucketRateLimiterService,
    CircuitBreakerService,
    MonitoringService,
  ],
  exports: [
    SupabaseService,
    SolanaService,
    SolanaTransactionService,
    SigningService,
    LoggerService,
    StructuredLoggerService,
    TokenBucketRateLimiterService,
    CircuitBreakerService,
    MonitoringService,
  ],
})
export class CommonModule {}