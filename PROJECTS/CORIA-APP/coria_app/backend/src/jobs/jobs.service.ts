import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from '@/common/services/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JobsService {
  constructor(
    @InjectQueue('payment') private paymentQueue: Queue,
    @InjectQueue('cleanup') private cleanupQueue: Queue,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Add payment confirmation job
   */
  async addPaymentConfirmationJob(paymentId: string, delayMs: number = 0) {
    const job = await this.paymentQueue.add(
      'confirm-payment',
      { paymentId },
      {
        delay: delayMs,
        attempts: parseInt(this.configService.get('JOB_ATTEMPTS', '3')),
        backoff: {
          type: 'exponential',
          delay: parseInt(this.configService.get('JOB_BACKOFF_DELAY', '2000')),
        },
      },
    );

    this.logger.log(`Payment confirmation job added: ${job.id} for payment ${paymentId}`, 'JobsService');
    return job.id;
  }

  /**
   * Add payment monitoring job
   */
  async addPaymentMonitoringJob(paymentId: string) {
    const job = await this.paymentQueue.add(
      'monitor-payment',
      { paymentId },
      {
        repeat: {
          every: 30000, // Check every 30 seconds
          limit: 20, // Stop after 20 attempts (10 minutes)
        },
        attempts: 1,
      },
    );

    this.logger.log(`Payment monitoring job added: ${job.id} for payment ${paymentId}`, 'JobsService');
    return job.id;
  }

  /**
   * Add balance update job
   */
  async addBalanceUpdateJob(walletId: string, userId: string) {
    const job = await this.paymentQueue.add(
      'update-balance',
      { walletId, userId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    this.logger.log(`Balance update job added: ${job.id} for wallet ${walletId}`, 'JobsService');
    return job.id;
  }

  /**
   * Scheduled cleanup job - runs daily
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailyCleanup() {
    if (this.configService.get('ENABLE_BACKGROUND_JOBS', 'true') === 'true') {
      const job = await this.cleanupQueue.add('daily-cleanup', {});
      this.logger.log(`Daily cleanup job scheduled: ${job.id}`, 'JobsService');
    }
  }

  /**
   * Scheduled balance sync job - runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleBalanceSync() {
    if (this.configService.get('ENABLE_BACKGROUND_JOBS', 'true') === 'true') {
      const job = await this.paymentQueue.add('sync-all-balances', {});
      this.logger.log(`Balance sync job scheduled: ${job.id}`, 'JobsService');
    }
  }

  /**
   * Get job statistics
   */
  async getJobStats() {
    const paymentStats = await this.paymentQueue.getJobCounts();
    const cleanupStats = await this.cleanupQueue.getJobCounts();

    return {
      payment: paymentStats,
      cleanup: cleanupStats,
    };
  }

  /**
   * Remove completed jobs (cleanup)
   */
  async cleanupCompletedJobs() {
    await this.paymentQueue.clean(24 * 60 * 60 * 1000, 'completed'); // 24 hours
    await this.paymentQueue.clean(24 * 60 * 60 * 1000, 'failed'); // 24 hours
    await this.cleanupQueue.clean(24 * 60 * 60 * 1000, 'completed');
    await this.cleanupQueue.clean(24 * 60 * 60 * 1000, 'failed');

    this.logger.log('Completed job cleanup', 'JobsService');
  }
}