import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { CreateWalletDto, ConnectWalletDto, UpdateWalletDto, SendTransactionDto } from './dto/wallets.dto';
import { ApiResponse as CustomApiResponse } from '@/common/types';

@ApiTags('wallets')
@Controller('wallets')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user wallet summary' })
  @ApiResponse({
    status: 200,
    description: 'User wallet summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            wallets: { type: 'array' },
            primary: { type: 'object' },
            totalBalance: {
              type: 'object',
              properties: {
                lamports: { type: 'number' },
                sol: { type: 'number' },
              },
            },
          },
        },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyWallets(@Request() req: any): Promise<CustomApiResponse> {
    try {
      const summary = await this.walletsService.getUserWalletSummary(req.user.id);
      return {
        success: true,
        data: summary,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get total balance across all user wallets' })
  @ApiResponse({
    status: 200,
    description: 'Total balance retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            lamports: { type: 'number' },
            sol: { type: 'number' },
            walletCount: { type: 'number' },
          },
        },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTotalBalance(@Request() req: any): Promise<CustomApiResponse> {
    try {
      const balance = await this.walletsService.getUserTotalBalance(req.user.id);
      return {
        success: true,
        data: balance,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send SOL from custodial wallet' })
  @ApiResponse({
    status: 200,
    description: 'Transaction sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            txSignature: { type: 'string' },
            amountSol: { type: 'number' },
          },
        },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request or insufficient balance' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendTransaction(
    @Request() req: any,
    @Body() sendDto: SendTransactionDto,
  ): Promise<CustomApiResponse> {
    try {
      const result = await this.walletsService.sendTransaction(req.user.id, sendDto);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('custodial')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new custodial wallet' })
  @ApiResponse({
    status: 201,
    description: 'Custodial wallet created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Wallet creation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createCustodialWallet(
    @Request() req: any,
    @Body() createDto: CreateWalletDto,
  ): Promise<CustomApiResponse> {
    try {
      const wallet = await this.walletsService.createCustodialWallet(req.user.id, createDto);
      return {
        success: true,
        data: wallet,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('connect')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Connect an external wallet' })
  @ApiResponse({
    status: 201,
    description: 'External wallet connected successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Wallet connection failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async connectExternalWallet(
    @Request() req: any,
    @Body() connectDto: ConnectWalletDto,
  ): Promise<CustomApiResponse> {
    try {
      const wallet = await this.walletsService.connectExternalWallet(req.user.id, connectDto);
      return {
        success: true,
        data: wallet,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(':walletId')
  @ApiOperation({ summary: 'Get wallet details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Wallet details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWallet(
    @Request() req: any,
    @Param('walletId') walletId: string,
  ): Promise<CustomApiResponse> {
    try {
      const wallet = await this.walletsService.getWalletById(walletId, req.user.id);
      if (!wallet) {
        return {
          success: false,
          error: 'Wallet not found',
          timestamp: new Date().toISOString(),
        };
      }
      return {
        success: true,
        data: wallet,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post(':walletId/refresh-balance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh wallet balance from Solana network' })
  @ApiResponse({
    status: 200,
    description: 'Balance refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            lamports: { type: 'number' },
            sol: { type: 'number' },
          },
        },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refreshBalance(
    @Request() req: any,
    @Param('walletId') walletId: string,
  ): Promise<CustomApiResponse> {
    try {
      const balance = await this.walletsService.refreshWalletBalance(walletId, req.user.id);
      return {
        success: true,
        data: balance,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post(':walletId/set-primary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set wallet as primary' })
  @ApiResponse({
    status: 200,
    description: 'Primary wallet set successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setPrimaryWallet(
    @Request() req: any,
    @Param('walletId') walletId: string,
  ): Promise<CustomApiResponse> {
    try {
      await this.walletsService.setPrimaryWallet(walletId, req.user.id);
      return {
        success: true,
        message: 'Primary wallet set successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('ensure')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ensure user has a wallet (creates one if needed)',
    description: 'Admin endpoint to ensure a user has a custodial wallet. Creates one if none exists.'
  })
  @ApiResponse({
    status: 200,
    description: 'User wallet ensured successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            wallet: { type: 'object' },
            created: { type: 'boolean' },
          },
        },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async ensureUserWallet(@Request() req: any): Promise<CustomApiResponse> {
    try {
      const userEmail = req.user.email;
      const wallet = await this.walletsService.ensureUserWallet(userEmail);

      return {
        success: true,
        data: {
          wallet,
          created: wallet.metadata?.autoCreated || false,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}