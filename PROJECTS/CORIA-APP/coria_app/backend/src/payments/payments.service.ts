import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '@/common/services/supabase.service';
import { SolanaService } from '@/common/services/solana.service';
import { SolanaTransactionService } from '@/common/services/solana-transaction.service';
import { LoggerService } from '@/common/services/logger.service';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface CreatePendingPaymentDto {
  userId: string;
  walletId: string;
  type: 'donation' | 'premium';
  amountLamports: number;
  txSignature?: string;
  idempotencyKey: string;
  metadata?: Record<string, any>;
}

export interface PendingPayment {
  id: string;
  userId: string;
  walletId: string;
  type: 'donation' | 'premium';
  amountLamports: number;
  amountSol: number;
  status: 'pending' | 'confirmed' | 'failed';
  txSignature?: string;
  targetPoolAddress: string;
  idempotencyKey: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface PaymentConfirmationResult {
  paymentId: string;
  status: 'confirmed' | 'failed' | 'mismatch';
  reason?: string;
  ledgerEntryId?: string;
  premiumActivated?: boolean;
  premiumExpiresAt?: string;
}

export interface PaymentPoolConfig {
  donationPool: string;
  premiumPool: string;
  premiumPriceSol: number;
  premiumDurationDays: number;
}

@Injectable()
export class PaymentsService {
  private readonly poolConfig: PaymentPoolConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
    private readonly solanaService: SolanaService,
    private readonly solanaTransactionService: SolanaTransactionService,
    private readonly logger: LoggerService,
  ) {
    this.poolConfig = {
      donationPool: this.configService.get<string>('DONATION_POOL_PUBKEY'),
      premiumPool: this.configService.get<string>('PREMIUM_POOL_PUBKEY'),
      premiumPriceSol: parseFloat(this.configService.get<string>('PREMIUM_PRICE_SOL', '1.0')),
      premiumDurationDays: 30,
    };

    // Validate pool configuration
    if (!this.poolConfig.donationPool || !this.poolConfig.premiumPool) {
      throw new Error('Missing pool configuration: DONATION_POOL_PUBKEY and PREMIUM_POOL_PUBKEY required');
    }

    this.logger.log('PaymentsService initialized with pool configuration', 'PaymentsService');
  }

  /**
   * Create a pending payment with idempotency protection
   */
  async createPending(dto: CreatePendingPaymentDto): Promise<PendingPayment> {
    const { userId, walletId, type, amountLamports, txSignature, idempotencyKey, metadata } = dto;

    this.logger.log(
      `Creating pending ${type} payment: ${this.solanaService.lamportsToSol(amountLamports)} SOL for user ${userId}`,
      'PaymentsService',
    );

    try {
      // Check for existing payment with same idempotency key
      const existingPayment = await this.getPaymentByIdempotencyKey(idempotencyKey);
      if (existingPayment) {
        this.logger.log(`Payment with idempotency key ${idempotencyKey} already exists`, 'PaymentsService');
        return existingPayment;
      }

      // Validate payment parameters
      await this.validatePaymentRequest(dto);

      // Determine target pool address
      const targetPoolAddress = this.getTargetPoolAddress(type);

      // Validate premium payment amount
      if (type === 'premium') {
        await this.validatePremiumPayment(amountLamports);
      }

      // Create payment record
      const payment = await this.createPaymentRecord({
        ...dto,
        targetPoolAddress,
        amountSol: this.solanaService.lamportsToSol(amountLamports),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

      // Store idempotency key
      await this.storeIdempotencyKey(idempotencyKey, userId, payment.id);

      this.logger.log(`Pending payment created: ${payment.id}`, 'PaymentsService');
      return payment;
    } catch (error) {
      this.logger.error(`Error creating pending payment: ${error.message}`, error.stack, 'PaymentsService');
      throw error;
    }
  }

  /**
   * Confirm a payment by checking transaction status and updating records
   */
  async confirmPayment(paymentId: string): Promise<PaymentConfirmationResult> {
    this.logger.log(`Confirming payment: ${paymentId}`, 'PaymentsService');

    try {
      // Get payment record
      const payment = await this.getPaymentById(paymentId);
      if (!payment) {
        throw new BadRequestException(`Payment not found: ${paymentId}`);
      }

      if (payment.status !== 'pending') {
        this.logger.log(`Payment ${paymentId} already processed with status: ${payment.status}`, 'PaymentsService');
        return {
          paymentId,
          status: payment.status as 'confirmed' | 'failed',
          reason: 'Already processed',
        };
      }

      if (!payment.txSignature) {
        await this.failPayment(paymentId, 'No transaction signature provided');
        return {
          paymentId,
          status: 'failed',
          reason: 'No transaction signature',
        };
      }

      // Check transaction status on Solana network
      const txStatus = await this.solanaService.getTransactionStatus(payment.txSignature);

      if (txStatus.status === 'failed') {
        await this.failPayment(paymentId, `Transaction failed: ${txStatus.error}`);
        return {
          paymentId,
          status: 'failed',
          reason: `Transaction failed: ${txStatus.error}`,
        };
      }

      if (txStatus.status === 'pending') {
        this.logger.log(`Transaction ${payment.txSignature} still pending`, 'PaymentsService');
        return {
          paymentId,
          status: 'failed',
          reason: 'Transaction still pending',
        };
      }

      // Transaction is confirmed, verify details
      const verificationResult = await this.verifyTransactionDetails(payment);

      if (verificationResult.status === 'mismatch') {
        await this.failPayment(paymentId, verificationResult.reason);
        return {
          paymentId,
          status: 'mismatch',
          reason: verificationResult.reason,
        };
      }

      // All checks passed, confirm the payment
      const confirmationResult = await this.processConfirmedPayment(payment);

      this.logger.log(`Payment ${paymentId} confirmed successfully`, 'PaymentsService');
      return confirmationResult;
    } catch (error) {
      this.logger.error(`Error confirming payment ${paymentId}: ${error.message}`, error.stack, 'PaymentsService');
      await this.failPayment(paymentId, `Confirmation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process a confirmed payment (update ledger, activate premium)
   */
  private async processConfirmedPayment(payment: PendingPayment): Promise<PaymentConfirmationResult> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      await serviceClient.rpc('begin_transaction');

      // Update payment status
      await this.updatePaymentStatus(payment.id, 'confirmed');

      // Create ledger entry
      const ledgerEntryId = await this.createLedgerEntry(payment);

      let premiumActivated = false;
      let premiumExpiresAt: string | undefined;

      // Activate premium if it's a premium payment
      if (payment.type === 'premium') {
        const premiumResult = await this.activatePremium(payment.userId);
        premiumActivated = premiumResult.activated;
        premiumExpiresAt = premiumResult.expiresAt;
      }

      await serviceClient.rpc('commit_transaction');

      return {
        paymentId: payment.id,
        status: 'confirmed',
        ledgerEntryId,
        premiumActivated,
        premiumExpiresAt,
      };
    } catch (error) {
      await serviceClient.rpc('rollback_transaction');
      throw error;
    }
  }

  /**
   * Verify transaction details match payment requirements
   */
  private async verifyTransactionDetails(payment: PendingPayment): Promise<{
    status: 'valid' | 'mismatch';
    reason?: string;
  }> {
    try {
      const transaction = await this.solanaService.getTransaction(payment.txSignature);

      if (!transaction) {
        return {
          status: 'mismatch',
          reason: 'Transaction not found on network',
        };
      }

      // Verify transaction was successful
      if (transaction.meta?.err) {
        return {
          status: 'mismatch',
          reason: `Transaction failed: ${JSON.stringify(transaction.meta.err)}`,
        };
      }

      // Extract transfer details
      const instructions = transaction.transaction.message.instructions;
      let transferFound = false;
      let transferAmount = 0;
      let transferTo = '';

      for (const instruction of instructions) {
        if (instruction.programId.toString() === '11111111111111111111111111111111') { // System Program
          const parsed = transaction.meta?.innerInstructions?.find(
            inner => inner.instructions.some(inst => 'parsed' in inst && inst.parsed?.type === 'transfer')
          );

          if (parsed) {
            const transferInst = parsed.instructions.find(inst => 'parsed' in inst && inst.parsed?.type === 'transfer');
            if (transferInst && 'parsed' in transferInst && transferInst.parsed) {
              transferFound = true;
              transferAmount = transferInst.parsed.info.lamports;
              transferTo = transferInst.parsed.info.destination;
            }
          }
        }
      }

      if (!transferFound) {
        return {
          status: 'mismatch',
          reason: 'No transfer instruction found in transaction',
        };
      }

      // Verify amount matches
      if (transferAmount !== payment.amountLamports) {
        return {
          status: 'mismatch',
          reason: `Amount mismatch: expected ${payment.amountLamports}, got ${transferAmount}`,
        };
      }

      // Verify destination matches target pool
      if (transferTo !== payment.targetPoolAddress) {
        return {
          status: 'mismatch',
          reason: `Destination mismatch: expected ${payment.targetPoolAddress}, got ${transferTo}`,
        };
      }

      return { status: 'valid' };
    } catch (error) {
      this.logger.error(`Error verifying transaction details: ${error.message}`, error.stack, 'PaymentsService');
      return {
        status: 'mismatch',
        reason: `Verification error: ${error.message}`,
      };
    }
  }

  /**
   * Activate premium for user (30 days)
   */
  private async activatePremium(userId: string): Promise<{
    activated: boolean;
    expiresAt: string;
  }> {
    const serviceClient = this.supabaseService.getServiceClient();
    const expiresAt = new Date(Date.now() + this.poolConfig.premiumDurationDays * 24 * 60 * 60 * 1000);

    try {
      // Check existing premium subscription
      const { data: existingSub } = await serviceClient
        .from('premium_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (existingSub) {
        // Extend existing subscription
        const newExpiresAt = new Date(
          Math.max(new Date(existingSub.expires_at).getTime(), Date.now()) +
          this.poolConfig.premiumDurationDays * 24 * 60 * 60 * 1000
        );

        await serviceClient
          .from('premium_subscriptions')
          .update({
            expires_at: newExpiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSub.id);

        return {
          activated: true,
          expiresAt: newExpiresAt.toISOString(),
        };
      } else {
        // Create new premium subscription
        const { data: newSub, error } = await serviceClient
          .from('premium_subscriptions')
          .insert({
            user_id: userId,
            status: 'active',
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create premium subscription: ${error.message}`);
        }

        return {
          activated: true,
          expiresAt: expiresAt.toISOString(),
        };
      }
    } catch (error) {
      this.logger.error(`Error activating premium for user ${userId}: ${error.message}`, error.stack, 'PaymentsService');
      throw error;
    }
  }

  /**
   * Create ledger entry for confirmed payment
   */
  private async createLedgerEntry(payment: PendingPayment): Promise<string> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      const { data: ledgerEntry, error } = await serviceClient
        .from('solana_ledger')
        .insert({
          user_id: payment.userId,
          wallet_id: payment.walletId,
          payment_id: payment.id,
          delta_lamports: payment.amountLamports,
          reason: payment.type === 'donation' ? 'donation_sent' : 'premium_payment',
          tx_signature: payment.txSignature,
          metadata: {
            type: payment.type,
            targetPool: payment.targetPoolAddress,
            amountSol: payment.amountSol,
            ...payment.metadata,
          },
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create ledger entry: ${error.message}`);
      }

      return ledgerEntry.id;
    } catch (error) {
      this.logger.error(`Error creating ledger entry: ${error.message}`, error.stack, 'PaymentsService');
      throw error;
    }
  }

  /**
   * Get target pool address based on payment type
   */
  private getTargetPoolAddress(type: 'donation' | 'premium'): string {
    return type === 'donation' ? this.poolConfig.donationPool : this.poolConfig.premiumPool;
  }

  /**
   * Validate premium payment amount
   */
  private async validatePremiumPayment(amountLamports: number): Promise<void> {
    const amountSol = this.solanaService.lamportsToSol(amountLamports);
    const minimumSol = this.poolConfig.premiumPriceSol;

    if (amountSol < minimumSol) {
      throw new BadRequestException(
        `Premium payment amount too low: ${amountSol} SOL. Minimum required: ${minimumSol} SOL`
      );
    }
  }

  /**
   * Validate payment request parameters
   */
  private async validatePaymentRequest(dto: CreatePendingPaymentDto): Promise<void> {
    const { userId, walletId, type, amountLamports, idempotencyKey } = dto;

    // Validate required fields
    if (!userId || !walletId || !type || !idempotencyKey) {
      throw new BadRequestException('Missing required fields: userId, walletId, type, idempotencyKey');
    }

    // Validate payment type
    if (!['donation', 'premium'].includes(type)) {
      throw new BadRequestException('Invalid payment type. Must be "donation" or "premium"');
    }

    // Validate amount
    if (!Number.isInteger(amountLamports) || amountLamports <= 0) {
      throw new BadRequestException('Amount must be a positive integer in lamports');
    }

    // Validate minimum amount (1000 lamports = 0.000001 SOL)
    if (amountLamports < 1000) {
      throw new BadRequestException('Amount too small. Minimum 1000 lamports required');
    }

    // Verify wallet belongs to user
    const serviceClient = this.supabaseService.getServiceClient();
    const { data: wallet, error } = await serviceClient
      .from('solana_wallets')
      .select('user_id, is_active')
      .eq('id', walletId)
      .single();

    if (error || !wallet) {
      throw new BadRequestException('Wallet not found');
    }

    if (wallet.user_id !== userId) {
      throw new BadRequestException('Wallet does not belong to user');
    }

    if (!wallet.is_active) {
      throw new BadRequestException('Wallet is not active');
    }
  }

  /**
   * Store idempotency key to prevent duplicate payments
   */
  private async storeIdempotencyKey(key: string, userId: string, paymentId: string): Promise<void> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      const { error } = await serviceClient
        .from('payment_idempotency_keys')
        .insert({
          key,
          user_id: userId,
          payment_id: paymentId,
          response_data: { paymentId },
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new ConflictException('Payment with this idempotency key already exists');
        }
        throw new Error(`Failed to store idempotency key: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error storing idempotency key: ${error.message}`, error.stack, 'PaymentsService');
      throw error;
    }
  }

  /**
   * Get payment by idempotency key
   */
  private async getPaymentByIdempotencyKey(key: string): Promise<PendingPayment | null> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      const { data: idempotencyRecord } = await serviceClient
        .from('payment_idempotency_keys')
        .select('payment_id')
        .eq('key', key)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (!idempotencyRecord) {
        return null;
      }

      return await this.getPaymentById(idempotencyRecord.payment_id);
    } catch (error) {
      this.logger.error(`Error getting payment by idempotency key: ${error.message}`, error.stack, 'PaymentsService');
      return null;
    }
  }

  /**
   * Get payment by ID
   */
  private async getPaymentById(paymentId: string): Promise<PendingPayment | null> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      const { data: payment, error } = await serviceClient
        .from('solana_payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error || !payment) {
        return null;
      }

      return {
        id: payment.id,
        userId: payment.user_id,
        walletId: payment.wallet_id,
        type: payment.type,
        amountLamports: payment.amount_lamports,
        amountSol: payment.amount_sol,
        status: payment.status,
        txSignature: payment.tx_signature,
        targetPoolAddress: payment.target_pool_address,
        idempotencyKey: payment.idempotency_key,
        metadata: payment.metadata,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
        expiresAt: payment.expires_at,
      };
    } catch (error) {
      this.logger.error(`Error getting payment by ID: ${error.message}`, error.stack, 'PaymentsService');
      return null;
    }
  }

  /**
   * Create payment record in database
   */
  private async createPaymentRecord(data: CreatePendingPaymentDto & {
    targetPoolAddress: string;
    amountSol: number;
    expiresAt: string;
  }): Promise<PendingPayment> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      const { data: payment, error } = await serviceClient
        .from('solana_payments')
        .insert({
          user_id: data.userId,
          wallet_id: data.walletId,
          type: data.type,
          amount_lamports: data.amountLamports,
          amount_sol: data.amountSol,
          status: 'pending',
          tx_signature: data.txSignature,
          target_pool_address: data.targetPoolAddress,
          idempotency_key: data.idempotencyKey,
          metadata: data.metadata || {},
          expires_at: data.expiresAt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create payment record: ${error.message}`);
      }

      return {
        id: payment.id,
        userId: payment.user_id,
        walletId: payment.wallet_id,
        type: payment.type,
        amountLamports: payment.amount_lamports,
        amountSol: payment.amount_sol,
        status: payment.status,
        txSignature: payment.tx_signature,
        targetPoolAddress: payment.target_pool_address,
        idempotencyKey: payment.idempotency_key,
        metadata: payment.metadata,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
        expiresAt: payment.expires_at,
      };
    } catch (error) {
      this.logger.error(`Error creating payment record: ${error.message}`, error.stack, 'PaymentsService');
      throw error;
    }
  }

  /**
   * Update payment status
   */
  private async updatePaymentStatus(paymentId: string, status: 'confirmed' | 'failed'): Promise<void> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      const { error } = await serviceClient
        .from('solana_payments')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) {
        throw new Error(`Failed to update payment status: ${error.message}`);
      }
    } catch (error) {
      this.logger.error(`Error updating payment status: ${error.message}`, error.stack, 'PaymentsService');
      throw error;
    }
  }

  /**
   * Mark payment as failed
   */
  private async failPayment(paymentId: string, reason: string): Promise<void> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      await serviceClient
        .from('solana_payments')
        .update({
          status: 'failed',
          metadata: { failureReason: reason },
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      this.logger.log(`Payment ${paymentId} marked as failed: ${reason}`, 'PaymentsService');
    } catch (error) {
      this.logger.error(`Error failing payment: ${error.message}`, error.stack, 'PaymentsService');
      throw error;
    }
  }

  /**
   * Get pool configuration
   */
  getPoolConfig(): PaymentPoolConfig {
    return { ...this.poolConfig };
  }

  /**
   * Convert SOL to lamports
   */
  solToLamports(sol: number): number {
    return this.solanaService.solToLamports(sol);
  }

  /**
   * Convert lamports to SOL
   */
  lamportsToSol(lamports: number): number {
    return this.solanaService.lamportsToSol(lamports);
  }
}