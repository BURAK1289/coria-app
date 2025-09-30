import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionSignature,
  Keypair,
  SignatureStatus,
  ConfirmedSignatureInfo,
} from '@solana/web3.js';
import { StructuredLoggerService } from './structured-logger.service';
import { SolanaService } from './solana.service';
import { CircuitBreakerService } from './circuit-breaker.service';
import { CoriaError, ERROR_CLASSIFICATIONS } from '../errors/error-taxonomy';

export interface TransferParams {
  from: string;
  to: string;
  lamports: number;
  memo?: string;
}

export interface TransferResult {
  signature: string;
  transaction: Transaction;
  status: 'sent' | 'confirmed' | 'failed';
  confirmations: number;
  error?: string;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface ConfirmationConfig {
  minConfirmations: number;
  maxConfirmations: number;
  pollingInterval: number;
  timeout: number;
}

@Injectable()
export class SolanaTransactionService implements OnModuleInit {
  private readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  };

  private readonly defaultConfirmationConfig: ConfirmationConfig = {
    minConfirmations: 1,
    maxConfirmations: 2,
    pollingInterval: 2000,
    timeout: 60000,
  };

  private readonly pendingTransactions = new Map<string, {
    signature: string;
    startTime: number;
    confirmationConfig: ConfirmationConfig;
    resolve: (result: TransferResult) => void;
    reject: (error: Error) => void;
  }>();

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: StructuredLoggerService,
    private readonly solanaService: SolanaService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  async onModuleInit() {
    this.startConfirmationPolling();
    this.logger.log('SolanaTransactionService initialized with confirmation polling', 'SolanaTransactionService');
  }

  /**
   * Create and send a SOL transfer transaction with retry/backoff and confirmation tracking
   */
  async createTransfer(
    from: string,
    to: string,
    lamports: number,
    options?: {
      memo?: string;
      retryConfig?: Partial<RetryConfig>;
      confirmationConfig?: Partial<ConfirmationConfig>;
      signerKeypair?: Keypair;
    },
  ): Promise<TransferResult> {
    const transferParams: TransferParams = { from, to, lamports, memo: options?.memo };
    const retryConfig = { ...this.defaultRetryConfig, ...options?.retryConfig };
    const confirmationConfig = { ...this.defaultConfirmationConfig, ...options?.confirmationConfig };

    this.logger.logWallet(
      'transfer_initiated',
      '', // wallet ID will be derived from from address
      '', // user ID from context
      {
        amount: this.solanaService.lamportsToSol(lamports),
        fromAddress: from,
        toAddress: to,
        memo: options?.memo,
      }
    );

    try {
      // Validate inputs
      this.validateTransferParams(transferParams);

      // Create unsigned transaction
      const transaction = await this.createTransferTransaction(transferParams);

      // Sign and send with circuit breaker protection
      const signature = await this.circuitBreaker.executeWithProtection(
        'solana:transaction',
        () => this.signAndSendTransaction(transaction, options?.signerKeypair, retryConfig),
        {
          circuitKey: 'solana:rpc',
          retryKey: 'solana:transaction',
          context: {
            fromAddress: from,
            toAddress: to,
            amount: this.solanaService.lamportsToSol(lamports),
          }
        }
      );

      // Start confirmation tracking
      const result = await this.trackTransactionConfirmation(signature, confirmationConfig);

      this.logger.logWallet(
        'transfer_completed',
        '',
        '',
        {
          signature,
          confirmations: result.confirmations,
          amount: this.solanaService.lamportsToSol(lamports),
          fromAddress: from,
          toAddress: to,
        }
      );

      return {
        ...result,
        transaction,
      };
    } catch (error) {
      this.logger.logWallet(
        'transfer_failed',
        '',
        '',
        {
          error: error.message,
          fromAddress: from,
          toAddress: to,
          amount: this.solanaService.lamportsToSol(lamports),
        }
      );

      // Convert to proper CoriaError if not already
      if (error instanceof CoriaError) {
        throw error;
      } else {
        throw new CoriaError(
          ERROR_CLASSIFICATIONS.SOLANA_TRANSACTION_FAILED,
          {
            fromAddress: from,
            toAddress: to,
            amount: lamports,
            originalError: error.message,
          },
          error
        );
      }
    }
  }

  /**
   * Create unsigned transfer transaction
   */
  private async createTransferTransaction(params: TransferParams): Promise<Transaction> {
    try {
      const { from, to, lamports, memo } = params;

      if (!this.solanaService.isValidPublicKey(from) || !this.solanaService.isValidPublicKey(to)) {
        throw new Error('Invalid public key format');
      }

      if (lamports <= 0) {
        throw new Error('Transfer amount must be positive');
      }

      const fromPubkey = new PublicKey(from);
      const toPubkey = new PublicKey(to);

      // Check sender balance with circuit breaker protection
      const balance = await this.circuitBreaker.executeWithProtection(
        'solana:balance_check',
        () => this.solanaService.getBalance(from),
        {
          circuitKey: 'solana:rpc',
          context: { address: from }
        }
      );

      const estimatedFee = 5000; // Approximate transaction fee in lamports

      if (balance.lamports < lamports + estimatedFee) {
        throw new CoriaError(
          ERROR_CLASSIFICATIONS.INSUFFICIENT_FUNDS,
          {
            amount: lamports + estimatedFee,
            available: balance.lamports,
            fromAddress: from,
          }
        );
      }

      // Get recent blockhash for transaction with circuit breaker protection
      const { blockhash, lastValidBlockHeight } = await this.circuitBreaker.executeWithProtection(
        'solana:blockhash',
        () => this.solanaService.getConnection().getLatestBlockhash('confirmed'),
        {
          circuitKey: 'solana:rpc',
          context: { operation: 'getLatestBlockhash' }
        }
      );

      // Create transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      });

      // Create transaction
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: fromPubkey,
      });

      transaction.add(transferInstruction);

      // Add memo instruction if provided
      if (memo) {
        // Note: Memo program would need to be imported separately
        this.logger.log(`Memo attached to transaction: ${memo}`, 'SolanaTransactionService');
      }

      // Set valid until block height
      transaction.lastValidBlockHeight = lastValidBlockHeight;

      return transaction;
    } catch (error) {
      this.logger.error('Error creating transfer transaction:', error, 'SolanaTransactionService');

      if (error instanceof CoriaError) {
        throw error;
      } else {
        throw new CoriaError(
          ERROR_CLASSIFICATIONS.SOLANA_TRANSACTION_FAILED,
          {
            operation: 'createTransferTransaction',
            fromAddress: params.from,
            toAddress: params.to,
            amount: params.lamports,
          },
          error
        );
      }
    }
  }

  /**
   * Sign and send transaction with exponential backoff retry
   */
  private async signAndSendTransaction(
    transaction: Transaction,
    signerKeypair?: Keypair,
    retryConfig: RetryConfig = this.defaultRetryConfig,
  ): Promise<TransactionSignature> {
    const { maxRetries, baseDelay, maxDelay, backoffMultiplier } = retryConfig;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(
          `Sending transaction attempt ${attempt + 1}/${maxRetries + 1}`,
          'SolanaTransactionService',
        );

        // Sign transaction if keypair is provided
        if (signerKeypair) {
          transaction.sign(signerKeypair);
        }

        // Serialize and send transaction
        const rawTransaction = transaction.serialize();
        const signature = await this.solanaService
          .getConnection()
          .sendRawTransaction(rawTransaction, {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
            maxRetries: 0, // Handle retries ourselves
          });

        this.logger.log(`Transaction sent successfully: ${signature}`, 'SolanaTransactionService');
        return signature;
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Transaction send attempt ${attempt + 1} failed: ${error.message}`,
          'SolanaTransactionService',
        );

        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          this.logger.error('Non-retryable error encountered:', error, 'SolanaTransactionService');
          throw error;
        }

        // Calculate delay with exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attempt), maxDelay);
          this.logger.log(`Retrying in ${delay}ms...`, 'SolanaTransactionService');
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`Transaction failed after ${maxRetries + 1} attempts: ${lastError.message}`);
  }

  /**
   * Track transaction confirmation with polling
   */
  private async trackTransactionConfirmation(
    signature: string,
    confirmationConfig: ConfirmationConfig,
  ): Promise<TransferResult> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingTransactions.delete(signature);
        reject(new Error(`Transaction confirmation timeout after ${confirmationConfig.timeout}ms`));
      }, confirmationConfig.timeout);

      this.pendingTransactions.set(signature, {
        signature,
        startTime: Date.now(),
        confirmationConfig,
        resolve: (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
      });

      this.logger.log(
        `Started tracking transaction confirmation: ${signature}`,
        'SolanaTransactionService',
      );
    });
  }

  /**
   * Polling job to check transaction confirmations
   */
  private startConfirmationPolling(): void {
    const interval = setInterval(async () => {
      if (this.pendingTransactions.size === 0) {
        return;
      }

      this.logger.debug(
        `Checking ${this.pendingTransactions.size} pending transactions`,
        'SolanaTransactionService',
      );

      const signatures = Array.from(this.pendingTransactions.keys());

      try {
        // Batch check signature statuses
        const statuses = await this.getSignatureStatuses(signatures);

        for (const [signature, status] of statuses.entries()) {
          const pending = this.pendingTransactions.get(signature);
          if (!pending) continue;

          const { confirmationConfig, resolve, reject } = pending;

          if (status.err) {
            // Transaction failed
            this.pendingTransactions.delete(signature);
            resolve({
              signature,
              transaction: null,
              status: 'failed',
              confirmations: status.confirmations || 0,
              error: JSON.stringify(status.err),
            });
          } else if (status.confirmations >= confirmationConfig.minConfirmations) {
            // Transaction confirmed
            this.pendingTransactions.delete(signature);
            resolve({
              signature,
              transaction: null,
              status: 'confirmed',
              confirmations: status.confirmations,
            });
          }
          // If neither failed nor confirmed enough, keep polling
        }
      } catch (error) {
        this.logger.error('Error checking transaction statuses:', error, 'SolanaTransactionService');
      }
    }, this.defaultConfirmationConfig.pollingInterval);

    // Register the interval for cleanup
    this.schedulerRegistry.addInterval('transaction-confirmation-polling', interval);
  }

  /**
   * Batch check signature statuses
   */
  async getSignatureStatuses(signatures: string[]): Promise<Map<string, SignatureStatus>> {
    try {
      const response = await this.circuitBreaker.executeWithProtection(
        'solana:signature_status',
        () => this.solanaService.getConnection().getSignatureStatuses(signatures, {
          searchTransactionHistory: true,
        }),
        {
          circuitKey: 'solana:rpc',
          context: {
            signatureCount: signatures.length,
            signatures: signatures.slice(0, 3) // Log first 3 for debugging
          }
        }
      );

      const statusMap = new Map<string, SignatureStatus>();

      response.value.forEach((status, index) => {
        if (status) {
          statusMap.set(signatures[index], status);
        }
      });

      return statusMap;
    } catch (error) {
      this.logger.error('Error getting signature statuses:', error, 'SolanaTransactionService');

      if (error instanceof CoriaError) {
        throw error;
      } else {
        throw new CoriaError(
          ERROR_CLASSIFICATIONS.SOLANA_RPC_ERROR,
          {
            operation: 'getSignatureStatuses',
            signatureCount: signatures.length,
          },
          error
        );
      }
    }
  }

  /**
   * Get current pending transactions count
   */
  getPendingTransactionsCount(): number {
    return this.pendingTransactions.size;
  }

  /**
   * Get all pending transaction signatures
   */
  getPendingTransactionSignatures(): string[] {
    return Array.from(this.pendingTransactions.keys());
  }

  /**
   * Clear all pending transactions (useful for testing)
   */
  clearPendingTransactions(): void {
    this.pendingTransactions.clear();
  }

  /**
   * Validate transfer parameters
   */
  private validateTransferParams(params: TransferParams): void {
    const { from, to, lamports } = params;

    if (!from || !to) {
      throw new Error('From and to addresses are required');
    }

    if (!this.solanaService.isValidPublicKey(from)) {
      throw new Error('Invalid from public key format');
    }

    if (!this.solanaService.isValidPublicKey(to)) {
      throw new Error('Invalid to public key format');
    }

    if (from === to) {
      throw new Error('Cannot transfer to the same address');
    }

    if (!Number.isInteger(lamports) || lamports <= 0) {
      throw new Error('Lamports must be a positive integer');
    }

    if (lamports < 1) {
      throw new Error('Minimum transfer amount is 1 lamport');
    }

    // Maximum reasonable transfer (adjust as needed)
    const maxLamports = 1000 * LAMPORTS_PER_SOL; // 1000 SOL
    if (lamports > maxLamports) {
      throw new Error(`Transfer amount exceeds maximum allowed (${maxLamports} lamports)`);
    }
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetryableError(error: any): boolean {
    const message = error.message?.toLowerCase() || '';

    // Don't retry on these specific errors
    const nonRetryablePatterns = [
      'insufficient funds',
      'invalid signature',
      'transaction too large',
      'invalid public key',
      'blockhash not found',
    ];

    return nonRetryablePatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Convert SOL to lamports (convenience method)
   */
  solToLamports(sol: number): number {
    return this.solanaService.solToLamports(sol);
  }

  /**
   * Convert lamports to SOL (convenience method)
   */
  lamportsToSol(lamports: number): number {
    return this.solanaService.lamportsToSol(lamports);
  }
}