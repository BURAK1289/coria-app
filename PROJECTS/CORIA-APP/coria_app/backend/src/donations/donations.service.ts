import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@/common/services/supabase.service';
import { SolanaService } from '@/common/services/solana.service';
import { SigningService } from '@/common/services/signing.service';
import { LoggerService } from '@/common/services/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DonationsService {
  private readonly donationPoolPubkey: string;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly solanaService: SolanaService,
    private readonly signingService: SigningService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.donationPoolPubkey = this.configService.get<string>('DONATION_POOL_PUBKEY');
  }

  async processDonation(
    userId: string,
    walletId: string,
    amountSol: number,
    message?: string,
  ): Promise<any> {
    try {
      // Verify wallet ownership
      const serviceClient = this.supabaseService.getServiceClient();
      const { data: wallet, error: walletError } = await serviceClient
        .from('solana_wallets')
        .select('*')
        .eq('id', walletId)
        .eq('user_id', userId)
        .eq('is_custodial', true)
        .single();

      if (walletError || !wallet) {
        throw new Error('Wallet not found or not custodial');
      }

      // Check balance
      const balanceData = await this.solanaService.getBalance(wallet.public_key);
      const balance = typeof balanceData === 'object' ? balanceData.lamports : balanceData;
      const amountLamports = Math.floor(amountSol * 1_000_000_000);

      if (balance < amountLamports) {
        throw new Error('Insufficient balance');
      }

      // Create transaction
      const transaction = await this.solanaService.createTransferTransaction(
        wallet.public_key,
        this.donationPoolPubkey,
        amountLamports,
      );

      // Sign with KMS/HSM (development uses dev keypair, production uses KMS)
      const signedTx = await this.signingService.signTransaction(
        transaction,
        wallet.public_key,
        `wallet_${walletId}`,
      );

      // Send and confirm
      const signature = await this.solanaService.sendAndConfirmTransaction(
        signedTx,
        'confirmed',
      );

      // Record in database
      const { data: donation, error: donationError } = await serviceClient
        .from('donations')
        .insert({
          user_id: userId,
          wallet_id: walletId,
          amount_sol: amountSol,
          amount_lamports: amountLamports,
          destination_address: this.donationPoolPubkey,
          tx_signature: signature,
          message: message,
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (donationError) {
        this.logger.error('Failed to record donation', donationError, 'DonationsService');
      }

      this.logger.log(`Donation processed: ${amountSol} SOL, signature: ${signature}`);

      return {
        signature,
        amount_sol: amountSol,
        donation_id: donation?.id,
        status: 'confirmed',
      };
    } catch (error) {
      this.logger.error(`Donation failed for user ${userId}:`, error, 'DonationsService');
      throw error;
    }
  }

  async getDonationHistory(userId: string): Promise<any[]> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const { data, error } = await serviceClient
        .from('donations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error(`Failed to get donation history for ${userId}:`, error, 'DonationsService');
      throw error;
    }
  }

  async getTotalDonations(userId: string): Promise<{ totalSol: number; totalLamports: number; count: number }> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const { data, error } = await serviceClient
        .from('donations')
        .select('amount_sol, amount_lamports')
        .eq('user_id', userId)
        .eq('status', 'confirmed');

      if (error) {
        throw error;
      }

      const totalSol = data.reduce((sum, d) => sum + (d.amount_sol || 0), 0);
      const totalLamports = data.reduce((sum, d) => sum + (d.amount_lamports || 0), 0);

      return {
        totalSol,
        totalLamports,
        count: data.length,
      };
    } catch (error) {
      this.logger.error(`Failed to get total donations for ${userId}:`, error, 'DonationsService');
      return { totalSol: 0, totalLamports: 0, count: 0 };
    }
  }
}