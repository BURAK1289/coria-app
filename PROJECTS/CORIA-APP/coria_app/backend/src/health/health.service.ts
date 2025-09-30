import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  async check() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.configService.get('NODE_ENV', 'development'),
      solana_network: this.configService.get('SOLANA_NETWORK', 'devnet'),
      version: '1.0.0',
      services: {
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
        solana_rpc: await this.checkSolanaRPC(),
      },
    };

    // Determine overall health
    const allHealthy = Object.values(checks.services).every(
      (service) => service.status === 'ok',
    );
    checks.status = allHealthy ? 'ok' : 'degraded';

    return checks;
  }

  private async checkDatabase(): Promise<{ status: string; message?: string }> {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        this.configService.get('SUPABASE_URL'),
        this.configService.get('SUPABASE_SERVICE_ROLE_KEY'),
      );

      const { error } = await supabase.from('solana_wallets').select('id').limit(1);

      if (error) {
        return { status: 'error', message: error.message };
      }

      return { status: 'ok' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  private async checkRedis(): Promise<{ status: string; message?: string }> {
    try {
      const redis = new Redis({
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: parseInt(this.configService.get('REDIS_PORT', '6379')),
        password: this.configService.get('REDIS_PASSWORD'),
        db: parseInt(this.configService.get('REDIS_DB', '0')),
        lazyConnect: true,
      });

      await redis.connect();
      const pong = await redis.ping();
      await redis.quit();

      if (pong === 'PONG') {
        return { status: 'ok' };
      }

      return { status: 'error', message: 'Invalid PING response' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  private async checkSolanaRPC(): Promise<{ status: string; message?: string }> {
    try {
      const rpcEndpoint = this.configService.get('RPC_ENDPOINT');
      const response = await fetch(rpcEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getHealth',
        }),
      });

      const data = await response.json();

      if (data.result === 'ok') {
        return { status: 'ok' };
      }

      return { status: 'error', message: data.error?.message || 'RPC unhealthy' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}