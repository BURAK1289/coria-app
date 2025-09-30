import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LoggerService } from './logger.service';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;
  private serviceClient: SupabaseClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    const url = this.configService.get<string>('SUPABASE_URL');
    const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !anonKey || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration. Check SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY');
    }

    // Anonymous client for user operations
    this.client = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Service role client for administrative operations
    this.serviceClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log('Supabase clients initialized successfully', 'SupabaseService');
  }

  /**
   * Get the anonymous client for user-level operations
   */
  getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Get the service role client for administrative operations
   */
  getServiceClient(): SupabaseClient {
    return this.serviceClient;
  }

  /**
   * Create a client with a specific user token
   */
  getClientWithAuth(token: string): SupabaseClient {
    const url = this.configService.get<string>('SUPABASE_URL');
    const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    const client = createClient(url, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    return client;
  }

  /**
   * Execute RPC function with service role privileges
   */
  async executeRpc<T = any>(
    functionName: string,
    params: Record<string, any> = {},
  ): Promise<T> {
    try {
      const { data, error } = await this.serviceClient.rpc(functionName, params);

      if (error) {
        this.logger.error(`RPC function ${functionName} failed:`, error, 'SupabaseService');
        throw new Error(`RPC ${functionName} failed: ${error.message}`);
      }

      return data as T;
    } catch (error) {
      this.logger.error(`Error executing RPC ${functionName}:`, error, 'SupabaseService');
      throw error;
    }
  }

  /**
   * Execute RPC function with user context
   */
  async executeUserRpc<T = any>(
    token: string,
    functionName: string,
    params: Record<string, any> = {},
  ): Promise<T> {
    try {
      const client = this.getClientWithAuth(token);
      const { data, error } = await client.rpc(functionName, params);

      if (error) {
        this.logger.error(`User RPC function ${functionName} failed:`, error, 'SupabaseService');
        throw new Error(`User RPC ${functionName} failed: ${error.message}`);
      }

      return data as T;
    } catch (error) {
      this.logger.error(`Error executing user RPC ${functionName}:`, error, 'SupabaseService');
      throw error;
    }
  }

  /**
   * Get user from JWT token
   */
  async getUserFromToken(token: string) {
    try {
      const { data, error } = await this.client.auth.getUser(token);

      if (error) {
        this.logger.warn(`Invalid token provided: ${error.message}`);
        return null;
      }

      return data.user;
    } catch (error) {
      this.logger.error('Error getting user from token:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<boolean> {
    const user = await this.getUserFromToken(token);
    return !!user;
  }
}