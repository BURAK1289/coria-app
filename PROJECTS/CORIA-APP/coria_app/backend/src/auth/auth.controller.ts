import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { LoginDto, RefreshTokenDto, VerifyTokenDto } from './dto/auth.dto';
import { ApiResponse as CustomApiResponse } from '@/common/types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            session: { type: 'object' },
            accessToken: { type: 'string' },
          },
        },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<CustomApiResponse> {
    try {
      const result = await this.authService.login(loginDto.email, loginDto.password);
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

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            session: { type: 'object' },
          },
        },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Registration failed' })
  async register(@Body() loginDto: LoginDto): Promise<CustomApiResponse> {
    try {
      const result = await this.authService.register(loginDto.email, loginDto.password);
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

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            session: { type: 'object' },
            user: { type: 'object' },
          },
        },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<CustomApiResponse> {
    try {
      const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);
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

  @Post('logout')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Request() req: any): Promise<CustomApiResponse> {
    try {
      await this.authService.logout(req.user.access_token);
      return {
        success: true,
        message: 'Logout successful',
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

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify access token' })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            user: { type: 'object' },
          },
        },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async verify(@Body() verifyTokenDto: VerifyTokenDto): Promise<CustomApiResponse> {
    try {
      const result = await this.authService.verifyToken(verifyTokenDto.token);
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

  @Get('profile')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: any): Promise<CustomApiResponse> {
    try {
      const profile = await this.authService.getUserProfile(req.user.id);
      return {
        success: true,
        data: profile,
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

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  async forgotPassword(@Body() body: { email: string }): Promise<CustomApiResponse> {
    try {
      await this.authService.forgotPassword(body.email);
      return {
        success: true,
        message: 'Password reset email sent',
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

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid token or password' })
  async resetPassword(
    @Body() body: { token: string; password: string },
  ): Promise<CustomApiResponse> {
    try {
      await this.authService.resetPassword(body.token, body.password);
      return {
        success: true,
        message: 'Password reset successful',
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