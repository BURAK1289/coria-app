import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobsService } from './jobs.service';
import { PaymentProcessor } from './processors/payment.processor';
import { CleanupProcessor } from './processors/cleanup.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'payment',
      },
      {
        name: 'cleanup',
      },
    ),
  ],
  providers: [JobsService, PaymentProcessor, CleanupProcessor],
  exports: [JobsService],
})
export class JobsModule {}