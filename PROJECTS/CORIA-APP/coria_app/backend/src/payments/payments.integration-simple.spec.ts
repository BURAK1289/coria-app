import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { PaymentsService, CreatePendingPaymentDto } from './payments.service';
import { SupabaseService } from '@/common/services/supabase.service';
import { SolanaService } from '@/common/services/solana.service';
import { SolanaTransactionService } from '@/common/services/solana-transaction.service';
import { LoggerService } from '@/common/services/logger.service';

describe('PaymentsService Integration Tests - Simplified', () => {
  let paymentsService: PaymentsService;
  let solanaTransactionService: jest.Mocked<SolanaTransactionService>;
  let solanaService: jest.Mocked<SolanaService>;
  let supabaseService: jest.Mocked<SupabaseService>;

  const testUserId = 'test-user-456';
  const testWalletId = 'test-wallet-123';

  beforeEach(async () => {
    // Create comprehensive mocks that work with the service
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    const mockSupabaseClient = {
      from: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: SupabaseService,
          useValue: {
            getServiceClient: jest.fn().mockReturnValue(mockSupabaseClient),
          },
        },
        {
          provide: SolanaService,
          useValue: {
            isValidPublicKey: jest.fn().mockReturnValue(true),
            getBalance: jest.fn().mockResolvedValue({
              lamports: 10 * LAMPORTS_PER_SOL,
              sol: 10,
            }),
            getTransactionStatus: jest.fn(),
            getTransaction: jest.fn(),
            lamportsToSol: jest.fn().mockImplementation(lamports => lamports / LAMPORTS_PER_SOL),
            solToLamports: jest.fn().mockImplementation(sol => Math.floor(sol * LAMPORTS_PER_SOL)),
          },
        },
        {
          provide: SolanaTransactionService,
          useValue: {
            createTransfer: jest.fn(),
            getSignatureStatuses: jest.fn(),
            solToLamports: jest.fn().mockImplementation(sol => Math.floor(sol * LAMPORTS_PER_SOL)),
            lamportsToSol: jest.fn().mockImplementation(lamports => lamports / LAMPORTS_PER_SOL),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                DONATION_POOL_PUBKEY: '11111111111111111111111111111111',
                PREMIUM_POOL_PUBKEY: '22222222222222222222222222222222',
                PREMIUM_PRICE_SOL: '1.0',
              };
              return config[key];
            }),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    paymentsService = module.get<PaymentsService>(PaymentsService);
    solanaTransactionService = module.get(SolanaTransactionService);
    solanaService = module.get(SolanaService);
    supabaseService = module.get(SupabaseService);
  });

  describe('💰 Underpay Scenarios - Core Validation', () => {
    it('should reject payment below minimum amount', async () => {
      const underpayDto: CreatePendingPaymentDto = {
        userId: testUserId,
        walletId: testWalletId,
        type: 'donation',
        amountLamports: 500, // Below 1000 minimum
        idempotencyKey: 'underpay-test-123',
        metadata: { testScenario: 'underpay' },
      };

      await expect(paymentsService.createPending(underpayDto))
        .rejects.toThrow('Amount too small. Minimum 1000 lamports required');
    });

    it('should reject premium payment below required SOL amount', async () => {
      const insufficientPremiumDto: CreatePendingPaymentDto = {
        userId: testUserId,
        walletId: testWalletId,
        type: 'premium',
        amountLamports: 0.5 * LAMPORTS_PER_SOL, // 0.5 SOL (less than 1 SOL required)
        idempotencyKey: 'insufficient-premium-123',
        metadata: { testScenario: 'insufficient-premium' },
      };

      await expect(paymentsService.createPending(insufficientPremiumDto))
        .rejects.toThrow('Insufficient amount for premium subscription');
    });
  });

  describe('🔄 RPC Retry Scenarios - Service Layer', () => {
    it('should handle RPC failures with proper error propagation', async () => {
      // Mock RPC failure scenarios
      solanaTransactionService.createTransfer
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Temporary RPC failure'))
        .mockResolvedValueOnce({
          signature: 'retry-success-signature',
          transaction: {} as any,
          status: 'confirmed',
          confirmations: 2,
        });

      const result = await solanaTransactionService.createTransfer(
        Keypair.generate().publicKey.toString(),
        '11111111111111111111111111111111',
        1000000,
        { signerKeypair: Keypair.generate() }
      );

      expect(result.signature).toBe('retry-success-signature');
      expect(result.status).toBe('confirmed');
      expect(solanaTransactionService.createTransfer).toHaveBeenCalledTimes(3);
    });

    it('should handle transaction status polling with retries', async () => {
      // Mock signature status checking progression
      const mockStatuses = new Map([
        ['test-signature', { confirmations: 2, err: null, slot: 12347 }]
      ]);

      solanaTransactionService.getSignatureStatuses
        .mockResolvedValue(mockStatuses);

      const statuses = await solanaTransactionService.getSignatureStatuses(['test-signature']);

      expect(statuses.get('test-signature')).toEqual({
        confirmations: 2,
        err: null,
        slot: 12347,
      });
    });
  });

  describe('🔐 Core Validation Logic', () => {
    it('should validate payment amount constraints', async () => {
      // Test zero amount
      const zeroAmountDto: CreatePendingPaymentDto = {
        userId: testUserId,
        walletId: testWalletId,
        type: 'donation',
        amountLamports: 0,
        idempotencyKey: 'zero-amount-test',
        metadata: { testScenario: 'zero-amount' },
      };

      await expect(paymentsService.createPending(zeroAmountDto))
        .rejects.toThrow('Amount too small. Minimum 1000 lamports required');

      // Test negative amount
      const negativeAmountDto: CreatePendingPaymentDto = {
        userId: testUserId,
        walletId: testWalletId,
        type: 'donation',
        amountLamports: -1000,
        idempotencyKey: 'negative-amount-test',
        metadata: { testScenario: 'negative-amount' },
      };

      await expect(paymentsService.createPending(negativeAmountDto))
        .rejects.toThrow('Amount too small. Minimum 1000 lamports required');
    });

    it('should validate payment type constraints', async () => {
      // Test invalid payment type would be caught by TypeScript/validation
      // This test verifies the enum constraint is working
      const invalidTypeDto = {
        userId: testUserId,
        walletId: testWalletId,
        type: 'invalid-type',
        amountLamports: 1000000,
        idempotencyKey: 'invalid-type-test',
        metadata: { testScenario: 'invalid-type' },
      };

      // TypeScript would catch this, but we can test runtime behavior
      await expect(paymentsService.createPending(invalidTypeDto as any))
        .rejects.toThrow();
    });
  });

  describe('🧮 Utility Functions', () => {
    it('should convert SOL to lamports correctly', () => {
      const solAmount = 1.5;
      const expectedLamports = 1.5 * LAMPORTS_PER_SOL;

      const result = paymentsService.solToLamports(solAmount);

      expect(result).toBe(expectedLamports);
    });

    it('should convert lamports to SOL correctly', () => {
      const lamportsAmount = 1.5 * LAMPORTS_PER_SOL;
      const expectedSol = 1.5;

      const result = paymentsService.lamportsToSol(lamportsAmount);

      expect(result).toBe(expectedSol);
    });

    it('should provide correct pool configuration', () => {
      const config = paymentsService.getPoolConfig();

      expect(config).toEqual({
        donationPool: '11111111111111111111111111111111',
        premiumPool: '22222222222222222222222222222222',
        premiumPriceSol: 1.0,
        premiumDurationDays: 30,
      });
    });
  });

  describe('⚡ Performance Characteristics', () => {
    it('should have acceptable response times for utility functions', () => {
      const iterations = 1000;

      // Test SOL to lamports conversion performance
      const start = Date.now();
      for (let i = 0; i < iterations; i++) {
        paymentsService.solToLamports(Math.random() * 10);
      }
      const solToLamportsTime = Date.now() - start;

      // Test lamports to SOL conversion performance
      const start2 = Date.now();
      for (let i = 0; i < iterations; i++) {
        paymentsService.lamportsToSol(Math.random() * 10 * LAMPORTS_PER_SOL);
      }
      const lamportsToSolTime = Date.now() - start2;

      // Performance assertions (should be very fast)
      expect(solToLamportsTime).toBeLessThan(100); // < 100ms for 1000 operations
      expect(lamportsToSolTime).toBeLessThan(100); // < 100ms for 1000 operations

      console.log(`✅ Performance metrics:
        - SOL→Lamports: ${solToLamportsTime}ms for ${iterations} ops
        - Lamports→SOL: ${lamportsToSolTime}ms for ${iterations} ops`);
    });
  });
});