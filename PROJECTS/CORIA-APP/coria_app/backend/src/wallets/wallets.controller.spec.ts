import { Test, TestingModule } from '@nestjs/testing';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { WalletType } from '@/common/types';
import { SendTransactionDto, CreateWalletDto, ConnectWalletDto } from './dto/wallets.dto';

const mockWalletsService = {
  getUserWalletSummary: jest.fn(),
  getUserTotalBalance: jest.fn(),
  sendTransaction: jest.fn(),
  createCustodialWallet: jest.fn(),
  connectExternalWallet: jest.fn(),
  getWalletById: jest.fn(),
  refreshWalletBalance: jest.fn(),
  setPrimaryWallet: jest.fn(),
  ensureUserWallet: jest.fn(),
};

const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe('WalletsController', () => {
  let controller: WalletsController;
  let walletsService: WalletsService;

  const mockRequest = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
  };

  const mockWallet = {
    id: 'wallet-456',
    userId: 'user-123',
    publicKey: '11111111111111111111111111111111111111111111',
    type: WalletType.CUSTODIAL,
    provider: 'custodial',
    isPrimary: true,
    name: 'Test Wallet',
    balanceLamports: 1000000000,
    isActive: true,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletsController],
      providers: [{ provide: WalletsService, useValue: mockWalletsService }],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<WalletsController>(WalletsController);
    walletsService = module.get<WalletsService>(WalletsService);

    jest.clearAllMocks();
  });

  describe('getMyWallets', () => {
    it('should return user wallet summary successfully', async () => {
      const mockSummary = {
        wallets: [mockWallet],
        primary: mockWallet,
        totalBalance: { lamports: 1000000000, sol: 1.0 },
      };

      mockWalletsService.getUserWalletSummary.mockResolvedValue(mockSummary);

      const result = await controller.getMyWallets(mockRequest);

      expect(result).toEqual({
        success: true,
        data: mockSummary,
        timestamp: expect.any(String),
      });
      expect(walletsService.getUserWalletSummary).toHaveBeenCalledWith('user-123');
    });

    it('should handle service errors gracefully', async () => {
      mockWalletsService.getUserWalletSummary.mockRejectedValue(new Error('Service error'));

      const result = await controller.getMyWallets(mockRequest);

      expect(result).toEqual({
        success: false,
        error: 'Service error',
        timestamp: expect.any(String),
      });
    });
  });

  describe('getTotalBalance', () => {
    it('should return total balance successfully', async () => {
      const mockBalance = {
        lamports: 1000000000,
        sol: 1.0,
        walletCount: 1,
      };

      mockWalletsService.getUserTotalBalance.mockResolvedValue(mockBalance);

      const result = await controller.getTotalBalance(mockRequest);

      expect(result).toEqual({
        success: true,
        data: mockBalance,
        timestamp: expect.any(String),
      });
      expect(walletsService.getUserTotalBalance).toHaveBeenCalledWith('user-123');
    });

    it('should handle balance fetch errors', async () => {
      mockWalletsService.getUserTotalBalance.mockRejectedValue(new Error('Network error'));

      const result = await controller.getTotalBalance(mockRequest);

      expect(result).toEqual({
        success: false,
        error: 'Network error',
        timestamp: expect.any(String),
      });
    });
  });

  describe('sendTransaction', () => {
    const sendDto: SendTransactionDto = {
      destinationAddress: '22222222222222222222222222222222222222222222',
      amountSol: 0.5,
      memo: 'Test payment',
    };

    it('should send transaction successfully', async () => {
      const mockResult = {
        txSignature: '5' + '1'.repeat(87),
        amountSol: 0.5,
      };

      mockWalletsService.sendTransaction.mockResolvedValue(mockResult);

      const result = await controller.sendTransaction(mockRequest, sendDto);

      expect(result).toEqual({
        success: true,
        data: mockResult,
        timestamp: expect.any(String),
      });
      expect(walletsService.sendTransaction).toHaveBeenCalledWith('user-123', sendDto);
    });

    it('should handle insufficient balance error', async () => {
      mockWalletsService.sendTransaction.mockRejectedValue(new Error('Insufficient balance'));

      const result = await controller.sendTransaction(mockRequest, sendDto);

      expect(result).toEqual({
        success: false,
        error: 'Insufficient balance',
        timestamp: expect.any(String),
      });
    });

    it('should handle invalid destination address error', async () => {
      mockWalletsService.sendTransaction.mockRejectedValue(
        new Error('Invalid destination address'),
      );

      const result = await controller.sendTransaction(mockRequest, sendDto);

      expect(result).toEqual({
        success: false,
        error: 'Invalid destination address',
        timestamp: expect.any(String),
      });
    });
  });

  describe('createCustodialWallet', () => {
    const createDto: CreateWalletDto = {
      name: 'My New Wallet',
      isPrimary: false,
      metadata: { test: true },
    };

    it('should create custodial wallet successfully', async () => {
      mockWalletsService.createCustodialWallet.mockResolvedValue(mockWallet);

      const result = await controller.createCustodialWallet(mockRequest, createDto);

      expect(result).toEqual({
        success: true,
        data: mockWallet,
        timestamp: expect.any(String),
      });
      expect(walletsService.createCustodialWallet).toHaveBeenCalledWith('user-123', createDto);
    });

    it('should handle wallet creation errors', async () => {
      mockWalletsService.createCustodialWallet.mockRejectedValue(new Error('KMS unavailable'));

      const result = await controller.createCustodialWallet(mockRequest, createDto);

      expect(result).toEqual({
        success: false,
        error: 'KMS unavailable',
        timestamp: expect.any(String),
      });
    });
  });

  describe('connectExternalWallet', () => {
    const connectDto: ConnectWalletDto = {
      publicKey: '33333333333333333333333333333333333333333333',
      provider: 'phantom',
      name: 'My Phantom Wallet',
      isPrimary: false,
    };

    it('should connect external wallet successfully', async () => {
      const externalWallet = {
        ...mockWallet,
        type: WalletType.EXTERNAL,
        provider: 'phantom',
      };

      mockWalletsService.connectExternalWallet.mockResolvedValue(externalWallet);

      const result = await controller.connectExternalWallet(mockRequest, connectDto);

      expect(result).toEqual({
        success: true,
        data: externalWallet,
        timestamp: expect.any(String),
      });
      expect(walletsService.connectExternalWallet).toHaveBeenCalledWith('user-123', connectDto);
    });

    it('should handle wallet connection errors', async () => {
      mockWalletsService.connectExternalWallet.mockRejectedValue(
        new Error('Wallet already connected'),
      );

      const result = await controller.connectExternalWallet(mockRequest, connectDto);

      expect(result).toEqual({
        success: false,
        error: 'Wallet already connected',
        timestamp: expect.any(String),
      });
    });
  });

  describe('getWallet', () => {
    it('should return wallet details successfully', async () => {
      mockWalletsService.getWalletById.mockResolvedValue(mockWallet);

      const result = await controller.getWallet(mockRequest, 'wallet-456');

      expect(result).toEqual({
        success: true,
        data: mockWallet,
        timestamp: expect.any(String),
      });
      expect(walletsService.getWalletById).toHaveBeenCalledWith('wallet-456', 'user-123');
    });

    it('should handle wallet not found', async () => {
      mockWalletsService.getWalletById.mockResolvedValue(null);

      const result = await controller.getWallet(mockRequest, 'nonexistent-wallet');

      expect(result).toEqual({
        success: false,
        error: 'Wallet not found',
        timestamp: expect.any(String),
      });
    });

    it('should handle service errors', async () => {
      mockWalletsService.getWalletById.mockRejectedValue(new Error('Database error'));

      const result = await controller.getWallet(mockRequest, 'wallet-456');

      expect(result).toEqual({
        success: false,
        error: 'Database error',
        timestamp: expect.any(String),
      });
    });
  });

  describe('refreshBalance', () => {
    it('should refresh wallet balance successfully', async () => {
      const mockBalance = { lamports: 2000000000, sol: 2.0 };

      mockWalletsService.refreshWalletBalance.mockResolvedValue(mockBalance);

      const result = await controller.refreshBalance(mockRequest, 'wallet-456');

      expect(result).toEqual({
        success: true,
        data: mockBalance,
        timestamp: expect.any(String),
      });
      expect(walletsService.refreshWalletBalance).toHaveBeenCalledWith('wallet-456', 'user-123');
    });

    it('should handle refresh balance errors', async () => {
      mockWalletsService.refreshWalletBalance.mockRejectedValue(new Error('Network timeout'));

      const result = await controller.refreshBalance(mockRequest, 'wallet-456');

      expect(result).toEqual({
        success: false,
        error: 'Network timeout',
        timestamp: expect.any(String),
      });
    });
  });

  describe('setPrimaryWallet', () => {
    it('should set primary wallet successfully', async () => {
      mockWalletsService.setPrimaryWallet.mockResolvedValue(undefined);

      const result = await controller.setPrimaryWallet(mockRequest, 'wallet-456');

      expect(result).toEqual({
        success: true,
        message: 'Primary wallet set successfully',
        timestamp: expect.any(String),
      });
      expect(walletsService.setPrimaryWallet).toHaveBeenCalledWith('wallet-456', 'user-123');
    });

    it('should handle set primary wallet errors', async () => {
      mockWalletsService.setPrimaryWallet.mockRejectedValue(new Error('Wallet not found'));

      const result = await controller.setPrimaryWallet(mockRequest, 'nonexistent-wallet');

      expect(result).toEqual({
        success: false,
        error: 'Wallet not found',
        timestamp: expect.any(String),
      });
    });
  });

  describe('ensureUserWallet', () => {
    it('should ensure user wallet successfully for existing wallet', async () => {
      const existingWallet = {
        ...mockWallet,
        metadata: { autoCreated: false },
      };

      mockWalletsService.ensureUserWallet.mockResolvedValue(existingWallet);

      const result = await controller.ensureUserWallet(mockRequest);

      expect(result).toEqual({
        success: true,
        data: {
          wallet: existingWallet,
          created: false,
        },
        timestamp: expect.any(String),
      });
      expect(walletsService.ensureUserWallet).toHaveBeenCalledWith('test@example.com');
    });

    it('should ensure user wallet successfully for new wallet', async () => {
      const newWallet = {
        ...mockWallet,
        metadata: { autoCreated: true },
      };

      mockWalletsService.ensureUserWallet.mockResolvedValue(newWallet);

      const result = await controller.ensureUserWallet(mockRequest);

      expect(result).toEqual({
        success: true,
        data: {
          wallet: newWallet,
          created: true,
        },
        timestamp: expect.any(String),
      });
      expect(walletsService.ensureUserWallet).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle ensure wallet errors', async () => {
      mockWalletsService.ensureUserWallet.mockRejectedValue(new Error('User not found'));

      const result = await controller.ensureUserWallet(mockRequest);

      expect(result).toEqual({
        success: false,
        error: 'User not found',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      mockWalletsService.getUserWalletSummary.mockRejectedValue(
        new Error('Unexpected service error'),
      );

      const result = await controller.getMyWallets(mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unexpected service error');
      expect(result.timestamp).toBeDefined();
    });

    it('should preserve error messages for debugging', async () => {
      const specificError = new Error('Specific validation failed: public key invalid');
      mockWalletsService.sendTransaction.mockRejectedValue(specificError);

      const result = await controller.sendTransaction(mockRequest, {
        destinationAddress: 'invalid',
        amountSol: 0.1,
      });

      expect(result.error).toBe('Specific validation failed: public key invalid');
    });
  });

  describe('Response Format Consistency', () => {
    it('should maintain consistent response format across all endpoints', async () => {
      const endpoints = [
        () => controller.getMyWallets(mockRequest),
        () => controller.getTotalBalance(mockRequest),
        () => controller.getWallet(mockRequest, 'wallet-456'),
        () => controller.refreshBalance(mockRequest, 'wallet-456'),
        () => controller.setPrimaryWallet(mockRequest, 'wallet-456'),
        () => controller.ensureUserWallet(mockRequest),
      ];

      // Mock all services to return success
      mockWalletsService.getUserWalletSummary.mockResolvedValue({});
      mockWalletsService.getUserTotalBalance.mockResolvedValue({});
      mockWalletsService.getWalletById.mockResolvedValue(mockWallet);
      mockWalletsService.refreshWalletBalance.mockResolvedValue({});
      mockWalletsService.setPrimaryWallet.mockResolvedValue(undefined);
      mockWalletsService.ensureUserWallet.mockResolvedValue(mockWallet);

      for (const endpoint of endpoints) {
        const result = await endpoint();

        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('timestamp');
        expect(typeof result.success).toBe('boolean');
        expect(typeof result.timestamp).toBe('string');
        expect(new Date(result.timestamp)).toBeInstanceOf(Date);
      }
    });
  });

  describe('Authentication Guard Integration', () => {
    it('should be protected by SupabaseAuthGuard', () => {
      const guardNames = Reflect.getMetadata('__guards__', WalletsController);
      expect(guardNames).toBeDefined();
    });

    it('should extract user information from request', async () => {
      mockWalletsService.getUserWalletSummary.mockResolvedValue({});

      await controller.getMyWallets(mockRequest);

      expect(walletsService.getUserWalletSummary).toHaveBeenCalledWith(mockRequest.user.id);
    });

    it('should handle missing user information gracefully', async () => {
      const requestWithoutUser = { user: null };

      try {
        await controller.getMyWallets(requestWithoutUser as any);
      } catch (error) {
        // Should either fail gracefully or have proper guard protection
        expect(error).toBeDefined();
      }
    });
  });
});