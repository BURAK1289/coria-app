import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '@/common/services/supabase.service';
import { LoggerService } from '@/common/services/logger.service';
import { UserProfile } from '@/common/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.logger.logAuth('login_failed', undefined, { email, error: error.message });
        throw new Error(`Login failed: ${error.message}`);
      }

      this.logger.logAuth('login_success', data.user?.id, { email });

      return {
        user: data.user,
        session: data.session,
        accessToken: data.session?.access_token,
      };
    } catch (error) {
      this.logger.error('Login error:', error, 'AuthService');
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string) {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client.auth.signUp({
        email,
        password,
      });

      if (error) {
        this.logger.logAuth('registration_failed', undefined, { email, error: error.message });
        throw new Error(`Registration failed: ${error.message}`);
      }

      this.logger.logAuth('registration_success', data.user?.id, { email });

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      this.logger.error('Registration error:', error, 'AuthService');
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        this.logger.logAuth('token_refresh_failed', undefined, { error: error.message });
        throw new Error(`Token refresh failed: ${error.message}`);
      }

      this.logger.logAuth('token_refresh_success', data.user?.id);

      return {
        session: data.session,
        user: data.user,
      };
    } catch (error) {
      this.logger.error('Token refresh error:', error, 'AuthService');
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(accessToken: string) {
    try {
      const client = this.supabaseService.getClientWithAuth(accessToken);
      const { error } = await client.auth.signOut();

      if (error) {
        this.logger.logAuth('logout_failed', undefined, { error: error.message });
        throw new Error(`Logout failed: ${error.message}`);
      }

      this.logger.logAuth('logout_success');
    } catch (error) {
      this.logger.error('Logout error:', error, 'AuthService');
      throw error;
    }
  }

  /**
   * Verify access token
   */
  async verifyToken(token: string) {
    try {
      const user = await this.supabaseService.getUserFromToken(token);

      if (!user) {
        return {
          valid: false,
          user: null,
        };
      }

      return {
        valid: true,
        user,
      };
    } catch (error) {
      this.logger.error('Token verification error:', error, 'AuthService');
      return {
        valid: false,
        user: null,
      };
    }
  }

  /**
   * Get user profile with premium information
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const serviceClient = this.supabaseService.getServiceClient();
      const { data, error } = await serviceClient
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        this.logger.error(`Error getting user profile for ${userId}:`, error, 'AuthService');
        throw new Error(`Failed to get user profile: ${error.message}`);
      }

      return data as UserProfile;
    } catch (error) {
      this.logger.error('Get user profile error:', error, 'AuthService');
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email: string) {
    try {
      const client = this.supabaseService.getClient();
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
      });

      if (error) {
        this.logger.logAuth('password_reset_failed', undefined, { email, error: error.message });
        throw new Error(`Password reset failed: ${error.message}`);
      }

      this.logger.logAuth('password_reset_sent', undefined, { email });
    } catch (error) {
      this.logger.error('Forgot password error:', error, 'AuthService');
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      const client = this.supabaseService.getClient();
      const { error } = await client.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        this.logger.logAuth('password_update_failed', undefined, { error: error.message });
        throw new Error(`Password reset failed: ${error.message}`);
      }

      this.logger.logAuth('password_update_success');
    } catch (error) {
      this.logger.error('Reset password error:', error, 'AuthService');
      throw error;
    }
  }

  /**
   * Create JWT token for internal use
   */
  async createJwtToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload);
  }

  /**
   * Verify JWT token
   */
  async verifyJwtToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      this.logger.error('JWT verification error:', error, 'AuthService');
      throw new Error('Invalid JWT token');
    }
  }
}