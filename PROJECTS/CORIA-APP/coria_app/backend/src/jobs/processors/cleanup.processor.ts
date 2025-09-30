import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { LoggerService } from '@/common/services/logger.service';
import { SupabaseService } from '@/common/services/supabase.service';

@Processor('cleanup')
export class CleanupProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Process('daily-cleanup')
  async handleDailyCleanup(job: Job) {
    this.logger.log('Starting daily cleanup process', 'CleanupProcessor');

    try {
      // Cleanup expired idempotency keys and old activities
      const result = await this.supabaseService.executeRpc('cleanup_old_payment_data', {
        p_days_old: 90,
      });

      this.logger.log(`Daily cleanup completed: ${JSON.stringify(result)}`, 'CleanupProcessor');

      return {
        success: true,
        cleaned: result,
      };
    } catch (error) {
      this.logger.error('Daily cleanup failed:', error, 'CleanupProcessor');
      throw error;
    }
  }
}