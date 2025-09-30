import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Request,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsObject, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaymentsService, CreatePendingPaymentDto, PendingPayment, PaymentConfirmationResult } from './payments.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { LoggerService } from '@/common/services/logger.service';

export class CreatePaymentDto {
  @IsUUID('4')
  @ApiProperty({ description: 'Wallet ID for the payment' })
  walletId: string;

  @IsEnum(['donation', 'premium'])
  @ApiProperty({ description: 'Type of payment: donation or premium' })
  type: 'donation' | 'premium';

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(1000, { message: 'Minimum amount is 1000 lamports (0.000001 SOL)' })
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: 'Payment amount in lamports' })
  amountLamports: number;

  @IsString()
  @ApiProperty({ description: 'Unique idempotency key to prevent duplicate payments' })
  idempotencyKey: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Solana transaction signature (optional, can be added later)' })
  txSignature?: string;

  @IsObject()
  @IsOptional()
  @ApiProperty({ description: 'Additional metadata for the payment' })
  metadata?: Record<string, any>;
}

export class PaymentResponseDto {
  @ApiProperty({ description: 'Payment ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Wallet ID' })
  walletId: string;

  @ApiProperty({ description: 'Payment type' })
  type: string;

  @ApiProperty({ description: 'Amount in lamports' })
  amountLamports: number;

  @ApiProperty({ description: 'Amount in SOL' })
  amountSol: number;

  @ApiProperty({ description: 'Payment status' })
  status: string;

  @ApiProperty({ description: 'Target pool address' })
  targetPoolAddress: string;

  @ApiProperty({ description: 'Transaction signature' })
  txSignature?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Expiration timestamp' })
  expiresAt: string;
}

export class ConfirmationResponseDto {
  @ApiProperty({ description: 'Payment ID' })
  paymentId: string;

  @ApiProperty({ description: 'Confirmation status' })
  status: 'confirmed' | 'failed' | 'mismatch';

  @ApiProperty({ description: 'Reason for failure or mismatch' })
  reason?: string;

  @ApiProperty({ description: 'Ledger entry ID if confirmed' })
  ledgerEntryId?: string;

  @ApiProperty({ description: 'Whether premium was activated' })
  premiumActivated?: boolean;

  @ApiProperty({ description: 'Premium expiration date' })
  premiumExpiresAt?: string;
}

export class PoolConfigResponseDto {
  @ApiProperty({ description: 'Donation pool address' })
  donationPool: string;

  @ApiProperty({ description: 'Premium pool address' })
  premiumPool: string;

  @ApiProperty({ description: 'Premium price in SOL' })
  premiumPriceSol: number;

  @ApiProperty({ description: 'Premium duration in days' })
  premiumDurationDays: number;
}

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a pending payment',
    description: 'Creates a pending payment with idempotency protection. Can be used for donations or premium subscriptions.',
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment created successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid payment parameters',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Payment with same idempotency key already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async createPayment(
    @Body(ValidationPipe) createPaymentDto: CreatePaymentDto,
    @Request() req: any,
  ): Promise<PaymentResponseDto> {
    const userId = req.user.sub;

    this.logger.log(
      `Creating ${createPaymentDto.type} payment for user ${userId}: ${createPaymentDto.amountLamports} lamports`,
      'PaymentsController',
    );

    const paymentData: CreatePendingPaymentDto = {
      userId,
      walletId: createPaymentDto.walletId,
      type: createPaymentDto.type,
      amountLamports: createPaymentDto.amountLamports,
      txSignature: createPaymentDto.txSignature,
      idempotencyKey: createPaymentDto.idempotencyKey,
      metadata: createPaymentDto.metadata,
    };

    const payment = await this.paymentsService.createPending(paymentData);

    return {
      id: payment.id,
      userId: payment.userId,
      walletId: payment.walletId,
      type: payment.type,
      amountLamports: payment.amountLamports,
      amountSol: payment.amountSol,
      status: payment.status,
      targetPoolAddress: payment.targetPoolAddress,
      txSignature: payment.txSignature,
      createdAt: payment.createdAt,
      expiresAt: payment.expiresAt,
    };
  }

  @Post(':paymentId/confirm')
  @ApiOperation({
    summary: 'Confirm a payment',
    description: 'Confirms a payment by verifying the transaction on Solana network and updating records accordingly.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment confirmation result',
    type: ConfirmationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Payment not found or invalid',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async confirmPayment(
    @Param('paymentId') paymentId: string,
    @Request() req: any,
  ): Promise<ConfirmationResponseDto> {
    const userId = req.user.sub;

    this.logger.log(`Confirming payment ${paymentId} for user ${userId}`, 'PaymentsController');

    const result = await this.paymentsService.confirmPayment(paymentId);

    return {
      paymentId: result.paymentId,
      status: result.status,
      reason: result.reason,
      ledgerEntryId: result.ledgerEntryId,
      premiumActivated: result.premiumActivated,
      premiumExpiresAt: result.premiumExpiresAt,
    };
  }

  @Get('config')
  @ApiOperation({
    summary: 'Get payment pool configuration',
    description: 'Returns the configuration for payment pools including addresses and pricing.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pool configuration',
    type: PoolConfigResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async getPoolConfig(): Promise<PoolConfigResponseDto> {
    const config = this.paymentsService.getPoolConfig();

    return {
      donationPool: config.donationPool,
      premiumPool: config.premiumPool,
      premiumPriceSol: config.premiumPriceSol,
      premiumDurationDays: config.premiumDurationDays,
    };
  }

  @Get('convert/sol-to-lamports/:sol')
  @ApiOperation({
    summary: 'Convert SOL to lamports',
    description: 'Utility endpoint to convert SOL amount to lamports for payment creation.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conversion result',
    schema: {
      type: 'object',
      properties: {
        sol: { type: 'number', description: 'Input SOL amount' },
        lamports: { type: 'number', description: 'Output lamports amount' },
      },
    },
  })
  async convertSolToLamports(@Param('sol') sol: string): Promise<{ sol: number; lamports: number }> {
    const solAmount = parseFloat(sol);

    if (isNaN(solAmount) || solAmount <= 0) {
      throw new Error('Invalid SOL amount');
    }

    const lamports = this.paymentsService.solToLamports(solAmount);

    return {
      sol: solAmount,
      lamports,
    };
  }

  @Get('convert/lamports-to-sol/:lamports')
  @ApiOperation({
    summary: 'Convert lamports to SOL',
    description: 'Utility endpoint to convert lamports amount to SOL for display purposes.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conversion result',
    schema: {
      type: 'object',
      properties: {
        lamports: { type: 'number', description: 'Input lamports amount' },
        sol: { type: 'number', description: 'Output SOL amount' },
      },
    },
  })
  async convertLamportsToSol(@Param('lamports') lamports: string): Promise<{ lamports: number; sol: number }> {
    const lamportsAmount = parseInt(lamports);

    if (isNaN(lamportsAmount) || lamportsAmount <= 0) {
      throw new Error('Invalid lamports amount');
    }

    const sol = this.paymentsService.lamportsToSol(lamportsAmount);

    return {
      lamports: lamportsAmount,
      sol,
    };
  }
}