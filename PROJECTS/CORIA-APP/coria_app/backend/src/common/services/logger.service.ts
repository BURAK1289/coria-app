import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logLevel: LogLevel;
  private context = 'CORIA';

  constructor(private readonly configService: ConfigService) {
    this.logLevel = this.configService.get<LogLevel>('LOG_LEVEL', 'info');
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private formatMessage(level: LogLevel, message: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context;
    const levelUpper = level.toUpperCase().padEnd(5);

    return `[${timestamp}] [${levelUpper}] [${ctx}] ${message}`;
  }

  log(message: any, context?: string) {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, context));
    }
  }

  error(message: any, trace?: string | Error, context?: string) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context));
      if (trace) {
        if (trace instanceof Error) {
          console.error(trace.stack);
        } else {
          console.error(trace);
        }
      }
    }
  }

  warn(message: any, context?: string) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  debug(message: any, context?: string) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  verbose(message: any, context?: string) {
    // Alias for debug
    this.debug(message, context);
  }

  /**
   * Log with additional metadata
   */
  logWithMeta(
    level: LogLevel,
    message: string,
    meta: Record<string, any> = {},
    context?: string,
  ) {
    if (this.shouldLog(level)) {
      const metaString = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
      const fullMessage = `${message}${metaString}`;

      switch (level) {
        case 'error':
          console.error(this.formatMessage('error', fullMessage, context));
          break;
        case 'warn':
          console.warn(this.formatMessage('warn', fullMessage, context));
          break;
        case 'info':
          console.log(this.formatMessage('info', fullMessage, context));
          break;
        case 'debug':
          console.debug(this.formatMessage('debug', fullMessage, context));
          break;
      }
    }
  }

  /**
   * Log payment-related events with structured data
   */
  logPayment(
    event: string,
    paymentId: string,
    userId: string,
    amount: number,
    additional: Record<string, any> = {},
  ) {
    this.logWithMeta(
      'info',
      `Payment Event: ${event}`,
      {
        paymentId,
        userId,
        amount,
        ...additional,
      },
      'PaymentService',
    );
  }

  /**
   * Log wallet-related events with structured data
   */
  logWallet(
    event: string,
    walletId: string,
    userId: string,
    additional: Record<string, any> = {},
  ) {
    this.logWithMeta(
      'info',
      `Wallet Event: ${event}`,
      {
        walletId,
        userId,
        ...additional,
      },
      'WalletService',
    );
  }

  /**
   * Log authentication events
   */
  logAuth(
    event: string,
    userId?: string,
    additional: Record<string, any> = {},
  ) {
    this.logWithMeta(
      'info',
      `Auth Event: ${event}`,
      {
        userId: userId || 'anonymous',
        ...additional,
      },
      'AuthService',
    );
  }

  /**
   * Log security events with high visibility
   */
  logSecurity(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, any> = {},
  ) {
    const level: LogLevel = severity === 'critical' || severity === 'high' ? 'error' : 'warn';

    this.logWithMeta(
      level,
      `🚨 Security Event: ${event}`,
      {
        severity,
        timestamp: new Date().toISOString(),
        ...details,
      },
      'SecurityService',
    );
  }

  /**
   * Log API performance metrics
   */
  logPerformance(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    userId?: string,
  ) {
    const level: LogLevel = duration > 1000 ? 'warn' : 'debug';

    this.logWithMeta(
      level,
      `API Performance: ${method} ${endpoint}`,
      {
        duration: `${duration}ms`,
        statusCode,
        userId: userId || 'anonymous',
        slow: duration > 1000,
      },
      'PerformanceService',
    );
  }
}