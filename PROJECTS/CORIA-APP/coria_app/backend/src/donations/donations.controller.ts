import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ApiResponse } from '@/common/types';

@Controller('donations')
@UseGuards(JwtAuthGuard)
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post('donate')
  async donate(
    @Request() req,
    @Body() body: { wallet_id: string; amount_sol: number; message?: string },
  ): Promise<ApiResponse<any>> {
    const userId = req.user.sub;
    const result = await this.donationsService.processDonation(
      userId,
      body.wallet_id,
      body.amount_sol,
      body.message,
    );
    return {
      success: true,
      message: 'Donation processed successfully',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('history')
  async getHistory(@Request() req): Promise<ApiResponse<any>> {
    const userId = req.user.sub;
    const donations = await this.donationsService.getDonationHistory(userId);
    return {
      success: true,
      data: { donations },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('total')
  async getTotal(@Request() req): Promise<ApiResponse<any>> {
    const userId = req.user.sub;
    const total = await this.donationsService.getTotalDonations(userId);
    return {
      success: true,
      data: { total_sol: total.totalSol, total_lamports: total.totalLamports, count: total.count },
      timestamp: new Date().toISOString(),
    };
  }
}