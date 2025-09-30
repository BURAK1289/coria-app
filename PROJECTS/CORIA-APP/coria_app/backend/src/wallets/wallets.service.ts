import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@/common/services/supabase.service';
import { SolanaService } from '@/common/services/solana.service';
import { SigningService } from '@/common/services/signing.service';
import { LoggerService } from '@/common/services/logger.service';
import { SolanaWallet, WalletType, ApiResponse } from '@/common/types';
import { CreateWalletDto, ConnectWalletDto, UpdateWalletDto, SendTransactionDto } from './dto/wallets.dto';
import { Transaction } from '@solana/web3.js';

@Injectable()
export class WalletsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly solanaService: SolanaService,
    private readonly signingService: SigningService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Ensure user has a custodial wallet, create one if needed
   * This is the main entry point for wallet management
   */
  async ensureUserWallet(userEmail: string): Promise<SolanaWallet> {
    try {
      // Get user ID from email
      const userId = await this.getUserIdByEmail(userEmail);
      if (!userId) {
        throw new Error('User not found');
      }

      // Check if user already has a primary wallet
      let primaryWallet = await this.getPrimaryWallet(userId);

      if (primaryWallet) {
        this.logger.logWallet('wallet_ensured_existing', primaryWallet.id, userId, {
          publicKey: primaryWallet.publicKey,
          type: primaryWallet.type,
        });
        return primaryWallet;
      }

      // Create a new custodial wallet as primary
      primaryWallet = await this.createCustodialWalletSecure(userId, {
        name: 'CORIA Wallet',
        isPrimary: true,
        metadata: {
          createdVia: 'ensureUserWallet',
          userEmail: userEmail,
          autoCreated: true,
        },
      });

      this.logger.logWallet('wallet_ensured_created', primaryWallet.id, userId, {
        publicKey: primaryWallet.publicKey,
        userEmail: userEmail,
      });

      return primaryWallet;
    } catch (error) {
      this.logger.error(`Error ensuring wallet for user ${userEmail}:`, error, 'WalletsService');
      throw error;
    }
  }

  /**
   * Get user ID by email (using service role)
   */
  private async getUserIdByEmail(email: string): Promise<string | null> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const { data, error } = await serviceClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000, // Get enough users to search through
      });

      if (error || !data.users) {
        return null;
      }

      // Type assertion since we know the user objects have email property
      const user = (data.users as any[]).find((u: any) => u.email === email);
      return user?.id || null;
    } catch (error) {
      this.logger.error(`Error getting user by email ${email}:`, error, 'WalletsService');
      return null;
    }
  }

  /**
   * Create custodial wallet with secure key handling (no plaintext exposure)
   */
  private async createCustodialWalletSecure(userId: string, dto: CreateWalletDto): Promise<SolanaWallet> {
    try {
      // Generate secure custodial wallet through SigningService
      // The private key never leaves the signing service
      const walletInfo = await this.signingService.generateCustodialWallet(userId);

      // Use service role to write wallet data (RLS compliance)
      const serviceClient = this.supabaseService.getServiceClient();
      const { data, error } = await serviceClient
        .from('solana_wallets')
        .insert([
          {
            user_id: userId,
            public_key: walletInfo.publicKey,
            type: WalletType.CUSTODIAL,
            provider: 'custodial',
            is_primary: dto.isPrimary || false,
            name: dto.name || 'CORIA Custodial Wallet',
            kms_key_id: walletInfo.kmsKeyId, // Encrypted reference, not the key itself
            derivation_path: walletInfo.derivationPath,
            metadata: dto.metadata || {},
            balance_lamports: 0,
            last_balance_update: new Date().toISOString(),
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating secure custodial wallet:', error, 'WalletsService');
        throw new Error(`Failed to create custodial wallet: ${error.message}`);
      }

      // Log wallet creation (no sensitive data)
      this.logger.logWallet('secure_custodial_wallet_created', data.id, userId, {
        publicKey: walletInfo.publicKey,
        isPrimary: dto.isPrimary,
        kmsKeyId: walletInfo.kmsKeyId.substring(0, 8) + '...' // Partial KMS ID for logging
      });

      return data as SolanaWallet;
    } catch (error) {
      this.logger.error('Create secure custodial wallet error:', error, 'WalletsService');
      throw error;
    }
  }

  /**
   * Create a new custodial wallet for user
   */
  async createCustodialWallet(userId: string, dto: CreateWalletDto): Promise<SolanaWallet> {
    try {
      // Generate custodial wallet with KMS
      const walletInfo = await this.signingService.generateCustodialWallet(userId);

      // Create wallet record in database
      const serviceClient = this.supabaseService.getServiceClient();
      const { data, error } = await serviceClient
        .from('solana_wallets')
        .insert([
          {
            user_id: userId,
            public_key: walletInfo.publicKey,
            type: WalletType.CUSTODIAL,
            provider: 'custodial',
            is_primary: dto.isPrimary || false,
            name: dto.name || 'My Custodial Wallet',
            kms_key_id: walletInfo.kmsKeyId,
            derivation_path: walletInfo.derivationPath,
            metadata: dto.metadata || {},
          },
        ])
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating custodial wallet:', error, 'WalletsService');
        throw new Error(`Failed to create custodial wallet: ${error.message}`);
      }

      this.logger.logWallet('custodial_wallet_created', data.id, userId, {
        publicKey: walletInfo.publicKey,
        isPrimary: dto.isPrimary,
      });

      return data as SolanaWallet;
    } catch (error) {
      this.logger.error('Create custodial wallet error:', error, 'WalletsService');
      throw error;
    }
  }

  /**
   * Connect an external wallet (Phantom, Backpack, etc.)
   */
  async connectExternalWallet(userId: string, dto: ConnectWalletDto): Promise<SolanaWallet> {
    try {
      // Validate public key format
      if (!this.solanaService.isValidPublicKey(dto.publicKey)) {
        throw new Error('Invalid Solana public key format');
      }

      // Check if wallet already exists
      const existing = await this.getWalletByPublicKey(dto.publicKey);
      if (existing) {
        throw new Error('Wallet already connected to another user');
      }

      // Create external wallet record
      const serviceClient = this.supabaseService.getServiceClient();
      const { data, error } = await serviceClient
        .from('solana_wallets')
        .insert([
          {
            user_id: userId,
            public_key: dto.publicKey,
            type: WalletType.EXTERNAL,
            provider: dto.provider || 'external',
            is_primary: dto.isPrimary || false,
            name: dto.name || `${dto.provider || 'External'} Wallet`,
            metadata: dto.metadata || {},
          },
        ])
        .select()
        .single();

      if (error) {
        this.logger.error('Error connecting external wallet:', error, 'WalletsService');
        throw new Error(`Failed to connect external wallet: ${error.message}`);
      }

      this.logger.logWallet('external_wallet_connected', data.id, userId, {
        publicKey: dto.publicKey,
        provider: dto.provider,
        isPrimary: dto.isPrimary,
      });

      return data as SolanaWallet;
    } catch (error) {
      this.logger.error('Connect external wallet error:', error, 'WalletsService');
      throw error;
    }
  }

  /**
   * Get all wallets for a user
   */
  async getUserWallets(userId: string): Promise<SolanaWallet[]> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const { data, error } = await serviceClient
        .from('solana_wallets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error(`Error getting wallets for user ${userId}:`, error, 'WalletsService');
        throw new Error(`Failed to get user wallets: ${error.message}`);
      }

      return data as SolanaWallet[];
    } catch (error) {
      this.logger.error('Get user wallets error:', error, 'WalletsService');
      throw error;
    }
  }

  /**
   * Get wallet by ID
   */
  async getWalletById(walletId: string, userId?: string): Promise<SolanaWallet | null> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      let query = serviceClient
        .from('solana_wallets')
        .select('*')
        .eq('id', walletId)
        .eq('is_active', true);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') {
        this.logger.error(`Error getting wallet ${walletId}:`, error, 'WalletsService');
        throw new Error(`Failed to get wallet: ${error.message}`);
      }

      return data as SolanaWallet;
    } catch (error) {
      this.logger.error('Get wallet by ID error:', error, 'WalletsService');
      throw error;
    }
  }

  /**
   * Get wallet by public key
   */
  async getWalletByPublicKey(publicKey: string): Promise<SolanaWallet | null> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const { data, error } = await serviceClient
        .from('solana_wallets')
        .select('*')
        .eq('public_key', publicKey)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        this.logger.error(`Error getting wallet by public key ${publicKey}:`, error, 'WalletsService');
        throw new Error(`Failed to get wallet: ${error.message}`);
      }

      return data as SolanaWallet;
    } catch (error) {
      this.logger.error('Get wallet by public key error:', error, 'WalletsService');
      throw error;
    }
  }

  /**
   * Update wallet information
   */
  async updateWallet(walletId: string, userId: string, dto: UpdateWalletDto): Promise<SolanaWallet> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const { data, error } = await serviceClient
        .from('solana_wallets')
        .update({
          name: dto.name,
          is_primary: dto.isPrimary,
          metadata: dto.metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', walletId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .select()
        .single();

      if (error) {
        this.logger.error(`Error updating wallet ${walletId}:`, error, 'WalletsService');
        throw new Error(`Failed to update wallet: ${error.message}`);
      }

      this.logger.logWallet('wallet_updated', walletId, userId, dto);

      return data as SolanaWallet;
    } catch (error) {
      this.logger.error('Update wallet error:', error, 'WalletsService');
      throw error;
    }
  }

  /**
   * Deactivate a wallet (soft delete)
   */
  async deactivateWallet(walletId: string, userId: string): Promise<void> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const { error } = await serviceClient
        .from('solana_wallets')
        .update({
          is_active: false,
          is_primary: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', walletId)
        .eq('user_id', userId);

      if (error) {
        this.logger.error(`Error deactivating wallet ${walletId}:`, error, 'WalletsService');
        throw new Error(`Failed to deactivate wallet: ${error.message}`);
      }

      this.logger.logWallet('wallet_deactivated', walletId, userId);
    } catch (error) {
      this.logger.error('Deactivate wallet error:', error, 'WalletsService');
      throw error;
    }
  }

  /**
   * Refresh wallet balance
   */
  async refreshWalletBalance(walletId: string, userId: string): Promise<{ lamports: number; sol: number }> {
    try {
      // Get wallet info
      const wallet = await this.getWalletById(walletId, userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Get balance from Solana network
      const balance = await this.solanaService.getBalance(wallet.publicKey);

      // Update balance in database
      const serviceClient = this.supabaseService.getServiceClient();
      await serviceClient
        .from('solana_wallets')
        .update({
          balance_lamports: balance.lamports,
          last_balance_update: new Date().toISOString(),
        })
        .eq('id', walletId)
        .eq('user_id', userId);

      this.logger.logWallet('balance_refreshed', walletId, userId, {
        balance: balance.sol,
        lamports: balance.lamports,
      });

      return balance;
    } catch (error) {
      this.logger.error('Refresh wallet balance error:', error, 'WalletsService');
      throw error;
    }
  }

  /**
   * Set primary wallet
   */
  async setPrimaryWallet(walletId: string, userId: string): Promise<void> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();

      // First, remove primary status from all user wallets
      await serviceClient
        .from('solana_wallets')
        .update({ is_primary: false })
        .eq('user_id', userId);

      // Then set the specified wallet as primary
      const { error } = await serviceClient
        .from('solana_wallets')
        .update({ is_primary: true })
        .eq('id', walletId)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        this.logger.error(`Error setting primary wallet ${walletId}:`, error, 'WalletsService');
        throw new Error(`Failed to set primary wallet: ${error.message}`);
      }

      this.logger.logWallet('primary_wallet_set', walletId, userId);
    } catch (error) {
      this.logger.error('Set primary wallet error:', error, 'WalletsService');
      throw error;
    }
  }

  /**
   * Get user's primary wallet
   */
  async getPrimaryWallet(userId: string): Promise<SolanaWallet | null> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const { data, error } = await serviceClient
        .from('solana_wallets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        this.logger.error(`Error getting primary wallet for user ${userId}:`, error, 'WalletsService');
        throw new Error(`Failed to get primary wallet: ${error.message}`);
      }

      return data as SolanaWallet;
    } catch (error) {
      this.logger.error('Get primary wallet error:', error, 'WalletsService');
      throw error;
    }
  }

  /**
   * Send SOL from user's custodial wallet
   * Uses service role for secure transaction signing
   */
  async sendTransaction(userId: string, dto: SendTransactionDto): Promise<{ txSignature: string; amountSol: number }> {
    try {
      // Get user's wallet
      const wallet = dto.walletId
        ? await this.getWalletById(dto.walletId, userId)
        : await this.getPrimaryWallet(userId);

      if (!wallet) {
        throw new Error('No wallet found for user');
      }

      if (wallet.type !== WalletType.CUSTODIAL) {
        throw new Error('Can only send from custodial wallets via this endpoint');
      }

      // Validate destination address
      if (!this.solanaService.isValidPublicKey(dto.destinationAddress)) {
        throw new Error('Invalid destination address');
      }

      // Convert SOL to lamports
      const amountLamports = this.solanaService.solToLamports(dto.amountSol);

      // Check balance
      const currentBalance = await this.solanaService.getBalance(wallet.publicKey);
      if (currentBalance.lamports < amountLamports) {
        throw new Error('Insufficient balance');
      }

      // Create unsigned transaction
      const transaction = await this.solanaService.createTransferTransaction(
        wallet.publicKey,
        dto.destinationAddress,
        amountLamports
      );

      // Sign transaction using SigningService (secure, no key exposure)
      const signedTransaction = await this.signingService.signTransaction(
        transaction,
        wallet.publicKey,
        wallet.kmsKeyId!
      );

      // Send transaction to Solana network
      const txSignature = await this.solanaService.sendAndConfirmTransaction(signedTransaction);

      // Update wallet balance using service role
      await this.refreshWalletBalance(wallet.id, userId);

      // Log transaction
      this.logger.logWallet('transaction_sent', wallet.id, userId, {
        txSignature,
        amountSol: dto.amountSol,
        destination: dto.destinationAddress,
        walletType: wallet.type,
      });

      // Record activity using service role
      const serviceClient = this.supabaseService.getServiceClient();
      await serviceClient.from('wallet_activities').insert([
        {
          user_id: userId,
          wallet_id: wallet.id,
          activity_type: 'external_transfer_out',
          description: `Sent ${dto.amountSol} SOL to ${dto.destinationAddress}`,
          tx_signature: txSignature,
          amount_lamports: amountLamports,
          metadata: {
            destination: dto.destinationAddress,
            memo: dto.memo,
            sentAt: new Date().toISOString(),
          },
        },
      ]);

      return {
        txSignature,
        amountSol: dto.amountSol,
      };
    } catch (error) {
      this.logger.error('Send transaction error:', error, 'WalletsService');
      throw error;
    }
  }

  /**
   * Get user's wallet summary for /wallets/me endpoint
   */
  async getUserWalletSummary(userId: string): Promise<{
    wallets: SolanaWallet[];
    primary: SolanaWallet | null;
    totalBalance: { lamports: number; sol: number };
  }> {
    try {
      const wallets = await this.getUserWallets(userId);
      const primary = wallets.find(w => w.isPrimary) || null;

      // Calculate total balance across all wallets
      const totalLamports = wallets.reduce((sum, wallet) => sum + wallet.balanceLamports, 0);
      const totalBalance = {
        lamports: totalLamports,
        sol: this.solanaService.lamportsToSol(totalLamports),
      };

      return {
        wallets,
        primary,
        totalBalance,
      };
    } catch (error) {
      this.logger.error('Get user wallet summary error:', error, 'WalletsService');
      throw error;
    }
  }

  /**
   * Get consolidated balance for user
   */
  async getUserTotalBalance(userId: string): Promise<{ lamports: number; sol: number; walletCount: number }> {
    try {
      const wallets = await this.getUserWallets(userId);

      let totalLamports = 0;
      const activeWallets = wallets.filter(w => w.isActive);

      // Refresh balances for all wallets
      for (const wallet of activeWallets) {
        const balance = await this.refreshWalletBalance(wallet.id, userId);
        totalLamports += balance.lamports;
      }

      return {
        lamports: totalLamports,
        sol: this.solanaService.lamportsToSol(totalLamports),
        walletCount: activeWallets.length,
      };
    } catch (error) {
      this.logger.error('Get user total balance error:', error, 'WalletsService');
      throw error;
    }
  }
}