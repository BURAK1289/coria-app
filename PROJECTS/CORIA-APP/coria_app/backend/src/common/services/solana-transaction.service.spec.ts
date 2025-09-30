import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import { SolanaTransactionService, TransferResult } from './solana-transaction.service';
import { LoggerService } from './logger.service';
import { SolanaService } from './solana.service';

describe('SolanaTransactionService', () => {
  let service: SolanaTransactionService;
  let solanaService: jest.Mocked<SolanaService>;
  let loggerService: jest.Mocked<LoggerService>;
  let configService: jest.Mocked<ConfigService>;
  let schedulerRegistry: jest.Mocked<SchedulerRegistry>;

  // Test keypairs and addresses
  const testKeypair = Keypair.generate();
  const testFromAddress = testKeypair.publicKey.toString();
  const testToAddress = Keypair.generate().publicKey.toString();

  beforeEach(async () => {
    const mockConnection = {
      getLatestBlockhash: jest.fn(),
      sendRawTransaction: jest.fn(),
      getSignatureStatuses: jest.fn(),
    };

    const mockSolanaService = {
      isValidPublicKey: jest.fn(),
      getBalance: jest.fn(),
      getConnection: jest.fn().mockReturnValue(mockConnection),
      lamportsToSol: jest.fn(),
      solToLamports: jest.fn(),
    };

    const mockLoggerService = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockSchedulerRegistry = {
      addInterval: jest.fn(),
      deleteInterval: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolanaTransactionService,
        { provide: SolanaService, useValue: mockSolanaService },
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SchedulerRegistry, useValue: mockSchedulerRegistry },
      ],
    }).compile();

    service = module.get<SolanaTransactionService>(SolanaTransactionService);
    solanaService = module.get(SolanaService);
    loggerService = module.get(LoggerService);
    configService = module.get(ConfigService);
    schedulerRegistry = module.get(SchedulerRegistry);
  });

  afterEach(() => {
    jest.clearAllMocks();
    service.clearPendingTransactions();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize polling on module init', async () => {
      await service.onModuleInit();

      expect(schedulerRegistry.addInterval).toHaveBeenCalledWith(
        'transaction-confirmation-polling',
        expect.any(Object),
      );
      expect(loggerService.log).toHaveBeenCalledWith(
        'SolanaTransactionService initialized with confirmation polling',
        'SolanaTransactionService',
      );
    });
  });

  describe('createTransfer', () => {
    beforeEach(() => {
      // Setup default mocks
      solanaService.isValidPublicKey.mockReturnValue(true);
      solanaService.getBalance.mockResolvedValue({
        lamports: 10 * LAMPORTS_PER_SOL,
        sol: 10,
      });
      solanaService.lamportsToSol.mockImplementation(lamports => lamports / LAMPORTS_PER_SOL);

      const mockConnection = solanaService.getConnection() as any;
      mockConnection.getLatestBlockhash.mockResolvedValue({
        blockhash: 'test-blockhash',
        lastValidBlockHeight: 12345,
      });
      mockConnection.sendRawTransaction.mockResolvedValue('test-signature');
      mockConnection.getSignatureStatuses.mockResolvedValue({
        value: [{ confirmations: 2, err: null }],
      });
    });

    it('should create and send transfer successfully', async () => {
      const lamports = 1 * LAMPORTS_PER_SOL;

      const result = await service.createTransfer(
        testFromAddress,
        testToAddress,
        lamports,
        { signerKeypair: testKeypair },
      );

      expect(result).toEqual({
        signature: 'test-signature',
        transaction: expect.any(Transaction),
        status: 'confirmed',
        confirmations: 2,
      });

      expect(solanaService.isValidPublicKey).toHaveBeenCalledWith(testFromAddress);
      expect(solanaService.isValidPublicKey).toHaveBeenCalledWith(testToAddress);
      expect(solanaService.getBalance).toHaveBeenCalledWith(testFromAddress);
    });

    it('should throw error for invalid from address', async () => {
      solanaService.isValidPublicKey.mockReturnValueOnce(false);

      await expect(
        service.createTransfer('invalid-address', testToAddress, 1000),
      ).rejects.toThrow('Invalid from public key format');
    });

    it('should throw error for invalid to address', async () => {
      solanaService.isValidPublicKey
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      await expect(
        service.createTransfer(testFromAddress, 'invalid-address', 1000),
      ).rejects.toThrow('Invalid to public key format');
    });

    it('should throw error for same from and to addresses', async () => {
      await expect(
        service.createTransfer(testFromAddress, testFromAddress, 1000),
      ).rejects.toThrow('Cannot transfer to the same address');
    });

    it('should throw error for zero lamports', async () => {
      await expect(
        service.createTransfer(testFromAddress, testToAddress, 0),
      ).rejects.toThrow('Lamports must be a positive integer');
    });

    it('should throw error for negative lamports', async () => {
      await expect(
        service.createTransfer(testFromAddress, testToAddress, -1000),
      ).rejects.toThrow('Lamports must be a positive integer');
    });

    it('should throw error for insufficient balance', async () => {
      solanaService.getBalance.mockResolvedValue({
        lamports: 1000,
        sol: 0.000001,
      });

      await expect(
        service.createTransfer(testFromAddress, testToAddress, 10000),
      ).rejects.toThrow('Insufficient balance');
    });

    it('should throw error for excessive transfer amount', async () => {
      const excessiveLamports = 1001 * LAMPORTS_PER_SOL;

      await expect(
        service.createTransfer(testFromAddress, testToAddress, excessiveLamports),
      ).rejects.toThrow('Transfer amount exceeds maximum allowed');
    });
  });

  describe('retry mechanism', () => {
    beforeEach(() => {
      solanaService.isValidPublicKey.mockReturnValue(true);
      solanaService.getBalance.mockResolvedValue({
        lamports: 10 * LAMPORTS_PER_SOL,
        sol: 10,
      });

      const mockConnection = solanaService.getConnection() as any;
      mockConnection.getLatestBlockhash.mockResolvedValue({
        blockhash: 'test-blockhash',
        lastValidBlockHeight: 12345,
      });
      mockConnection.getSignatureStatuses.mockResolvedValue({
        value: [{ confirmations: 2, err: null }],
      });
    });

    it('should retry on retryable errors', async () => {
      const mockConnection = solanaService.getConnection() as any;

      // Fail first two attempts, succeed on third
      mockConnection.sendRawTransaction
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce('test-signature');

      const result = await service.createTransfer(
        testFromAddress,
        testToAddress,
        1000,
        {
          signerKeypair: testKeypair,
          retryConfig: { maxRetries: 3, baseDelay: 10, maxDelay: 100, backoffMultiplier: 2 },
        },
      );

      expect(result.signature).toBe('test-signature');
      expect(mockConnection.sendRawTransaction).toHaveBeenCalledTimes(3);
      expect(loggerService.warn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      const mockConnection = solanaService.getConnection() as any;
      mockConnection.sendRawTransaction.mockRejectedValue(new Error('insufficient funds'));

      await expect(
        service.createTransfer(testFromAddress, testToAddress, 1000, {
          signerKeypair: testKeypair,
        }),
      ).rejects.toThrow('insufficient funds');

      expect(mockConnection.sendRawTransaction).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries exceeded', async () => {
      const mockConnection = solanaService.getConnection() as any;
      mockConnection.sendRawTransaction.mockRejectedValue(new Error('Network error'));

      await expect(
        service.createTransfer(testFromAddress, testToAddress, 1000, {
          signerKeypair: testKeypair,
          retryConfig: { maxRetries: 2, baseDelay: 10, maxDelay: 100, backoffMultiplier: 2 },
        }),
      ).rejects.toThrow('Transaction failed after 3 attempts');

      expect(mockConnection.sendRawTransaction).toHaveBeenCalledTimes(3);
    });
  });

  describe('confirmation tracking', () => {
    beforeEach(() => {
      solanaService.isValidPublicKey.mockReturnValue(true);
      solanaService.getBalance.mockResolvedValue({
        lamports: 10 * LAMPORTS_PER_SOL,
        sol: 10,
      });

      const mockConnection = solanaService.getConnection() as any;
      mockConnection.getLatestBlockhash.mockResolvedValue({
        blockhash: 'test-blockhash',
        lastValidBlockHeight: 12345,
      });
      mockConnection.sendRawTransaction.mockResolvedValue('test-signature');
    });

    it('should track transaction until minimum confirmations reached', async () => {
      const mockConnection = solanaService.getConnection() as any;

      // First call: 0 confirmations, second call: 2 confirmations
      mockConnection.getSignatureStatuses
        .mockResolvedValueOnce({
          value: [{ confirmations: 0, err: null }],
        })
        .mockResolvedValueOnce({
          value: [{ confirmations: 2, err: null }],
        });

      const transferPromise = service.createTransfer(
        testFromAddress,
        testToAddress,
        1000,
        {
          signerKeypair: testKeypair,
          confirmationConfig: { minConfirmations: 1, maxConfirmations: 2, pollingInterval: 50, timeout: 5000 },
        },
      );

      // Simulate polling by calling getSignatureStatuses
      setTimeout(async () => {
        await service.getSignatureStatuses(['test-signature']);
      }, 100);

      const result = await transferPromise;
      expect(result.status).toBe('confirmed');
      expect(result.confirmations).toBe(2);
    });

    it('should handle failed transactions', async () => {
      const mockConnection = solanaService.getConnection() as any;
      mockConnection.getSignatureStatuses.mockResolvedValue({
        value: [{ confirmations: 0, err: { InstructionError: [0, 'InvalidInstruction'] } }],
      });

      const transferPromise = service.createTransfer(
        testFromAddress,
        testToAddress,
        1000,
        {
          signerKeypair: testKeypair,
          confirmationConfig: { minConfirmations: 1, maxConfirmations: 2, pollingInterval: 50, timeout: 5000 },
        },
      );

      // Simulate polling
      setTimeout(async () => {
        await service.getSignatureStatuses(['test-signature']);
      }, 100);

      const result = await transferPromise;
      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });
  });

  describe('getSignatureStatuses', () => {
    it('should batch check multiple signatures', async () => {
      const mockConnection = solanaService.getConnection() as any;
      mockConnection.getSignatureStatuses.mockResolvedValue({
        value: [
          { confirmations: 1, err: null },
          { confirmations: 2, err: null },
          null, // Not found
        ],
      });

      const signatures = ['sig1', 'sig2', 'sig3'];
      const statuses = await service.getSignatureStatuses(signatures);

      expect(statuses.size).toBe(2);
      expect(statuses.get('sig1')).toEqual({ confirmations: 1, err: null });
      expect(statuses.get('sig2')).toEqual({ confirmations: 2, err: null });
      expect(statuses.has('sig3')).toBe(false);
    });

    it('should handle errors when checking signature statuses', async () => {
      const mockConnection = solanaService.getConnection() as any;
      mockConnection.getSignatureStatuses.mockRejectedValue(new Error('RPC error'));

      await expect(service.getSignatureStatuses(['sig1'])).rejects.toThrow(
        'Failed to get signature statuses: RPC error',
      );
    });
  });

  describe('utility methods', () => {
    it('should track pending transactions', () => {
      expect(service.getPendingTransactionsCount()).toBe(0);
      expect(service.getPendingTransactionSignatures()).toEqual([]);
    });

    it('should clear pending transactions', () => {
      service.clearPendingTransactions();
      expect(service.getPendingTransactionsCount()).toBe(0);
    });

    it('should convert SOL to lamports', () => {
      solanaService.solToLamports.mockReturnValue(1000000000);
      const result = service.solToLamports(1);
      expect(result).toBe(1000000000);
      expect(solanaService.solToLamports).toHaveBeenCalledWith(1);
    });

    it('should convert lamports to SOL', () => {
      solanaService.lamportsToSol.mockReturnValue(1);
      const result = service.lamportsToSol(1000000000);
      expect(result).toBe(1);
      expect(solanaService.lamportsToSol).toHaveBeenCalledWith(1000000000);
    });
  });

  describe('edge cases', () => {
    it('should handle empty signatures array', async () => {
      const statuses = await service.getSignatureStatuses([]);
      expect(statuses.size).toBe(0);
    });

    it('should handle non-integer lamports', async () => {
      await expect(
        service.createTransfer(testFromAddress, testToAddress, 1000.5),
      ).rejects.toThrow('Lamports must be a positive integer');
    });

    it('should handle missing from address', async () => {
      await expect(
        service.createTransfer('', testToAddress, 1000),
      ).rejects.toThrow('From and to addresses are required');
    });

    it('should handle missing to address', async () => {
      await expect(
        service.createTransfer(testFromAddress, '', 1000),
      ).rejects.toThrow('From and to addresses are required');
    });
  });
});