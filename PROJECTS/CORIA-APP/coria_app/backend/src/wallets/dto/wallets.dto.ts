import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsObject, MinLength, IsNumber, Min, Matches } from 'class-validator';

export class CreateWalletDto {
  @ApiPropertyOptional({
    description: 'Wallet name',
    example: 'My Savings Wallet',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({
    description: 'Set as primary wallet',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { purpose: 'savings', created_via: 'mobile_app' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ConnectWalletDto {
  @ApiProperty({
    description: 'Solana public key',
    example: '11111111111111111111111111111111',
  })
  @IsString()
  @MinLength(44)
  @Matches(/^[1-9A-HJ-NP-Za-km-z]{44}$/, {
    message: 'publicKey must be a valid Solana address (base58, 44 characters, no 0OIl)',
  })
  publicKey: string;

  @ApiPropertyOptional({
    description: 'Wallet provider',
    example: 'phantom',
  })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional({
    description: 'Wallet name',
    example: 'My Phantom Wallet',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({
    description: 'Set as primary wallet',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { connected_via: 'qr_code' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateWalletDto {
  @ApiPropertyOptional({
    description: 'Wallet name',
    example: 'Updated Wallet Name',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({
    description: 'Set as primary wallet',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { updated_at: '2025-01-26' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class SendTransactionDto {
  @ApiProperty({
    description: 'Destination Solana address',
    example: '11111111111111111111111111111111',
  })
  @IsString()
  @MinLength(44)
  @Matches(/^[1-9A-HJ-NP-Za-km-z]{44}$/, {
    message: 'destinationAddress must be a valid Solana address (base58, 44 characters, no 0OIl)',
  })
  destinationAddress: string;

  @ApiProperty({
    description: 'Amount to send in SOL',
    example: 0.1,
  })
  @IsNumber()
  @Min(0.000001) // Minimum 1 lamport in SOL
  amountSol: number;

  @ApiPropertyOptional({
    description: 'Wallet ID to send from (uses primary if not specified)',
    example: 'uuid-here',
  })
  @IsString()
  @IsOptional()
  walletId?: string;

  @ApiPropertyOptional({
    description: 'Transaction memo',
    example: 'Payment for services',
  })
  @IsString()
  @IsOptional()
  memo?: string;
}