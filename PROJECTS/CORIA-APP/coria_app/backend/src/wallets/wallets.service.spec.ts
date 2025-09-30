import { Test, TestingModule } from '@nestjs/testing';
import { WalletsService } from './wallets.service';
import { SupabaseService } from '@/common/services/supabase.service';
import { SolanaService } from '@/common/services/solana.service';
import { SigningService } from '@/common/services/signing.service';
import { LoggerService } from '@/common/services/logger.service';
import { WalletType } from '@/common/types';
import { CreateWalletDto, SendTransactionDto } from './dto/wallets.dto';
import { Transaction } from '@solana/web3.js';

// Mock implementations
const mockSupabaseService = {
  getServiceClient: jest.fn(),
  getUserFromToken: jest.fn(),
};

const mockSolanaService = {
  isValidPublicKey: jest.fn(),
  getBalance: jest.fn(),
  solToLamports: jest.fn(),
  lamportsToSol: jest.fn(),
  createTransferTransaction: jest.fn(),
  sendAndConfirmTransaction: jest.fn(),
};

const mockSigningService = {
  generateCustodialWallet: jest.fn(),
  signTransaction: jest.fn(),
};

const mockLoggerService = {
  logWallet: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Test data
const mockUserId = 'user-123';
const mockUserEmail = 'test@example.com';
const mockWalletId = 'wallet-456';
const mockPublicKey = '11111111111111111111111111111111';
const mockKmsKeyId = 'kms-key-789';
const mockTxSignature = '5' + '1'.repeat(87); // Valid 88-char signature

const mockWallet = {
  id: mockWalletId,
  userId: mockUserId,
  publicKey: mockPublicKey,
  type: WalletType.CUSTODIAL,
  provider: 'custodial',
  isPrimary: true,
  name: 'Test Wallet',
  balanceLamports: 1000000000, // 1 SOL
  kmsKeyId: mockKmsKeyId,
  derivationPath: "m/44'/501'/0'/0/0",
  isActive: true,
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSupabaseClient = {
  auth: {
    admin: {
      listUsers: jest.fn(),
    },
  },
  from: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  update: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
};

describe('WalletsService', () => {
  let service: WalletsService;
  let supabaseService: SupabaseService;
  let solanaService: SolanaService;
  let signingService: SigningService;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: SolanaService, useValue: mockSolanaService },
        { provide: SigningService, useValue: mockSigningService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    solanaService = module.get<SolanaService>(SolanaService);
    signingService = module.get<SigningService>(SigningService);
    loggerService = module.get<LoggerService>(LoggerService);

    // Reset mocks
    jest.clearAllMocks();

    // Reset all mock return values
    mockSupabaseClient.from.mockReturnThis();
    mockSupabaseClient.insert.mockReturnThis();
    mockSupabaseClient.select.mockReturnThis();
    mockSupabaseClient.eq.mockReturnThis();
    mockSupabaseClient.update.mockReturnThis();
    mockSupabaseClient.order.mockReturnThis();

    mockSupabaseService.getServiceClient.mockReturnValue(mockSupabaseClient);
  });

  describe('ensureUserWallet', () => {
    it('should return existing primary wallet if user has one', async () => {
      // Arrange
      mockSupabaseClient.auth.admin.listUsers.mockResolvedValue({
        data: { users: [{ id: mockUserId, email: mockUserEmail }] },
        error: null,
      });

      mockSupabaseClient.single.mockResolvedValue({
        data: mockWallet,
        error: null,
      });

      // Act
      const result = await service.ensureUserWallet(mockUserEmail);

      // Assert
      expect(result).toEqual(mockWallet);
      expect(mockLoggerService.logWallet).toHaveBeenCalledWith(
        'wallet_ensured_existing',
        mockWalletId,
        mockUserId,
        expect.objectContaining({
          publicKey: mockPublicKey,
          type: WalletType.CUSTODIAL,
        }),
      );
    });

    it('should create new custodial wallet if user has none', async () => {
      // Arrange
      mockSupabaseClient.auth.admin.listUsers.mockResolvedValue({
        data: { users: [{ id: mockUserId, email: mockUserEmail }] },
        error: null,
      });

      // First call for primary wallet returns null (no primary wallet)
      mockSupabaseClient.single
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
        .mockResolvedValueOnce({ data: mockWallet, error: null });

      mockSigningService.generateCustodialWallet.mockResolvedValue({
        publicKey: mockPublicKey,
        kmsKeyId: mockKmsKeyId,
        derivationPath: "m/44'/501'/0'/0/0",
      });

      // Act
      const result = await service.ensureUserWallet(mockUserEmail);

      // Assert
      expect(result).toEqual(mockWallet);
      expect(mockSigningService.generateCustodialWallet).toHaveBeenCalledWith(mockUserId);
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          user_id: mockUserId,
          public_key: mockPublicKey,
          type: WalletType.CUSTODIAL,
          provider: 'custodial',
          is_primary: true,
          name: 'CORIA Wallet',
          kms_key_id: mockKmsKeyId,
        }),
      ]);
      expect(mockLoggerService.logWallet).toHaveBeenCalledWith(
        'wallet_ensured_created',
        mockWalletId,
        mockUserId,
        expect.objectContaining({
          publicKey: mockPublicKey,
          userEmail: mockUserEmail,
        }),
      );
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockSupabaseClient.auth.admin.listUsers.mockResolvedValue({
        data: { users: [] },
        error: null,
      });

      // Act & Assert
      await expect(service.ensureUserWallet(mockUserEmail)).rejects.toThrow('User not found');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockSupabaseClient.auth.admin.listUsers.mockResolvedValue({
        data: { users: [{ id: mockUserId, email: mockUserEmail }] },
        error: null,
      });

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' },
      });

      // Act & Assert
      await expect(service.ensureUserWallet(mockUserEmail)).rejects.toThrow();
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  });

  describe('sendTransaction', () => {
    const sendDto: SendTransactionDto = {
      destinationAddress: '22222222222222222222222222222222',
      amountSol: 0.5,
      memo: 'Test payment',
    };

    beforeEach(() => {
      mockSolanaService.isValidPublicKey.mockReturnValue(true);
      mockSolanaService.solToLamports.mockReturnValue(500000000); // 0.5 SOL
      mockSolanaService.getBalance.mockResolvedValue({
        lamports: 1000000000, // 1 SOL
        sol: 1.0,
      });
      mockSolanaService.createTransferTransaction.mockResolvedValue(new Transaction());
      mockSigningService.signTransaction.mockResolvedValue(new Transaction());
      mockSolanaService.sendAndConfirmTransaction.mockResolvedValue(mockTxSignature);
    });

    it('should successfully send transaction from custodial wallet', async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValue({
        data: mockWallet,
        error: null,
      });

      mockSupabaseClient.insert.mockResolvedValue({
        data: [{}],
        error: null,
      });

      // Mock refresh balance
      service.refreshWalletBalance = jest.fn().mockResolvedValue({
        lamports: 500000000,
        sol: 0.5,
      });

      // Act
      const result = await service.sendTransaction(mockUserId, sendDto);

      // Assert
      expect(result).toEqual({
        txSignature: mockTxSignature,
        amountSol: 0.5,
      });

      expect(mockSolanaService.isValidPublicKey).toHaveBeenCalledWith(sendDto.destinationAddress);
      expect(mockSolanaService.createTransferTransaction).toHaveBeenCalledWith(
        mockPublicKey,
        sendDto.destinationAddress,
        500000000,
      );
      expect(mockSigningService.signTransaction).toHaveBeenCalledWith(
        expect.any(Transaction),
        mockPublicKey,
        mockKmsKeyId,
      );
      expect(mockLoggerService.logWallet).toHaveBeenCalledWith(
        'transaction_sent',
        mockWalletId,
        mockUserId,
        expect.objectContaining({
          txSignature: mockTxSignature,
          amountSol: 0.5,
          destination: sendDto.destinationAddress,
        }),
      );
    });

    it('should throw error for invalid destination address', async () => {
      // Arrange
      mockSolanaService.isValidPublicKey.mockReturnValue(false);
      mockSupabaseClient.single.mockResolvedValue({
        data: mockWallet,
        error: null,
      });

      // Act & Assert
      await expect(service.sendTransaction(mockUserId, sendDto)).rejects.toThrow(
        'Invalid destination address',
      );
    });

    it('should throw error for insufficient balance', async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValue({
        data: mockWallet,
        error: null,
      });

      mockSolanaService.getBalance.mockResolvedValue({
        lamports: 100000000, // 0.1 SOL (less than required 0.5 SOL)
        sol: 0.1,
      });

      // Act & Assert
      await expect(service.sendTransaction(mockUserId, sendDto)).rejects.toThrow(
        'Insufficient balance',
      );
    });

    it('should throw error for external wallet', async () => {
      // Arrange
      const externalWallet = {
        ...mockWallet,
        type: WalletType.EXTERNAL,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: externalWallet,
        error: null,
      });

      // Act & Assert
      await expect(service.sendTransaction(mockUserId, sendDto)).rejects.toThrow(
        'Can only send from custodial wallets via this endpoint',
      );
    });

    it('should throw error if no wallet found', async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      // Act & Assert
      await expect(service.sendTransaction(mockUserId, sendDto)).rejects.toThrow(
        'No wallet found for user',
      );
    });
  });

  describe('getUserWalletSummary', () => {
    it('should return wallet summary with primary wallet and total balance', async () => {
      // Arrange
      const wallets = [
        mockWallet,
        {
          ...mockWallet,
          id: 'wallet-789',
          isPrimary: false,
          balanceLamports: 500000000, // 0.5 SOL
        },
      ];

      mockSupabaseClient.order.mockResolvedValue({
        data: wallets,
        error: null,
      });

      mockSolanaService.lamportsToSol.mockReturnValue(1.5);

      // Act
      const result = await service.getUserWalletSummary(mockUserId);

      // Assert
      expect(result).toEqual({
        wallets,
        primary: mockWallet,
        totalBalance: {
          lamports: 1500000000, // 1.5 SOL total
          sol: 1.5,
        },
      });
    });

    it('should handle user with no wallets', async () => {
      // Arrange
      mockSupabaseClient.order.mockResolvedValue({
        data: [],
        error: null,
      });

      mockSolanaService.lamportsToSol.mockReturnValue(0);

      // Act
      const result = await service.getUserWalletSummary(mockUserId);

      // Assert
      expect(result).toEqual({
        wallets: [],
        primary: null,
        totalBalance: {
          lamports: 0,
          sol: 0,
        },
      });
    });
  });

  describe('getUserTotalBalance', () => {
    it('should refresh and return total balance across all wallets', async () => {
      // Arrange
      const wallets = [
        mockWallet,
        {
          ...mockWallet,
          id: 'wallet-789',
          balanceLamports: 500000000,
        },
      ];

      mockSupabaseClient.order.mockResolvedValue({
        data: wallets,
        error: null,
      });

      // Mock refresh balance for each wallet
      service.refreshWalletBalance = jest
        .fn()
        .mockResolvedValueOnce({ lamports: 1000000000, sol: 1.0 })
        .mockResolvedValueOnce({ lamports: 500000000, sol: 0.5 });

      mockSolanaService.lamportsToSol.mockReturnValue(1.5);

      // Act
      const result = await service.getUserTotalBalance(mockUserId);

      // Assert
      expect(result).toEqual({
        lamports: 1500000000,
        sol: 1.5,
        walletCount: 2,
      });

      expect(service.refreshWalletBalance).toHaveBeenCalledTimes(2);
    });
  });

  describe('createCustodialWallet', () => {
    it('should create custodial wallet with secure key handling', async () => {
      // Arrange
      const createDto: CreateWalletDto = {
        name: 'My Test Wallet',
        isPrimary: false,
        metadata: { test: true },
      };

      mockSigningService.generateCustodialWallet.mockResolvedValue({
        publicKey: mockPublicKey,
        kmsKeyId: mockKmsKeyId,
        derivationPath: "m/44'/501'/0'/0/0",
      });

      mockSupabaseClient.single.mockResolvedValue({
        data: mockWallet,
        error: null,
      });

      // Act
      const result = await service.createCustodialWallet(mockUserId, createDto);

      // Assert
      expect(result).toEqual(mockWallet);
      expect(mockSigningService.generateCustodialWallet).toHaveBeenCalledWith(mockUserId);
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          user_id: mockUserId,
          public_key: mockPublicKey,
          type: WalletType.CUSTODIAL,
          kms_key_id: mockKmsKeyId,
          name: createDto.name,
          metadata: createDto.metadata,
        }),
      ]);
    });

    it('should handle signing service errors', async () => {
      // Arrange
      const createDto: CreateWalletDto = { name: 'Test Wallet' };

      mockSigningService.generateCustodialWallet.mockRejectedValue(
        new Error('KMS service unavailable'),
      );

      // Act & Assert
      await expect(service.createCustodialWallet(mockUserId, createDto)).rejects.toThrow(
        'KMS service unavailable',
      );
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  });

  describe('refreshWalletBalance', () => {
    it('should refresh wallet balance from Solana network', async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValue({
        data: mockWallet,
        error: null,
      });

      mockSolanaService.getBalance.mockResolvedValue({
        lamports: 2000000000, // 2 SOL
        sol: 2.0,
      });

      mockSupabaseClient.update.mockResolvedValue({
        data: {},
        error: null,
      });

      // Act
      const result = await service.refreshWalletBalance(mockWalletId, mockUserId);

      // Assert
      expect(result).toEqual({
        lamports: 2000000000,
        sol: 2.0,
      });

      expect(mockSolanaService.getBalance).toHaveBeenCalledWith(mockPublicKey);
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        balance_lamports: 2000000000,
        last_balance_update: expect.any(String),
      });
      expect(mockLoggerService.logWallet).toHaveBeenCalledWith(
        'balance_refreshed',
        mockWalletId,
        mockUserId,
        expect.objectContaining({
          balance: 2.0,
          lamports: 2000000000,
        }),
      );
    });

    it('should throw error if wallet not found', async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      // Act & Assert
      await expect(service.refreshWalletBalance(mockWalletId, mockUserId)).rejects.toThrow(
        'Wallet not found',
      );
    });
  });
});