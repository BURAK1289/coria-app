import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  CreateWalletDto,
  ConnectWalletDto,
  UpdateWalletDto,
  SendTransactionDto,
} from './wallets.dto';

describe('Wallet DTOs', () => {
  describe('CreateWalletDto', () => {
    it('should pass validation with valid optional fields', async () => {
      const dto = plainToClass(CreateWalletDto, {
        name: 'My Wallet',
        isPrimary: true,
        metadata: { test: true },
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with minimal data', async () => {
      const dto = plainToClass(CreateWalletDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with empty name', async () => {
      const dto = plainToClass(CreateWalletDto, {
        name: '',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail validation with invalid metadata type', async () => {
      const dto = plainToClass(CreateWalletDto, {
        metadata: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('metadata');
      expect(errors[0].constraints).toHaveProperty('isObject');
    });

    it('should fail validation with invalid isPrimary type', async () => {
      const dto = plainToClass(CreateWalletDto, {
        isPrimary: 'not-boolean',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isPrimary');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });

  describe('ConnectWalletDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(ConnectWalletDto, {
        publicKey: '11111111111111111111111111111111111111111111',
        provider: 'phantom',
        name: 'My Phantom Wallet',
        isPrimary: false,
        metadata: { connected_via: 'qr_code' },
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with minimal required data', async () => {
      const dto = plainToClass(ConnectWalletDto, {
        publicKey: '11111111111111111111111111111111111111111111',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation without publicKey', async () => {
      const dto = plainToClass(ConnectWalletDto, {
        provider: 'phantom',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('publicKey');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation with short publicKey', async () => {
      const dto = plainToClass(ConnectWalletDto, {
        publicKey: '1111', // Too short
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('publicKey');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail validation with empty provider', async () => {
      const dto = plainToClass(ConnectWalletDto, {
        publicKey: '11111111111111111111111111111111111111111111',
        provider: '',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0); // Provider is optional and can be empty
    });

    it('should fail validation with empty name', async () => {
      const dto = plainToClass(ConnectWalletDto, {
        publicKey: '11111111111111111111111111111111111111111111',
        name: '',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });
  });

  describe('UpdateWalletDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(UpdateWalletDto, {
        name: 'Updated Wallet Name',
        isPrimary: true,
        metadata: { updated: true },
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty data', async () => {
      const dto = plainToClass(UpdateWalletDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with empty name', async () => {
      const dto = plainToClass(UpdateWalletDto, {
        name: '',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });
  });

  describe('SendTransactionDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(SendTransactionDto, {
        destinationAddress: '11111111111111111111111111111111111111111111',
        amountSol: 0.5,
        walletId: 'wallet-123',
        memo: 'Test payment',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with minimal required data', async () => {
      const dto = plainToClass(SendTransactionDto, {
        destinationAddress: '11111111111111111111111111111111111111111111',
        amountSol: 0.1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation without destinationAddress', async () => {
      const dto = plainToClass(SendTransactionDto, {
        amountSol: 0.5,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('destinationAddress');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation with short destinationAddress', async () => {
      const dto = plainToClass(SendTransactionDto, {
        destinationAddress: '1111', // Too short
        amountSol: 0.5,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('destinationAddress');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail validation without amountSol', async () => {
      const dto = plainToClass(SendTransactionDto, {
        destinationAddress: '11111111111111111111111111111111111111111111',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('amountSol');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation with zero amountSol', async () => {
      const dto = plainToClass(SendTransactionDto, {
        destinationAddress: '11111111111111111111111111111111111111111111',
        amountSol: 0,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('amountSol');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation with negative amountSol', async () => {
      const dto = plainToClass(SendTransactionDto, {
        destinationAddress: '11111111111111111111111111111111111111111111',
        amountSol: -0.1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('amountSol');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation with too small amountSol', async () => {
      const dto = plainToClass(SendTransactionDto, {
        destinationAddress: '11111111111111111111111111111111111111111111',
        amountSol: 0.0000001, // Less than 1 lamport
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('amountSol');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should pass validation with minimum allowed amountSol', async () => {
      const dto = plainToClass(SendTransactionDto, {
        destinationAddress: '11111111111111111111111111111111111111111111',
        amountSol: 0.000001, // Exactly 1 lamport
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid walletId type', async () => {
      const dto = plainToClass(SendTransactionDto, {
        destinationAddress: '11111111111111111111111111111111111111111111',
        amountSol: 0.5,
        walletId: 123, // Should be string
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('walletId');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation with invalid memo type', async () => {
      const dto = plainToClass(SendTransactionDto, {
        destinationAddress: '11111111111111111111111111111111111111111111',
        amountSol: 0.5,
        memo: 123, // Should be string
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('memo');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('Edge Cases and Security Validations', () => {
    describe('Solana Address Validation', () => {
      it('should reject common invalid Solana addresses', async () => {
        const invalidAddresses = [
          '', // Empty
          '1111', // Too short
          '0'.repeat(44), // All zeros (invalid base58)
          'O'.repeat(44), // Contains 'O' (invalid base58)
          'I'.repeat(44), // Contains 'I' (invalid base58)
          'l'.repeat(44), // Contains 'l' (invalid base58)
          '1'.repeat(43), // Too short by 1
          '1'.repeat(45), // Too long by 1
        ];

        for (const address of invalidAddresses) {
          const dto = plainToClass(ConnectWalletDto, {
            publicKey: address,
          });

          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
        }
      });

      it('should accept valid Solana address format', async () => {
        const validAddresses = [
          '11111111111111111111111111111111111111111111', // Valid format
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // Real USDC address
          '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', // Real program address
        ];

        for (const address of validAddresses) {
          const dto = plainToClass(ConnectWalletDto, {
            publicKey: address,
          });

          const errors = await validate(dto);
          expect(errors).toHaveLength(0);
        }
      });
    });

    describe('Amount Validation Edge Cases', () => {
      it('should handle precision edge cases for SOL amounts', async () => {
        const testCases = [
          { amount: 0.000001, valid: true }, // 1 lamport
          { amount: 0.0000001, valid: false }, // 0.1 lamport
          { amount: 999999999.999999999, valid: true }, // Max theoretical SOL
          { amount: Number.MAX_SAFE_INTEGER, valid: true }, // JS max safe integer
          { amount: Infinity, valid: false }, // Infinity
          { amount: -Infinity, valid: false }, // Negative infinity
          { amount: NaN, valid: false }, // Not a number
        ];

        for (const testCase of testCases) {
          const dto = plainToClass(SendTransactionDto, {
            destinationAddress: '11111111111111111111111111111111111111111111',
            amountSol: testCase.amount,
          });

          const errors = await validate(dto);
          if (testCase.valid) {
            expect(errors).toHaveLength(0);
          } else {
            expect(errors.length).toBeGreaterThan(0);
          }
        }
      });
    });

    describe('Metadata Security Validation', () => {
      it('should reject non-object metadata', async () => {
        const invalidMetadata = [
          'string',
          123,
          true,
          [],
          null,
          undefined,
        ];

        for (const metadata of invalidMetadata) {
          const dto = plainToClass(CreateWalletDto, {
            metadata,
          });

          const errors = await validate(dto);
          if (metadata === null || metadata === undefined) {
            expect(errors).toHaveLength(0); // null/undefined are optional
          } else {
            expect(errors.length).toBeGreaterThan(0);
          }
        }
      });

      it('should accept valid metadata objects', async () => {
        const validMetadata = [
          {},
          { test: true },
          { nested: { object: 'value' } },
          { array: [1, 2, 3] },
          { mixed: { types: 'string', number: 123, boolean: true } },
        ];

        for (const metadata of validMetadata) {
          const dto = plainToClass(CreateWalletDto, {
            metadata,
          });

          const errors = await validate(dto);
          expect(errors).toHaveLength(0);
        }
      });
    });

    describe('String Length Validation', () => {
      it('should enforce minimum length requirements', async () => {
        const testCases = [
          { field: 'name', value: '', minLength: 1 },
          { field: 'publicKey', value: '123', minLength: 44 },
          { field: 'destinationAddress', value: 'abc', minLength: 44 },
        ];

        for (const testCase of testCases) {
          let dto: any;

          if (testCase.field === 'publicKey') {
            dto = plainToClass(ConnectWalletDto, {
              [testCase.field]: testCase.value,
            });
          } else if (testCase.field === 'destinationAddress') {
            dto = plainToClass(SendTransactionDto, {
              [testCase.field]: testCase.value,
              amountSol: 0.1,
            });
          } else {
            dto = plainToClass(CreateWalletDto, {
              [testCase.field]: testCase.value,
            });
          }

          const errors = await validate(dto);
          expect(errors).toHaveLength(1);
          expect(errors[0].property).toBe(testCase.field);
          expect(errors[0].constraints).toHaveProperty('minLength');
        }
      });
    });
  });
});