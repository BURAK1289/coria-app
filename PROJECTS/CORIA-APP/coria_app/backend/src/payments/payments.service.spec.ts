import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PaymentsService, CreatePendingPaymentDto } from './payments.service';
import { SupabaseService } from '@/common/services/supabase.service';
import { SolanaService } from '@/common/services/solana.service';
import { SolanaTransactionService } from '@/common/services/solana-transaction.service';
import { LoggerService } from '@/common/services/logger.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let supabaseService: jest.Mocked<SupabaseService>;
  let solanaService: jest.Mocked<SolanaService>;
  let solanaTransactionService: jest.Mocked<SolanaTransactionService>;
  let configService: jest.Mocked<ConfigService>;
  let loggerService: jest.Mocked<LoggerService>;

  const mockConfig = {
    DONATION_POOL_PUBKEY: '11111111111111111111111111111111',
    PREMIUM_POOL_PUBKEY: '22222222222222222222222222222222',
    PREMIUM_PRICE_SOL: '1.0',
  };

  const mockUser = {
    id: 'user-123',
    walletId: 'wallet-456',
  };

  const mockPaymentDto: CreatePendingPaymentDto = {
    userId: mockUser.id,
    walletId: mockUser.walletId,
    type: 'donation',
    amountLamports: 1000000, // 0.001 SOL
    idempotencyKey: 'test-key-123',
    metadata: { test: 'data' },
  };

  beforeEach(async () => {
    // Simplify by using jest.spyOn to mock the entire Supabase client
    const mockQueryChain = {
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
    };

    const mockServiceClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue(mockQueryChain),
        eq: jest.fn().mockReturnValue(mockQueryChain),
        gte: jest.fn().mockReturnValue(mockQueryChain),
        single: jest.fn(),
        insert: jest.fn().mockReturnValue(mockQueryChain),
        update: jest.fn().mockReturnValue(mockQueryChain),
      }),
      rpc: jest.fn(),
    };

    const mockSupabaseService = {
      getServiceClient: jest.fn().mockReturnValue(mockServiceClient),
    };

    const mockSolanaService = {
      lamportsToSol: jest.fn().mockImplementation(lamports => lamports / LAMPORTS_PER_SOL),
      solToLamports: jest.fn().mockImplementation(sol => Math.floor(sol * LAMPORTS_PER_SOL)),
      getTransactionStatus: jest.fn(),
      getTransaction: jest.fn(),
    };

    const mockSolanaTransactionService = {
      // Mock methods if needed
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: string) => {
        const value = mockConfig[key] || defaultValue;
        return value;
      }),
    };

    const mockLoggerService = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: SolanaService, useValue: mockSolanaService },
        { provide: SolanaTransactionService, useValue: mockSolanaTransactionService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    supabaseService = module.get(SupabaseService);
    solanaService = module.get(SolanaService);
    solanaTransactionService = module.get(SolanaTransactionService);
    configService = module.get(ConfigService);
    loggerService = module.get(LoggerService);

    // Store references to mock service client for each test
    global.mockServiceClient = mockServiceClient;
    global.mockQueryChain = mockQueryChain;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with pool configuration', () => {
      const config = service.getPoolConfig();
      expect(config.donationPool).toBe(mockConfig.DONATION_POOL_PUBKEY);
      expect(config.premiumPool).toBe(mockConfig.PREMIUM_POOL_PUBKEY);
      expect(config.premiumPriceSol).toBe(1.0);
      expect(config.premiumDurationDays).toBe(30);
    });

    it('should throw error if pool configuration is missing', () => {
      configService.get.mockReturnValue(undefined);

      expect(() => {
        // Create new service instance with missing config
        new PaymentsService(
          configService,
          supabaseService,
          solanaService,
          solanaTransactionService,
          loggerService,
        );
      }).toThrow('Missing pool configuration');
    });
  });

  describe('createPending', () => {
    let mockServiceClient: any;
    let mockQueryChain: any;

    beforeEach(() => {
      // Use the global mock service client
      mockServiceClient = global.mockServiceClient;
      mockQueryChain = global.mockQueryChain;
    });

    it('should create a pending donation payment successfully', async () => {
      // Mock existing payment check (not found)
      mockQueryChain.single.mockResolvedValueOnce({ data: null });

      // Mock wallet validation
      mockQueryChain.single.mockResolvedValueOnce({
        data: { user_id: mockUser.id, is_active: true },
        error: null,
      });

      // Mock payment creation
      const mockPayment = {
        id: 'payment-123',
        user_id: mockUser.id,
        wallet_id: mockUser.walletId,
        type: 'donation',
        amount_lamports: 1000000,
        amount_sol: 0.001,
        status: 'pending',
        target_pool_address: mockConfig.DONATION_POOL_PUBKEY,
        idempotency_key: 'test-key-123',
        metadata: { test: 'data' },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        expires_at: '2023-01-02T00:00:00Z',
      };

      mockQueryChain.single.mockResolvedValueOnce({
        data: mockPayment,
        error: null,
      });

      // Mock idempotency key storage
      mockQueryChain.single.mockResolvedValueOnce({ error: null });

      const result = await service.createPending(mockPaymentDto);

      expect(result).toEqual({
        id: 'payment-123',
        userId: mockUser.id,
        walletId: mockUser.walletId,
        type: 'donation',
        amountLamports: 1000000,
        amountSol: 0.001,
        status: 'pending',
        targetPoolAddress: mockConfig.DONATION_POOL_PUBKEY,
        idempotencyKey: 'test-key-123',
        metadata: { test: 'data' },
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        expiresAt: '2023-01-02T00:00:00Z',
        txSignature: undefined,
      });

      expect(loggerService.log).toHaveBeenCalledWith(
        expect.stringContaining('Creating pending donation payment'),
        'PaymentsService',
      );
    });

    it('should create a pending premium payment successfully', async () => {
      const premiumDto = {
        ...mockPaymentDto,
        type: 'premium' as const,
        amountLamports: 1 * LAMPORTS_PER_SOL, // 1 SOL
      };

      // Mock existing payment check (not found)
      mockQueryChain.single.mockResolvedValueOnce({ data: null });

      // Mock wallet validation
      mockQueryChain.single.mockResolvedValueOnce({
        data: { user_id: mockUser.id, is_active: true },
        error: null,
      });

      // Mock payment creation
      const mockPayment = {
        id: 'payment-123',
        user_id: mockUser.id,
        wallet_id: mockUser.walletId,
        type: 'premium',
        amount_lamports: 1 * LAMPORTS_PER_SOL,
        amount_sol: 1.0,
        status: 'pending',
        target_pool_address: mockConfig.PREMIUM_POOL_PUBKEY,
        idempotency_key: 'test-key-123',
        metadata: { test: 'data' },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        expires_at: '2023-01-02T00:00:00Z',
      };

      mockQueryChain.single.mockResolvedValueOnce({
        data: mockPayment,
        error: null,
      });

      // Mock idempotency key storage
      mockQueryChain.single.mockResolvedValueOnce({ error: null });

      const result = await service.createPending(premiumDto);

      expect(result.type).toBe('premium');
      expect(result.targetPoolAddress).toBe(mockConfig.PREMIUM_POOL_PUBKEY);
      expect(result.amountSol).toBe(1.0);
    });

    it('should return existing payment for duplicate idempotency key', async () => {
      const existingPayment = {
        id: 'existing-payment-123',
        user_id: mockUser.id,
        wallet_id: mockUser.walletId,
        type: 'donation',
        amount_lamports: 1000000,
        amount_sol: 0.001,
        status: 'pending',
        target_pool_address: mockConfig.DONATION_POOL_PUBKEY,
        idempotency_key: 'test-key-123',
        metadata: { test: 'data' },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        expires_at: '2023-01-02T00:00:00Z',
      };

      // Mock existing idempotency key found
      mockQueryChain.single
        .mockResolvedValueOnce({
          data: { payment_id: 'existing-payment-123' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: existingPayment,
          error: null,
        });

      const result = await service.createPending(mockPaymentDto);

      expect(result.id).toBe('existing-payment-123');
      expect(loggerService.log).toHaveBeenCalledWith(
        expect.stringContaining('already exists'),
        'PaymentsService',
      );
    });

    it('should throw BadRequestException for invalid payment type', async () => {
      const invalidDto = {
        ...mockPaymentDto,
        type: 'invalid' as any,
      };

      await expect(service.createPending(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for insufficient premium amount', async () => {
      const insufficientDto = {
        ...mockPaymentDto,
        type: 'premium' as const,
        amountLamports: 0.5 * LAMPORTS_PER_SOL, // 0.5 SOL (less than 1 SOL required)
      };

      // Mock existing payment check (not found)
      mockQueryChain.single.mockResolvedValueOnce({ data: null });

      // Mock wallet validation
      mockQueryChain.single.mockResolvedValueOnce({
        data: { user_id: mockUser.id, is_active: true },
        error: null,
      });

      await expect(service.createPending(insufficientDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for wallet not belonging to user', async () => {
      // Mock existing payment check (not found)
      mockQueryChain.single.mockResolvedValueOnce({ data: null });

      // Mock wallet validation (belongs to different user)
      mockQueryChain.single.mockResolvedValueOnce({
        data: { user_id: 'different-user', is_active: true },
        error: null,
      });

      await expect(service.createPending(mockPaymentDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for inactive wallet', async () => {
      // Mock existing payment check (not found)
      mockQueryChain.single.mockResolvedValueOnce({ data: null });

      // Mock wallet validation (inactive)
      mockQueryChain.single.mockResolvedValueOnce({
        data: { user_id: mockUser.id, is_active: false },
        error: null,
      });

      await expect(service.createPending(mockPaymentDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException for duplicate idempotency key conflict', async () => {
      // Mock existing payment check (not found)
      mockQueryChain.single.mockResolvedValueOnce({ data: null });

      // Mock wallet validation
      mockQueryChain.single.mockResolvedValueOnce({
        data: { user_id: mockUser.id, is_active: true },
        error: null,
      });

      // Mock payment creation success
      mockQueryChain.single.mockResolvedValueOnce({
        data: {
          id: 'payment-123',
          user_id: mockUser.id,
          wallet_id: mockUser.walletId,
          type: 'donation',
          amount_lamports: 1000000,
          amount_sol: 0.001,
          status: 'pending',
          target_pool_address: mockConfig.DONATION_POOL_PUBKEY,
          idempotency_key: 'test-key-123',
          metadata: { test: 'data' },
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          expires_at: '2023-01-02T00:00:00Z',
        },
        error: null,
      });

      // Mock idempotency key storage conflict - this is a direct insert call
      const mockInsertChain = {
        insert: jest.fn().mockResolvedValue({
          error: { code: '23505' }, // Unique constraint violation
        }),
      };
      mockServiceClient.from.mockReturnValueOnce(mockInsertChain);

      await expect(service.createPending(mockPaymentDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('confirmPayment', () => {
    let mockServiceClient: any;
    let mockQueryChain: any;

    beforeEach(() => {
      // Use the global mock service client
      mockServiceClient = global.mockServiceClient;
      mockQueryChain = global.mockQueryChain;
    });

    it('should confirm a valid donation payment', async () => {
      const mockPayment = {
        id: 'payment-123',
        user_id: mockUser.id,
        wallet_id: mockUser.walletId,
        type: 'donation',
        amount_lamports: 1000000,
        amount_sol: 0.001,
        status: 'pending',
        tx_signature: 'test-signature-123',
        target_pool_address: mockConfig.DONATION_POOL_PUBKEY,
        idempotency_key: 'test-key-123',
        metadata: {},
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        expires_at: '2023-01-02T00:00:00Z',
      };

      // Mock payment retrieval
      mockQueryChain.single.mockResolvedValueOnce({
        data: mockPayment,
        error: null,
      });

      // Mock transaction status check
      solanaService.getTransactionStatus.mockResolvedValue({
        signature: 'test-signature-123',
        status: 'confirmed',
        confirmations: 2,
      });

      // Mock transaction details for verification
      const mockTransaction = {
        slot: 12345,
        blockTime: 1640995200,
        meta: {
          err: null,
          innerInstructions: [{
            instructions: [{
              parsed: {
                type: 'transfer',
                info: {
                  lamports: 1000000,
                  destination: mockConfig.DONATION_POOL_PUBKEY,
                }
              }
            }]
          }]
        },
        transaction: {
          message: {
            instructions: [{
              programId: { toString: () => '11111111111111111111111111111111' }
            }]
          }
        },
      };

      solanaService.getTransaction.mockResolvedValue(mockTransaction as any);

      // Mock database operations
      mockServiceClient.rpc.mockResolvedValue({ error: null });
      mockQueryChain.single.mockResolvedValue({ error: null });
      mockQueryChain.single.mockResolvedValue({
        data: { id: 'ledger-123' },
        error: null,
      });

      const result = await service.confirmPayment('payment-123');

      expect(result.paymentId).toBe('payment-123');
      expect(result.status).toBe('confirmed');
      expect(result.ledgerEntryId).toBe('ledger-123');
      expect(result.premiumActivated).toBe(false);
    });

    it('should confirm a premium payment and activate premium', async () => {
      const mockPayment = {
        id: 'payment-123',
        user_id: mockUser.id,
        wallet_id: mockUser.walletId,
        type: 'premium',
        amount_lamports: 1 * LAMPORTS_PER_SOL,
        amount_sol: 1.0,
        status: 'pending',
        tx_signature: 'test-signature-123',
        target_pool_address: mockConfig.PREMIUM_POOL_PUBKEY,
        idempotency_key: 'test-key-123',
        metadata: {},
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        expires_at: '2023-01-02T00:00:00Z',
      };

      // Mock payment retrieval
      mockQueryChain.single.mockResolvedValueOnce({
        data: mockPayment,
        error: null,
      });

      // Mock transaction status check
      solanaService.getTransactionStatus.mockResolvedValue({
        signature: 'test-signature-123',
        status: 'confirmed',
        confirmations: 2,
      });

      // Mock transaction details for verification
      const mockTransaction = {
        slot: 12345,
        blockTime: 1640995200,
        meta: {
          err: null,
          innerInstructions: [{
            instructions: [{
              parsed: {
                type: 'transfer',
                info: {
                  lamports: 1 * LAMPORTS_PER_SOL,
                  destination: mockConfig.PREMIUM_POOL_PUBKEY,
                }
              }
            }]
          }]
        },
        transaction: {
          message: {
            instructions: [{
              programId: { toString: () => '11111111111111111111111111111111' }
            }]
          }
        },
      };

      solanaService.getTransaction.mockResolvedValue(mockTransaction as any);

      // Mock database operations
      mockServiceClient.rpc.mockResolvedValue({ error: null });
      mockQueryChain.single.mockResolvedValue({ error: null });

      // Mock ledger entry creation
      mockQueryChain.single.mockResolvedValueOnce({
        data: { id: 'ledger-123' },
        error: null,
      });

      // Mock premium subscription check (no existing)
      mockQueryChain.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock premium subscription creation
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      mockQueryChain.single.mockResolvedValueOnce({
        data: { id: 'premium-123', expires_at: expiresAt },
        error: null,
      });

      const result = await service.confirmPayment('payment-123');

      expect(result.paymentId).toBe('payment-123');
      expect(result.status).toBe('confirmed');
      expect(result.premiumActivated).toBe(true);
      expect(result.premiumExpiresAt).toBeDefined();
    });

    it('should fail payment if transaction failed', async () => {
      const mockPayment = {
        id: 'payment-123',
        user_id: mockUser.id,
        wallet_id: mockUser.walletId,
        type: 'donation',
        amount_lamports: 1000000,
        amount_sol: 0.001,
        status: 'pending',
        tx_signature: 'test-signature-123',
        target_pool_address: mockConfig.DONATION_POOL_PUBKEY,
        idempotency_key: 'test-key-123',
        metadata: {},
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        expires_at: '2023-01-02T00:00:00Z',
      };

      // Mock payment retrieval
      mockQueryChain.single.mockResolvedValueOnce({
        data: mockPayment,
        error: null,
      });

      // Mock transaction status check (failed)
      solanaService.getTransactionStatus.mockResolvedValue({
        signature: 'test-signature-123',
        status: 'failed',
        confirmations: 0,
        error: 'Insufficient funds',
      });

      // Mock payment failure update
      mockQueryChain.single.mockResolvedValue({ error: null });

      const result = await service.confirmPayment('payment-123');

      expect(result.paymentId).toBe('payment-123');
      expect(result.status).toBe('failed');
      expect(result.reason).toContain('Transaction failed');
    });

    it('should return already processed for non-pending payment', async () => {
      const mockPayment = {
        id: 'payment-123',
        user_id: mockUser.id,
        wallet_id: mockUser.walletId,
        type: 'donation',
        amount_lamports: 1000000,
        amount_sol: 0.001,
        status: 'confirmed',
        tx_signature: 'test-signature-123',
        target_pool_address: mockConfig.DONATION_POOL_PUBKEY,
        idempotency_key: 'test-key-123',
        metadata: {},
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        expires_at: '2023-01-02T00:00:00Z',
      };

      // Mock payment retrieval
      mockQueryChain.single.mockResolvedValueOnce({
        data: mockPayment,
        error: null,
      });

      const result = await service.confirmPayment('payment-123');

      expect(result.paymentId).toBe('payment-123');
      expect(result.status).toBe('confirmed');
      expect(result.reason).toBe('Already processed');
    });

    it('should throw BadRequestException for non-existent payment', async () => {
      // Mock payment not found
      mockQueryChain.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await expect(service.confirmPayment('non-existent')).rejects.toThrow(BadRequestException);
    });
  });

  describe('utility methods', () => {
    it('should convert SOL to lamports correctly', () => {
      solanaService.solToLamports.mockReturnValue(1000000000);
      const result = service.solToLamports(1);
      expect(result).toBe(1000000000);
      expect(solanaService.solToLamports).toHaveBeenCalledWith(1);
    });

    it('should convert lamports to SOL correctly', () => {
      solanaService.lamportsToSol.mockReturnValue(1);
      const result = service.lamportsToSol(1000000000);
      expect(result).toBe(1);
      expect(solanaService.lamportsToSol).toHaveBeenCalledWith(1000000000);
    });

    it('should return pool configuration', () => {
      const config = service.getPoolConfig();
      expect(config).toEqual({
        donationPool: mockConfig.DONATION_POOL_PUBKEY,
        premiumPool: mockConfig.PREMIUM_POOL_PUBKEY,
        premiumPriceSol: 1.0,
        premiumDurationDays: 30,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle missing required fields', async () => {
      const invalidDto = {
        userId: '',
        walletId: mockUser.walletId,
        type: 'donation' as const,
        amountLamports: 1000000,
        idempotencyKey: 'test-key-123',
      };

      await expect(service.createPending(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should handle invalid amount', async () => {
      const invalidDto = {
        ...mockPaymentDto,
        amountLamports: -1000,
      };

      await expect(service.createPending(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should handle amount too small', async () => {
      const invalidDto = {
        ...mockPaymentDto,
        amountLamports: 100, // Less than 1000 minimum
      };

      await expect(service.createPending(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });
});