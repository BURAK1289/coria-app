import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { LoggerService } from './logger.service';

export interface CustodialWalletInfo {
  publicKey: string;
  derivationPath: string;
  kmsKeyId: string;
}

export interface SigningResult {
  signature: string;
  publicKey: string;
}

@Injectable()
export class SigningService {
  private kmsEnabled: boolean;
  private kmsKeyId: string;
  private kmsRegion: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.kmsEnabled = this.configService.get<string>('KMS_ENABLED', 'false') === 'true';
    this.kmsKeyId = this.configService.get<string>('KMS_KEY_ID');
    this.kmsRegion = this.configService.get<string>('KMS_REGION', 'us-east-1');

    if (this.kmsEnabled && !this.kmsKeyId) {
      throw new Error('KMS_KEY_ID is required when KMS_ENABLED is true');
    }

    this.logger.log(
      `Signing service initialized - KMS Enabled: ${this.kmsEnabled}`,
      'SigningService',
    );
  }

  /**
   * Generate a new custodial wallet
   * In production, this would use KMS to generate and store the private key
   */
  async generateCustodialWallet(
    userId: string,
    accountIndex: number = 0,
  ): Promise<CustodialWalletInfo> {
    try {
      // Derive BIP44 path: m/44'/501'/account'/0/0
      const derivationPath = `m/44'/501'/${accountIndex}'/0/0`;

      if (this.kmsEnabled) {
        // In production: Use KMS to generate keypair
        return await this.generateKmsWallet(userId, derivationPath);
      } else {
        // Development: Generate local keypair (NEVER use in production)
        return await this.generateLocalWallet(userId, derivationPath);
      }
    } catch (error) {
      this.logger.error('Error generating custodial wallet:', error, 'SigningService');
      throw new Error(`Failed to generate custodial wallet: ${error.message}`);
    }
  }

  /**
   * Sign a transaction with a custodial wallet
   * In production, this would use KMS to sign without exposing private keys
   */
  async signTransaction(
    transaction: Transaction,
    walletPublicKey: string,
    kmsKeyId: string,
  ): Promise<Transaction> {
    try {
      if (this.kmsEnabled) {
        // In production: Use KMS to sign transaction
        return await this.signWithKms(transaction, walletPublicKey, kmsKeyId);
      } else {
        // Development: Use local signing (NEVER use in production)
        return await this.signWithLocal(transaction, walletPublicKey);
      }
    } catch (error) {
      this.logger.error('Error signing transaction:', error, 'SigningService');
      throw new Error(`Failed to sign transaction: ${error.message}`);
    }
  }

  /**
   * Verify that a wallet belongs to the system (custodial wallet verification)
   */
  async verifyCustodialWallet(
    publicKey: string,
    kmsKeyId: string,
    derivationPath: string,
  ): Promise<boolean> {
    try {
      if (this.kmsEnabled) {
        // In production: Verify against KMS
        return await this.verifyWithKms(publicKey, kmsKeyId, derivationPath);
      } else {
        // Development: Simple validation
        return this.isValidLocalWallet(publicKey);
      }
    } catch (error) {
      this.logger.error('Error verifying custodial wallet:', error, 'SigningService');
      return false;
    }
  }

  /**
   * Generate message signature for authentication
   */
  async signMessage(
    message: string,
    walletPublicKey: string,
    kmsKeyId?: string,
  ): Promise<SigningResult> {
    try {
      const messageBytes = new TextEncoder().encode(message);

      if (this.kmsEnabled && kmsKeyId) {
        // In production: Sign with KMS
        return await this.signMessageWithKms(messageBytes, walletPublicKey, kmsKeyId);
      } else {
        // Development: Sign locally
        return await this.signMessageLocally(messageBytes, walletPublicKey);
      }
    } catch (error) {
      this.logger.error('Error signing message:', error, 'SigningService');
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }

  /**
   * KMS wallet generation (production implementation)
   */
  private async generateKmsWallet(
    userId: string,
    derivationPath: string,
  ): Promise<CustodialWalletInfo> {
    // TODO: Implement actual KMS integration
    // This is a stub for production KMS integration
    this.logger.warn(
      'KMS wallet generation not implemented - using local fallback',
      'SigningService',
    );

    // For now, fall back to local generation with warning
    return this.generateLocalWallet(userId, derivationPath);
  }

  /**
   * Local wallet generation (development only)
   */
  private async generateLocalWallet(
    userId: string,
    derivationPath: string,
  ): Promise<CustodialWalletInfo> {
    this.logger.warn(
      'Using local wallet generation - NEVER use in production!',
      'SigningService',
    );

    // Generate a new keypair
    const keypair = Keypair.generate();

    // In development, we'll use a deterministic KMS key ID
    const mockKmsKeyId = `dev-key-${userId}-${Date.now()}`;

    // Store the private key securely (in production, this would be in KMS)
    await this.storePrivateKeyLocally(keypair, mockKmsKeyId);

    return {
      publicKey: keypair.publicKey.toString(),
      derivationPath,
      kmsKeyId: mockKmsKeyId,
    };
  }

  /**
   * KMS transaction signing (production implementation)
   */
  private async signWithKms(
    transaction: Transaction,
    walletPublicKey: string,
    kmsKeyId: string,
  ): Promise<Transaction> {
    // TODO: Implement actual KMS signing
    this.logger.warn(
      'KMS transaction signing not implemented - using local fallback',
      'SigningService',
    );

    return this.signWithLocal(transaction, walletPublicKey);
  }

  /**
   * Local transaction signing (development only)
   */
  private async signWithLocal(
    transaction: Transaction,
    walletPublicKey: string,
  ): Promise<Transaction> {
    this.logger.warn(
      'Using local transaction signing - NEVER use in production!',
      'SigningService',
    );

    // Retrieve the private key (in production, this would come from KMS)
    const keypair = await this.getPrivateKeyLocally(walletPublicKey);

    if (!keypair) {
      throw new Error('Private key not found for wallet');
    }

    // Sign the transaction
    transaction.sign(keypair);

    return transaction;
  }

  /**
   * KMS wallet verification (production implementation)
   */
  private async verifyWithKms(
    publicKey: string,
    kmsKeyId: string,
    derivationPath: string,
  ): Promise<boolean> {
    // TODO: Implement actual KMS verification
    this.logger.warn(
      'KMS wallet verification not implemented - using local fallback',
      'SigningService',
    );

    return this.isValidLocalWallet(publicKey);
  }

  /**
   * Local wallet verification (development only)
   */
  private isValidLocalWallet(publicKey: string): boolean {
    try {
      new PublicKey(publicKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * KMS message signing (production implementation)
   */
  private async signMessageWithKms(
    messageBytes: Uint8Array,
    walletPublicKey: string,
    kmsKeyId: string,
  ): Promise<SigningResult> {
    // TODO: Implement actual KMS message signing
    this.logger.warn(
      'KMS message signing not implemented - using local fallback',
      'SigningService',
    );

    return this.signMessageLocally(messageBytes, walletPublicKey);
  }

  /**
   * Local message signing (development only)
   */
  private async signMessageLocally(
    messageBytes: Uint8Array,
    walletPublicKey: string,
  ): Promise<SigningResult> {
    const keypair = await this.getPrivateKeyLocally(walletPublicKey);

    if (!keypair) {
      throw new Error('Private key not found for wallet');
    }

    // In Solana, message signing typically uses nacl.sign.detached
    // For this stub, we'll return a mock signature
    const signature = Buffer.from(messageBytes).toString('hex');

    return {
      signature,
      publicKey: walletPublicKey,
    };
  }

  // Development-only storage methods (replace with KMS in production)
  private localKeyStore = new Map<string, Keypair>();

  private async storePrivateKeyLocally(keypair: Keypair, keyId: string): Promise<void> {
    this.localKeyStore.set(keypair.publicKey.toString(), keypair);
    this.logger.debug(`Stored private key locally for ${keypair.publicKey.toString()}`);
  }

  private async getPrivateKeyLocally(publicKey: string): Promise<Keypair | null> {
    return this.localKeyStore.get(publicKey) || null;
  }

  /**
   * Health check for signing service
   */
  getStatus() {
    return {
      kmsEnabled: this.kmsEnabled,
      kmsRegion: this.kmsRegion,
      kmsKeyId: this.kmsKeyId ? '***configured***' : 'not configured',
      localKeysStored: this.localKeyStore.size,
    };
  }
}