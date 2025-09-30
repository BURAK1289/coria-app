import { Module } from '@nestjs/common';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { SupabaseService } from '@/common/services/supabase.service';
import { SolanaService } from '@/common/services/solana.service';
import { SigningService } from '@/common/services/signing.service';
import { LoggerService } from '@/common/services/logger.service';

@Module({
  controllers: [DonationsController],
  providers: [
    DonationsService,
    SupabaseService,
    SolanaService,
    SigningService,
    LoggerService,
  ],
  exports: [DonationsService],
})
export class DonationsModule {}