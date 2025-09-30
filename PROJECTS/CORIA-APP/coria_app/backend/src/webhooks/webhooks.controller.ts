import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { LoggerService } from '@/common/services/logger.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly logger: LoggerService,
  ) {}

  @Post('solana')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle Solana blockchain webhooks',
    description: 'Receives webhook notifications from Solana blockchain events',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid webhook payload',
  })
  async handleSolanaWebhook(
    @Body() payload: any,
    @Headers('x-signature') signature: string,
  ): Promise<{ success: boolean }> {
    this.logger.log('Received Solana webhook', 'WebhooksController');

    if (!signature) {
      throw new BadRequestException('Missing webhook signature');
    }

    await this.webhooksService.processSolanaWebhook(payload, signature);

    return { success: true };
  }

  @Post('payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle payment webhooks',
    description: 'Receives webhook notifications for payment events',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid webhook payload',
  })
  async handlePaymentWebhook(
    @Body() payload: any,
    @Headers('x-signature') signature: string,
  ): Promise<{ success: boolean }> {
    this.logger.log('Received payment webhook', 'WebhooksController');

    if (!signature) {
      throw new BadRequestException('Missing webhook signature');
    }

    await this.webhooksService.processPaymentWebhook(payload, signature);

    return { success: true };
  }
}