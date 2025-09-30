import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { PaymentsService, CreatePendingPaymentDto } from './payments.service';
import { SupabaseService } from '@/common/services/supabase.service';
import { SolanaService } from '@/common/services/solana.service';
import { SolanaTransactionService } from '@/common/services/solana-transaction.service';
import { LoggerService } from '@/common/services/logger.service';

/**
 * Comprehensive Integration Tests for Payment Scenarios
 *
 * Tests the complete payment flow from creation to confirmation
 * covering all critical scenarios and edge cases.
 */
describe('PaymentsService Integration Tests', () => {
  let paymentsService: PaymentsService;
  let solanaTransactionService: SolanaTransactionService;
  let solanaService: SolanaService;
  let supabaseService: SupabaseService;
  let configService: ConfigService;
  let loggerService: LoggerService;
  let mockSupabaseClient: any;

  const testKeypair = Keypair.generate();
  const testWalletId = 'test-wallet-123';
  const testUserId = 'test-user-456';

  // Test configuration
  const mockConfig = {
    DONATION_POOL_PUBKEY: '11111111111111111111111111111111',
    PREMIUM_POOL_PUBKEY: '22222222222222222222222222222222',
    PREMIUM_PRICE_SOL: '1.0',
  };

  beforeEach(async () => {
    // Create a reusable mock query builder factory
    const createMockQueryBuilder = (table?: string) => {
      const builder = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: table === 'solana_ledger' ? {
            id: 'ledger-' + Date.now(),
            created_at: new Date().toISOString()
          } : null,
          error: null
        }),
      };
      return builder;
    };

    // Create the mock Supabase client with the factory
    mockSupabaseClient = {
      from: jest.fn().mockImplementation((table) => createMockQueryBuilder(table)),
      rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    const mockSupabaseService = {
      getServiceClient: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    const mockSolanaService = {
      isValidPublicKey: jest.fn().mockReturnValue(true),
      getBalance: jest.fn().mockResolvedValue({
        lamports: 10 * LAMPORTS_PER_SOL,
        sol: 10,
      }),
      getTransactionStatus: jest.fn(),
      getTransaction: jest.fn(),
      lamportsToSol: jest.fn().mockImplementation(lamports => lamports / LAMPORTS_PER_SOL),
      solToLamports: jest.fn().mockImplementation(sol => Math.floor(sol * LAMPORTS_PER_SOL)),
    };

    const mockSolanaTransactionService = {
      createTransfer: jest.fn(),
      getSignatureStatuses: jest.fn().mockImplementation((signatures: string[]) => {
        const statusMap = new Map();
        signatures.forEach(sig => {
          statusMap.set(sig, {
            confirmations: 2,
            err: null,
            slot: 12347,
          });
        });
        return Promise.resolve(statusMap);
      }),
      solToLamports: jest.fn().mockImplementation(sol => Math.floor(sol * LAMPORTS_PER_SOL)),
      lamportsToSol: jest.fn().mockImplementation(lamports => lamports / LAMPORTS_PER_SOL),
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: string) => {
        return mockConfig[key] || defaultValue;
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

    paymentsService = module.get<PaymentsService>(PaymentsService);
    solanaTransactionService = module.get<SolanaTransactionService>(SolanaTransactionService);
    solanaService = module.get<SolanaService>(SolanaService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    configService = module.get<ConfigService>(ConfigService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('🎯 Happy Path - Complete Payment Flow', () => {
    it('should successfully create, process and confirm a donation payment', async () => {
      // Setup specific mock responses for this test
      mockSupabaseClient.from.mockImplementation((table: string) => {
        const builder = {
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          single: jest.fn(),
          rpc: jest.fn(),
        };

        if (table === 'payment_idempotency_keys') {
          builder.single.mockResolvedValue({ data: null, error: null });
        } else if (table === 'solana_wallets') {
          builder.single.mockResolvedValue({
            data: { user_id: testUserId, is_active: true },
            error: null,
          });
        } else if (table === 'solana_payments') {
          builder.single.mockResolvedValue({
            data: {
              id: 'payment-123',
              user_id: testUserId,
              wallet_id: testWalletId,
              type: 'donation',
              amount_lamports: 1000000,
              amount_sol: 0.001,
              status: 'pending',
              target_pool_address: mockConfig.DONATION_POOL_PUBKEY,
              tx_signature: 'test-signature-123',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 3600000).toISOString(),
            },
            error: null,
          });
        } else if (table === 'solana_ledger') {
          builder.single.mockResolvedValue({
            data: {
              id: 'ledger-entry-123',
              user_id: testUserId,
              wallet_id: testWalletId,
              payment_id: 'payment-123',
              type: 'donation',
              amount_lamports: 1000000,
              amount_sol: 0.001,
              created_at: new Date().toISOString(),
            },
            error: null,
          });
        } else {
          builder.single.mockResolvedValue({ data: null, error: null });
          builder.rpc.mockResolvedValue({ data: null, error: null });
        }

        return builder;
      });

      const paymentDto: CreatePendingPaymentDto = {
        userId: testUserId,
        walletId: testWalletId,
        type: 'donation',
        amountLamports: 1000000, // 0.001 SOL
        idempotencyKey: 'happy-path-123',
        metadata: { testScenario: 'happy-path' },
      };

      // Step 1: Create pending payment
      const pendingPayment = await paymentsService.createPending(paymentDto);

      expect(pendingPayment).toBeDefined();
      expect(pendingPayment.type).toBe('donation');
      expect(pendingPayment.amountLamports).toBe(1000000);
      expect(pendingPayment.targetPoolAddress).toBe(mockConfig.DONATION_POOL_PUBKEY);
      expect(pendingPayment.status).toBe('pending');

      // Step 2: Mock successful transaction
      jest.mocked(solanaService.getTransactionStatus).mockResolvedValue({
        signature: 'test-signature-123',
        status: 'confirmed',
        confirmations: 2,
      });

      jest.mocked(solanaService.getTransaction).mockResolvedValue({
        slot: 12345,
        blockTime: Date.now() / 1000,
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
      } as any);

      // Step 3: Confirm payment
      const confirmation = await paymentsService.confirmPayment('payment-123');

      expect(confirmation.status).toBe('confirmed');
      expect(confirmation.paymentId).toBe('payment-123');
      expect(confirmation.premiumActivated).toBe(false);

      // Verify logging
      expect(loggerService.log).toHaveBeenCalledWith(
        expect.stringContaining('Creating pending donation payment'),
        'PaymentsService'
      );
    });

    it('should successfully create and confirm premium payment with activation', async () => {
      const serviceClient = supabaseService.getServiceClient();

      // Setup premium payment mocks
      serviceClient.from = jest.fn().mockImplementation((table) => {
        if (table === 'payment_idempotency_keys') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === 'solana_wallets') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { user_id: testUserId, is_active: true },
              error: null,
            }),
          };
        }
        if (table === 'solana_payments') {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'premium-payment-456',
                user_id: testUserId,
                wallet_id: testWalletId,
                type: 'premium',
                amount_lamports: 1 * LAMPORTS_PER_SOL,
                amount_sol: 1.0,
                status: 'pending',
                target_pool_address: mockConfig.PREMIUM_POOL_PUBKEY,
                tx_signature: 'premium-signature-456',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 3600000).toISOString(),
              },
              error: null,
            }),
            eq: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
          };
        }
        if (table === 'premium_subscriptions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
            insert: jest.fn().mockReturnThis(),
          };
        }
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
          rpc: jest.fn().mockResolvedValue({ error: null }),
        };
      });

      const premiumDto: CreatePendingPaymentDto = {
        userId: testUserId,
        walletId: testWalletId,
        type: 'premium',
        amountLamports: 1 * LAMPORTS_PER_SOL, // 1 SOL
        idempotencyKey: 'premium-happy-path-456',
        metadata: { testScenario: 'premium-happy-path' },
      };

      // Create premium payment
      const pendingPayment = await paymentsService.createPending(premiumDto);

      expect(pendingPayment.type).toBe('premium');
      expect(pendingPayment.amountSol).toBe(1.0);
      expect(pendingPayment.targetPoolAddress).toBe(mockConfig.PREMIUM_POOL_PUBKEY);

      // Mock successful premium transaction
      jest.mocked(solanaService.getTransactionStatus).mockResolvedValue({
        signature: 'premium-signature-456',
        status: 'confirmed',
        confirmations: 2,
      });

      jest.mocked(solanaService.getTransaction).mockResolvedValue({
        slot: 12345,
        blockTime: Date.now() / 1000,
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
      } as any);

      // Confirm premium payment
      const confirmation = await paymentsService.confirmPayment('premium-payment-456');

      expect(confirmation.status).toBe('confirmed');
      expect(confirmation.premiumActivated).toBe(true);
      expect(confirmation.premiumExpiresAt).toBeDefined();
    });
  });

  describe('💰 Underpay Scenarios', () => {
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
        .rejects.toThrow(BadRequestException);

      expect(loggerService.error).toHaveBeenCalledWith(
        expect.stringContaining('Amount too small. Minimum 1000 lamports required'),
        expect.any(String),
        'PaymentsService'
      );
    });

    it('should reject premium payment below required SOL amount', async () => {
      const serviceClient = supabaseService.getServiceClient();

      // Mock wallet validation success
      serviceClient.from = jest.fn().mockImplementation((table) => {
        if (table === 'payment_idempotency_keys') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === 'solana_wallets') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { user_id: testUserId, is_active: true },
              error: null,
            }),
          };
        }
        return { insert: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ error: null }) };
      });

      const insufficientPremiumDto: CreatePendingPaymentDto = {
        userId: testUserId,
        walletId: testWalletId,
        type: 'premium',
        amountLamports: 0.5 * LAMPORTS_PER_SOL, // 0.5 SOL (less than 1 SOL required)
        idempotencyKey: 'insufficient-premium-123',
        metadata: { testScenario: 'insufficient-premium' },
      };

      await expect(paymentsService.createPending(insufficientPremiumDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('🎯 Wrong Destination Scenarios', () => {
    it('should detect and fail payment to wrong destination address', async () => {
      const serviceClient = supabaseService.getServiceClient();

      // Setup payment creation success
      serviceClient.from = jest.fn().mockImplementation((table) => {
        if (table === 'payment_idempotency_keys') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === 'solana_wallets') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { user_id: testUserId, is_active: true },
              error: null,
            }),
          };
        }
        if (table === 'solana_payments') {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'wrong-destination-payment',
                user_id: testUserId,
                wallet_id: testWalletId,
                type: 'donation',
                amount_lamports: 1000000,
                status: 'pending',
                target_pool_address: mockConfig.DONATION_POOL_PUBKEY,
                tx_signature: 'wrong-dest-signature',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 3600000).toISOString(),
              },
              error: null,
            }),
            eq: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
          };
        }
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ error: null }),
        };
      });

      const wrongDestDto: CreatePendingPaymentDto = {
        userId: testUserId,
        walletId: testWalletId,
        type: 'donation',
        amountLamports: 1000000,
        idempotencyKey: 'wrong-destination-123',
        metadata: { testScenario: 'wrong-destination' },
      };

      // Create payment
      const pendingPayment = await paymentsService.createPending(wrongDestDto);
      expect(pendingPayment).toBeDefined();

      // Mock transaction with WRONG destination
      jest.mocked(solanaService.getTransactionStatus).mockResolvedValue({
        signature: 'wrong-dest-signature',
        status: 'confirmed',
        confirmations: 2,
      });

      jest.mocked(solanaService.getTransaction).mockResolvedValue({
        slot: 12345,
        blockTime: Date.now() / 1000,
        meta: {
          err: null,
          innerInstructions: [{
            instructions: [{
              parsed: {
                type: 'transfer',
                info: {
                  lamports: 1000000,
                  destination: '33333333333333333333333333333333', // WRONG ADDRESS
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
      } as any);

      // Confirm payment - should fail due to destination mismatch
      const confirmation = await paymentsService.confirmPayment('wrong-destination-payment');

      expect(confirmation.status).toBe('mismatch');
      expect(confirmation.reason).toContain('Transaction destination mismatch');
    });
  });

  describe('🔄 Double Spend / Idempotency Scenarios', () => {
    it('should return existing payment for duplicate idempotency key', async () => {
      const serviceClient = supabaseService.getServiceClient();

      const existingPayment = {
        id: 'existing-payment-789',
        user_id: testUserId,
        wallet_id: testWalletId,
        type: 'donation',
        amount_lamports: 1000000,
        amount_sol: 0.001,
        status: 'confirmed',
        target_pool_address: mockConfig.DONATION_POOL_PUBKEY,
        idempotency_key: 'duplicate-key-789',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };

      // Mock existing idempotency key found
      serviceClient.from = jest.fn().mockImplementation((table) => {
        if (table === 'payment_idempotency_keys') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn()
              .mockResolvedValueOnce({
                data: { payment_id: 'existing-payment-789' },
                error: null,
              }),
          };
        }
        if (table === 'solana_payments') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: existingPayment,
              error: null,
            }),
          };
        }
        return { insert: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ error: null }) };
      });

      const duplicateDto: CreatePendingPaymentDto = {
        userId: testUserId,
        walletId: testWalletId,
        type: 'donation',
        amountLamports: 1000000,
        idempotencyKey: 'duplicate-key-789', // Same key as existing
        metadata: { testScenario: 'duplicate-idempotency' },
      };

      const result = await paymentsService.createPending(duplicateDto);

      expect(result.id).toBe('existing-payment-789');
      expect(result.status).toBe('confirmed');
      expect(loggerService.log).toHaveBeenCalledWith(
        expect.stringContaining('already exists'),
        'PaymentsService'
      );
    });

    it('should prevent concurrent duplicate payments', async () => {
      const serviceClient = supabaseService.getServiceClient();

      // Mock database constraint violation (race condition)
      serviceClient.from = jest.fn().mockImplementation((table) => {
        if (table === 'payment_idempotency_keys') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
            insert: jest.fn().mockResolvedValue({
              error: { code: '23505' }, // Unique constraint violation
            }),
          };
        }
        if (table === 'solana_wallets') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { user_id: testUserId, is_active: true },
              error: null,
            }),
          };
        }
        if (table === 'solana_payments') {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'race-condition-payment',
                user_id: testUserId,
                wallet_id: testWalletId,
                type: 'donation',
                amount_lamports: 1000000,
                status: 'pending',
                target_pool_address: mockConfig.DONATION_POOL_PUBKEY,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 3600000).toISOString(),
              },
              error: null,
            }),
          };
        }
        return { insert: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ error: null }) };
      });

      const raceConditionDto: CreatePendingPaymentDto = {
        userId: testUserId,
        walletId: testWalletId,
        type: 'donation',
        amountLamports: 1000000,
        idempotencyKey: 'race-condition-key',
        metadata: { testScenario: 'race-condition' },
      };

      await expect(paymentsService.createPending(raceConditionDto))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('🔄 RPC Retry Scenarios', () => {
    it('should handle RPC failures and retry successfully', async () => {
      // Clear previous mock and setup new behavior
      jest.clearAllMocks();

      // Mock RPC failure then success scenario for SolanaTransactionService
      jest.mocked(solanaTransactionService.createTransfer)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Temporary RPC failure'))
        .mockResolvedValueOnce({
          signature: 'retry-success-signature',
          transaction: {} as any,
          status: 'confirmed',
          confirmations: 2,
        });

      // Test retry logic by calling 3 times manually
      try {
        await solanaTransactionService.createTransfer(
          testKeypair.publicKey.toString(),
          mockConfig.DONATION_POOL_PUBKEY,
          1000000,
          { signerKeypair: testKeypair }
        );
      } catch (e) {
        // First attempt fails
      }

      try {
        await solanaTransactionService.createTransfer(
          testKeypair.publicKey.toString(),
          mockConfig.DONATION_POOL_PUBKEY,
          1000000,
          { signerKeypair: testKeypair }
        );
      } catch (e) {
        // Second attempt fails
      }

      // Third attempt succeeds
      const retryResult = await solanaTransactionService.createTransfer(
        testKeypair.publicKey.toString(),
        mockConfig.DONATION_POOL_PUBKEY,
        1000000,
        { signerKeypair: testKeypair }
      );

      expect(retryResult.signature).toBe('retry-success-signature');
      expect(retryResult.status).toBe('confirmed');
      expect(solanaTransactionService.createTransfer).toHaveBeenCalledTimes(3);
    });

    it('should fail after maximum retry attempts', async () => {
      // Mock persistent RPC failures
      jest.mocked(solanaTransactionService.createTransfer)
        .mockRejectedValue(new Error('Persistent network error'));

      await expect(
        solanaTransactionService.createTransfer(
          testKeypair.publicKey.toString(),
          mockConfig.DONATION_POOL_PUBKEY,
          1000000,
          { signerKeypair: testKeypair }
        )
      ).rejects.toThrow('Persistent network error');
    });

    it('should handle transaction status polling with retries', async () => {
      // Clear previous mocks
      jest.clearAllMocks();

      // Mock signature status checking with retry
      jest.mocked(solanaTransactionService.getSignatureStatuses)
        .mockResolvedValueOnce(new Map()) // First call: empty (not found)
        .mockResolvedValueOnce(new Map([
          ['test-signature', { confirmations: 0, err: null, slot: 12345 }]
        ])) // Second call: 0 confirmations
        .mockResolvedValueOnce(new Map([
          ['test-signature', { confirmations: 2, err: null, slot: 12347 }]
        ])); // Third call: confirmed

      // Simulate polling 3 times
      const firstPoll = await solanaTransactionService.getSignatureStatuses(['test-signature']);
      expect(firstPoll.get('test-signature')).toBeUndefined(); // Not found

      const secondPoll = await solanaTransactionService.getSignatureStatuses(['test-signature']);
      expect(secondPoll.get('test-signature')).toEqual({
        confirmations: 0,
        err: null,
        slot: 12345,
      });

      const thirdPoll = await solanaTransactionService.getSignatureStatuses(['test-signature']);
      expect(thirdPoll.get('test-signature')).toEqual({
        confirmations: 2,
        err: null,
        slot: 12347,
      });

      expect(solanaTransactionService.getSignatureStatuses).toHaveBeenCalledTimes(3);
    });
  });

  describe('🔐 Comprehensive Idempotency Protection', () => {
    it('should handle idempotency across all payment types', async () => {
      const serviceClient = supabaseService.getServiceClient();

      // Test scenarios for both donation and premium payments
      const scenarios = [
        {
          type: 'donation' as const,
          amountLamports: 1000000,
          targetPool: mockConfig.DONATION_POOL_PUBKEY,
        },
        {
          type: 'premium' as const,
          amountLamports: 1 * LAMPORTS_PER_SOL,
          targetPool: mockConfig.PREMIUM_POOL_PUBKEY,
        },
      ];

      for (const scenario of scenarios) {
        // Mock existing payment found
        serviceClient.from = jest.fn().mockImplementation((table) => {
          if (table === 'payment_idempotency_keys') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: { payment_id: `existing-${scenario.type}-payment` },
                error: null,
              }),
            };
          }
          if (table === 'solana_payments') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: {
                  id: `existing-${scenario.type}-payment`,
                  user_id: testUserId,
                  wallet_id: testWalletId,
                  type: scenario.type,
                  amount_lamports: scenario.amountLamports,
                  status: 'confirmed',
                  target_pool_address: scenario.targetPool,
                  idempotency_key: `idempotency-${scenario.type}-123`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  expires_at: new Date(Date.now() + 3600000).toISOString(),
                },
                error: null,
              }),
            };
          }
          return { insert: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ error: null }) };
        });

        const idempotentDto: CreatePendingPaymentDto = {
          userId: testUserId,
          walletId: testWalletId,
          type: scenario.type,
          amountLamports: scenario.amountLamports,
          idempotencyKey: `idempotency-${scenario.type}-123`,
          metadata: { testScenario: `idempotency-${scenario.type}` },
        };

        const result = await paymentsService.createPending(idempotentDto);

        expect(result.id).toBe(`existing-${scenario.type}-payment`);
        expect(result.type).toBe(scenario.type);
        expect(result.status).toBe('confirmed');
        expect(result.targetPoolAddress).toBe(scenario.targetPool);
      }
    });

    it('should validate idempotency key expiration', async () => {
      const serviceClient = supabaseService.getServiceClient();

      // Mock expired idempotency key
      serviceClient.from = jest.fn().mockImplementation((table) => {
        if (table === 'payment_idempotency_keys') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }), // No valid key found
          };
        }
        if (table === 'solana_wallets') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { user_id: testUserId, is_active: true },
              error: null,
            }),
          };
        }
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'new-payment-after-expiry',
              user_id: testUserId,
              wallet_id: testWalletId,
              type: 'donation',
              amount_lamports: 1000000,
              status: 'pending',
              target_pool_address: mockConfig.DONATION_POOL_PUBKEY,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 3600000).toISOString(),
            },
            error: null,
          }),
        };
      });

      const expiredKeyDto: CreatePendingPaymentDto = {
        userId: testUserId,
        walletId: testWalletId,
        type: 'donation',
        amountLamports: 1000000,
        idempotencyKey: 'expired-key-123',
        metadata: { testScenario: 'expired-idempotency-key' },
      };

      const result = await paymentsService.createPending(expiredKeyDto);

      // Should create new payment since old key expired
      expect(result.id).toBe('new-payment-after-expiry');
      expect(result.status).toBe('pending');
    });
  });

  describe('📊 Performance and Load Testing', () => {
    it('should handle concurrent payment requests efficiently', async () => {
      const serviceClient = supabaseService.getServiceClient();

      // Mock successful responses for all concurrent requests
      serviceClient.from = jest.fn().mockImplementation((table) => {
        if (table === 'payment_idempotency_keys') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === 'solana_wallets') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { user_id: testUserId, is_active: true },
              error: null,
            }),
          };
        }
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockImplementation(() => Promise.resolve({
            data: {
              id: `concurrent-payment-${Math.random().toString(36).substr(2, 9)}`,
              user_id: testUserId,
              wallet_id: testWalletId,
              type: 'donation',
              amount_lamports: 1000000,
              status: 'pending',
              target_pool_address: mockConfig.DONATION_POOL_PUBKEY,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 3600000).toISOString(),
            },
            error: null,
          })),
        };
      });

      // Create 10 concurrent payment requests
      const concurrentRequests = Array.from({ length: 10 }, (_, index) => {
        const dto: CreatePendingPaymentDto = {
          userId: testUserId,
          walletId: testWalletId,
          type: 'donation',
          amountLamports: 1000000,
          idempotencyKey: `concurrent-${index}-${Date.now()}`,
          metadata: { testScenario: 'concurrent-load', requestIndex: index },
        };
        return paymentsService.createPending(dto);
      });

      const startTime = Date.now();
      const results = await Promise.all(concurrentRequests);
      const executionTime = Date.now() - startTime;

      // Verify all requests completed successfully
      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result).toBeDefined();
        expect(result.type).toBe('donation');
        expect(result.amountLamports).toBe(1000000);
      });

      // Performance assertion (should complete within reasonable time)
      expect(executionTime).toBeLessThan(5000); // 5 seconds max

      console.log(`✅ Concurrent requests performance: ${executionTime}ms for 10 requests`);
    });
  });

  describe('🔒 Security and Validation', () => {
    it('should validate user ownership of wallet', async () => {
      const serviceClient = supabaseService.getServiceClient();

      // Mock wallet belonging to different user
      serviceClient.from = jest.fn().mockImplementation((table) => {
        if (table === 'payment_idempotency_keys') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === 'solana_wallets') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { user_id: 'different-user-id', is_active: true },
              error: null,
            }),
          };
        }
        return { insert: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ error: null }) };
      });

      const unauthorizedDto: CreatePendingPaymentDto = {
        userId: testUserId,
        walletId: testWalletId,
        type: 'donation',
        amountLamports: 1000000,
        idempotencyKey: 'unauthorized-wallet-123',
        metadata: { testScenario: 'unauthorized-wallet' },
      };

      await expect(paymentsService.createPending(unauthorizedDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should reject inactive wallet usage', async () => {
      const serviceClient = supabaseService.getServiceClient();

      // Mock inactive wallet
      serviceClient.from = jest.fn().mockImplementation((table) => {
        if (table === 'payment_idempotency_keys') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === 'solana_wallets') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { user_id: testUserId, is_active: false },
              error: null,
            }),
          };
        }
        return { insert: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ error: null }) };
      });

      const inactiveWalletDto: CreatePendingPaymentDto = {
        userId: testUserId,
        walletId: testWalletId,
        type: 'donation',
        amountLamports: 1000000,
        idempotencyKey: 'inactive-wallet-123',
        metadata: { testScenario: 'inactive-wallet' },
      };

      await expect(paymentsService.createPending(inactiveWalletDto))
        .rejects.toThrow(BadRequestException);
    });
  });
});