import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { SupabaseService } from '@/common/services/supabase.service';
import { LoggerService } from '@/common/services/logger.service';

export interface GenerateNonceDto {
  userId: string;
  operation: string;
  metadata?: Record<string, any>;
}

export interface ValidateNonceDto {
  userId: string;
  nonce: string;
  operation: string;
}

@Injectable()
export class AntiReplayService {
  private readonly nonceExpiryMinutes = 15; // Nonces expire after 15 minutes
  private readonly maxNoncesPerUser = 10; // Maximum active nonces per user

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Generate a cryptographically secure nonce for anti-replay protection
   */
  async generateNonce(dto: GenerateNonceDto): Promise<string> {
    const { userId, operation, metadata = {} } = dto;

    try {
      // Clean up expired nonces for this user first
      await this.cleanupExpiredNonces(userId);

      // Check if user has too many active nonces
      const activeNonces = await this.getActiveNoncesCount(userId);
      if (activeNonces >= this.maxNoncesPerUser) {
        this.logger.warn(`User ${userId} has too many active nonces (${activeNonces})`, 'AntiReplayService');
        throw new Error('Too many active nonces. Please wait before generating a new one.');
      }

      // Generate cryptographically secure nonce
      const randomData = randomBytes(32); // 256 bits of entropy
      const timestamp = Date.now().toString();
      const userSalt = userId.slice(-8); // Use last 8 chars of userId as salt
      const operationHash = createHash('sha256').update(operation).digest('hex').slice(0, 8);

      // Combine random data with timestamp, user salt, and operation hash
      const combinedData = `${randomData.toString('hex')}.${timestamp}.${userSalt}.${operationHash}`;
      const nonce = createHash('sha256').update(combinedData).digest('hex');

      // Calculate expiry time
      const expiresAt = new Date(Date.now() + this.nonceExpiryMinutes * 60 * 1000);

      // Store nonce in database
      const serviceClient = this.supabaseService.getServiceClient();
      const { error } = await serviceClient
        .from('anti_replay_nonces')
        .insert({
          user_id: userId,
          nonce,
          operation,
          expires_at: expiresAt.toISOString(),
          metadata: {
            ...metadata,
            generatedAt: new Date().toISOString(),
            entropy: randomData.toString('hex').slice(0, 16), // Store first 16 chars for debugging
          },
        });

      if (error) {
        this.logger.error(`Failed to store nonce for user ${userId}`, error, 'AntiReplayService');
        throw new Error('Failed to generate nonce');
      }

      this.logger.debug(`Generated nonce for user ${userId}, operation ${operation}`, 'AntiReplayService');
      return nonce;

    } catch (error) {
      this.logger.error(`Error generating nonce for user ${userId}`, error, 'AntiReplayService');
      throw error;
    }
  }

  /**
   * Validate and optionally consume a nonce
   */
  async validateNonce(dto: ValidateNonceDto, consumeOnValidation = false): Promise<boolean> {
    const { userId, nonce, operation } = dto;

    try {
      const serviceClient = this.supabaseService.getServiceClient();

      // Find the nonce
      const { data: nonceRecord, error } = await serviceClient
        .from('anti_replay_nonces')
        .select('*')
        .eq('user_id', userId)
        .eq('nonce', nonce)
        .eq('operation', operation)
        .is('used_at', null) // Not yet used
        .single();

      if (error || !nonceRecord) {
        this.logger.warn(`Invalid nonce attempted for user ${userId}, operation ${operation}`, 'AntiReplayService');

        // Log security event
        await this.logSecurityEvent({
          userId,
          eventType: 'invalid_nonce_attempted',
          description: `Invalid nonce attempted for operation: ${operation}`,
          severity: 'medium',
          riskScore: 60,
          metadata: { operation, nonce: nonce.slice(0, 8) + '...' },
        });

        return false;
      }

      // Check if nonce is expired
      const now = new Date();
      const expiresAt = new Date(nonceRecord.expires_at);
      if (now > expiresAt) {
        this.logger.warn(`Expired nonce attempted for user ${userId}, operation ${operation}`, 'AntiReplayService');

        // Clean up expired nonce
        await serviceClient
          .from('anti_replay_nonces')
          .delete()
          .eq('id', nonceRecord.id);

        // Log security event
        await this.logSecurityEvent({
          userId,
          eventType: 'expired_nonce_attempted',
          description: `Expired nonce attempted for operation: ${operation}`,
          severity: 'low',
          riskScore: 30,
          metadata: { operation, expiredAt: expiresAt.toISOString() },
        });

        return false;
      }

      // If consuming on validation, mark as used
      if (consumeOnValidation) {
        const { error: updateError } = await serviceClient
          .from('anti_replay_nonces')
          .update({
            used_at: now.toISOString(),
          })
          .eq('id', nonceRecord.id);

        if (updateError) {
          this.logger.error(`Failed to consume nonce for user ${userId}`, updateError, 'AntiReplayService');
          return false;
        }

        this.logger.debug(`Nonce consumed for user ${userId}, operation ${operation}`, 'AntiReplayService');
      }

      return true;

    } catch (error) {
      this.logger.error(`Error validating nonce for user ${userId}`, error, 'AntiReplayService');
      return false;
    }
  }

  /**
   * Consume a nonce (mark as used)
   */
  async consumeNonce(nonce: string): Promise<boolean> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const now = new Date();

      const { error } = await serviceClient
        .from('anti_replay_nonces')
        .update({
          used_at: now.toISOString(),
        })
        .eq('nonce', nonce)
        .is('used_at', null);

      if (error) {
        this.logger.error(`Failed to consume nonce`, error, 'AntiReplayService');
        return false;
      }

      this.logger.debug(`Nonce consumed: ${nonce.slice(0, 8)}...`, 'AntiReplayService');
      return true;

    } catch (error) {
      this.logger.error(`Error consuming nonce`, error, 'AntiReplayService');
      return false;
    }
  }

  /**
   * Clean up expired nonces for a user
   */
  async cleanupExpiredNonces(userId?: string): Promise<number> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const now = new Date();

      let query = serviceClient
        .from('anti_replay_nonces')
        .delete()
        .lt('expires_at', now.toISOString());

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.select('id');

      if (error) {
        this.logger.error('Failed to cleanup expired nonces', error, 'AntiReplayService');
        return 0;
      }

      const cleanedCount = data?.length || 0;
      if (cleanedCount > 0) {
        this.logger.debug(`Cleaned up ${cleanedCount} expired nonces${userId ? ` for user ${userId}` : ''}`, 'AntiReplayService');
      }

      return cleanedCount;

    } catch (error) {
      this.logger.error('Error cleaning up expired nonces', error, 'AntiReplayService');
      return 0;
    }
  }

  /**
   * Get count of active nonces for a user
   */
  private async getActiveNoncesCount(userId: string): Promise<number> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const now = new Date();

      const { count, error } = await serviceClient
        .from('anti_replay_nonces')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .is('used_at', null)
        .gt('expires_at', now.toISOString());

      if (error) {
        this.logger.error(`Failed to get active nonces count for user ${userId}`, error, 'AntiReplayService');
        return 0;
      }

      return count || 0;

    } catch (error) {
      this.logger.error(`Error getting active nonces count for user ${userId}`, error, 'AntiReplayService');
      return 0;
    }
  }

  /**
   * Log security events
   */
  private async logSecurityEvent(params: {
    userId?: string;
    eventType: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();

      await serviceClient
        .from('security_events')
        .insert({
          user_id: params.userId,
          event_type: params.eventType,
          severity: params.severity,
          description: params.description,
          risk_score: params.riskScore,
          metadata: params.metadata || {},
        });

    } catch (error) {
      this.logger.error('Failed to log security event', error, 'AntiReplayService');
      // Don't throw here to avoid breaking the main operation
    }
  }

  /**
   * Get nonce statistics for monitoring
   */
  async getNonceStatistics(): Promise<{
    totalActive: number;
    totalExpired: number;
    totalUsed: number;
    oldestActive?: Date;
    newestActive?: Date;
  }> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const now = new Date();

      // Get active nonces count
      const { count: activeCount } = await serviceClient
        .from('anti_replay_nonces')
        .select('id', { count: 'exact' })
        .is('used_at', null)
        .gt('expires_at', now.toISOString());

      // Get expired nonces count
      const { count: expiredCount } = await serviceClient
        .from('anti_replay_nonces')
        .select('id', { count: 'exact' })
        .is('used_at', null)
        .lt('expires_at', now.toISOString());

      // Get used nonces count
      const { count: usedCount } = await serviceClient
        .from('anti_replay_nonces')
        .select('id', { count: 'exact' })
        .not('used_at', 'is', null);

      // Get oldest and newest active nonces
      const { data: oldestActive } = await serviceClient
        .from('anti_replay_nonces')
        .select('created_at')
        .is('used_at', null)
        .gt('expires_at', now.toISOString())
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      const { data: newestActive } = await serviceClient
        .from('anti_replay_nonces')
        .select('created_at')
        .is('used_at', null)
        .gt('expires_at', now.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        totalActive: activeCount || 0,
        totalExpired: expiredCount || 0,
        totalUsed: usedCount || 0,
        oldestActive: oldestActive ? new Date(oldestActive.created_at) : undefined,
        newestActive: newestActive ? new Date(newestActive.created_at) : undefined,
      };

    } catch (error) {
      this.logger.error('Error getting nonce statistics', error, 'AntiReplayService');
      return {
        totalActive: 0,
        totalExpired: 0,
        totalUsed: 0,
      };
    }
  }

  /**
   * Scheduled cleanup job (called by cron)
   */
  async scheduledCleanup(): Promise<{ cleanedNonces: number; cleanedSecurityEvents: number }> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();

      // Clean up nonces older than 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const { data: noncesData, error: noncesError } = await serviceClient
        .from('anti_replay_nonces')
        .delete()
        .lt('created_at', oneDayAgo.toISOString())
        .select('id');

      const cleanedNonces = noncesData?.length || 0;

      // Clean up old security events (keep last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const { data: eventsData, error: eventsError } = await serviceClient
        .from('security_events')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())
        .in('severity', ['low', 'medium']) // Keep high and critical events longer
        .select('id');

      const cleanedSecurityEvents = eventsData?.length || 0;

      if (cleanedNonces > 0 || cleanedSecurityEvents > 0) {
        this.logger.log(
          `Scheduled cleanup completed: ${cleanedNonces} nonces, ${cleanedSecurityEvents} security events`,
          'AntiReplayService'
        );
      }

      return { cleanedNonces, cleanedSecurityEvents };

    } catch (error) {
      this.logger.error('Error in scheduled cleanup', error, 'AntiReplayService');
      return { cleanedNonces: 0, cleanedSecurityEvents: 0 };
    }
  }
}