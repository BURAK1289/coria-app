import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionSignature,
  ConfirmedSignatureInfo,
  ParsedTransactionWithMeta,
} from '@solana/web3.js';
import { LoggerService } from './logger.service';

export interface TransactionStatus {
  signature: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  error?: string;
}

export interface SolanaBalance {
  lamports: number;
  sol: number;
}

@Injectable()
export class SolanaService implements OnModuleInit {
  private connection: Connection;
  private network: string;
  private rpcEndpoint: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    this.network = this.configService.get<string>('SOLANA_NETWORK', 'devnet');
    this.rpcEndpoint = this.configService.get<string>('RPC_ENDPOINT');

    if (!this.rpcEndpoint) {
      // Default RPC endpoints based on network
      const defaultEndpoints = {
        devnet: 'https://api.devnet.solana.com',
        'mainnet-beta': 'https://api.mainnet-beta.solana.com',
        testnet: 'https://api.testnet.solana.com',
      };
      this.rpcEndpoint = defaultEndpoints[this.network] || defaultEndpoints.devnet;
    }

    this.connection = new Connection(this.rpcEndpoint, 'confirmed');

    try {
      // Test connection
      const version = await this.connection.getVersion();
      this.logger.log(
        `Solana connection established - Network: ${this.network}, Version: ${version['solana-core']}`,
        'SolanaService',
      );
    } catch (error) {
      this.logger.error('Failed to connect to Solana RPC:', error, 'SolanaService');
      throw new Error(`Failed to connect to Solana RPC: ${error.message}`);
    }
  }

  /**
   * Get the Solana connection instance
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get current network information
   */
  getNetworkInfo() {
    return {
      network: this.network,
      rpcEndpoint: this.rpcEndpoint,
    };
  }

  /**
   * Validate Solana public key format
   */
  isValidPublicKey(publicKey: string): boolean {
    try {
      new PublicKey(publicKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate Solana transaction signature format
   */
  isValidSignature(signature: string): boolean {
    // Solana signatures are 88 characters base58
    return /^[1-9A-HJ-NP-Za-km-z]{88}$/.test(signature);
  }

  /**
   * Get account balance
   */
  async getBalance(publicKey: string): Promise<SolanaBalance> {
    try {
      if (!this.isValidPublicKey(publicKey)) {
        throw new Error('Invalid public key format');
      }

      const pubkey = new PublicKey(publicKey);
      const lamports = await this.connection.getBalance(pubkey);

      return {
        lamports,
        sol: lamports / LAMPORTS_PER_SOL,
      };
    } catch (error) {
      this.logger.error(`Error getting balance for ${publicKey}:`, error, 'SolanaService');
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Get transaction status and confirmations
   */
  async getTransactionStatus(signature: string): Promise<TransactionStatus> {
    try {
      if (!this.isValidSignature(signature)) {
        throw new Error('Invalid transaction signature format');
      }

      const status = await this.connection.getSignatureStatus(signature, {
        searchTransactionHistory: true,
      });

      if (!status.value) {
        return {
          signature,
          status: 'pending',
          confirmations: 0,
        };
      }

      if (status.value.err) {
        return {
          signature,
          status: 'failed',
          confirmations: status.value.confirmations || 0,
          error: JSON.stringify(status.value.err),
        };
      }

      return {
        signature,
        status: status.value.confirmationStatus === 'finalized' ? 'confirmed' : 'pending',
        confirmations: status.value.confirmations || 0,
      };
    } catch (error) {
      this.logger.error(`Error getting transaction status for ${signature}:`, error, 'SolanaService');
      throw new Error(`Failed to get transaction status: ${error.message}`);
    }
  }

  /**
   * Get parsed transaction details
   */
  async getTransaction(signature: string): Promise<ParsedTransactionWithMeta | null> {
    try {
      if (!this.isValidSignature(signature)) {
        throw new Error('Invalid transaction signature format');
      }

      const transaction = await this.connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      return transaction;
    } catch (error) {
      this.logger.error(`Error getting transaction ${signature}:`, error, 'SolanaService');
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }

  /**
   * Get recent transactions for an account
   */
  async getRecentTransactions(
    publicKey: string,
    limit: number = 10,
  ): Promise<ConfirmedSignatureInfo[]> {
    try {
      if (!this.isValidPublicKey(publicKey)) {
        throw new Error('Invalid public key format');
      }

      const pubkey = new PublicKey(publicKey);
      const signatures = await this.connection.getSignaturesForAddress(pubkey, {
        limit,
      });

      return signatures;
    } catch (error) {
      this.logger.error(`Error getting transactions for ${publicKey}:`, error, 'SolanaService');
      throw new Error(`Failed to get recent transactions: ${error.message}`);
    }
  }

  /**
   * Create a transfer transaction (unsigned)
   */
  async createTransferTransaction(
    fromPublicKey: string,
    toPublicKey: string,
    lamports: number,
  ): Promise<Transaction> {
    try {
      if (!this.isValidPublicKey(fromPublicKey) || !this.isValidPublicKey(toPublicKey)) {
        throw new Error('Invalid public key format');
      }

      if (lamports <= 0) {
        throw new Error('Transfer amount must be positive');
      }

      const fromPubkey = new PublicKey(fromPublicKey);
      const toPubkey = new PublicKey(toPublicKey);

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();

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
      }).add(transferInstruction);

      return transaction;
    } catch (error) {
      this.logger.error('Error creating transfer transaction:', error, 'SolanaService');
      throw new Error(`Failed to create transfer transaction: ${error.message}`);
    }
  }

  /**
   * Send and confirm transaction
   */
  async sendAndConfirmTransaction(
    signedTransaction: Transaction,
    commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed',
  ): Promise<TransactionSignature> {
    try {
      const rawTransaction = signedTransaction.serialize();
      const signature = await this.connection.sendRawTransaction(rawTransaction, {
        skipPreflight: false,
        preflightCommitment: commitment,
      });

      // Wait for confirmation
      await this.connection.confirmTransaction(signature, commitment);

      return signature;
    } catch (error) {
      this.logger.error('Error sending transaction:', error, 'SolanaService');
      throw new Error(`Failed to send transaction: ${error.message}`);
    }
  }

  /**
   * Estimate transaction fee
   */
  async estimateTransactionFee(transaction: Transaction): Promise<number> {
    try {
      const fee = await this.connection.getFeeForMessage(
        transaction.compileMessage(),
        'confirmed',
      );

      return fee.value || 0;
    } catch (error) {
      this.logger.error('Error estimating transaction fee:', error, 'SolanaService');
      throw new Error(`Failed to estimate transaction fee: ${error.message}`);
    }
  }

  /**
   * Convert SOL to lamports
   */
  solToLamports(sol: number): number {
    return Math.floor(sol * LAMPORTS_PER_SOL);
  }

  /**
   * Convert lamports to SOL
   */
  lamportsToSol(lamports: number): number {
    return lamports / LAMPORTS_PER_SOL;
  }

  /**
   * Get current slot
   */
  async getCurrentSlot(): Promise<number> {
    try {
      return await this.connection.getSlot();
    } catch (error) {
      this.logger.error('Error getting current slot:', error, 'SolanaService');
      throw new Error(`Failed to get current slot: ${error.message}`);
    }
  }

  /**
   * Get minimum balance for rent exemption
   */
  async getMinimumBalanceForRentExemption(dataLength: number = 0): Promise<number> {
    try {
      return await this.connection.getMinimumBalanceForRentExemption(dataLength);
    } catch (error) {
      this.logger.error('Error getting minimum balance for rent exemption:', error, 'SolanaService');
      throw new Error(`Failed to get minimum balance: ${error.message}`);
    }
  }
}