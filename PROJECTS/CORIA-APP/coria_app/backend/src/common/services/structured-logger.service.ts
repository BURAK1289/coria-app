import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export type LogEnvironment = 'development' | 'test' | 'staging' | 'production';

interface LogMetadata {
  correlationId?: string;
  userId?: string;
  requestId?: string;
  service?: string;
  action?: string;
  duration?: number;
  statusCode?: number;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

interface SecurityLogData {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'service_role' | 'rls_bypass' | 'rate_limit';
  userId?: string;
  ip?: string;
  details: Record<string, any>;
}

interface PerformanceLogData {
  operation: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, any>;
}

@Injectable()
export class StructuredLoggerService implements NestLoggerService {
  private readonly logLevel: LogLevel;
  private readonly environment: LogEnvironment;
  private readonly context = 'CORIA';
  private readonly sensitiveFields = [
    'password', 'token', 'secret', 'key', 'email', 'phone', 'ssn',
    'credit_card', 'privateKey', 'mnemonic', 'seed'
  ];

  constructor(private readonly configService: ConfigService) {
    this.logLevel = this.configService.get<LogLevel>('LOG_LEVEL', 'info');
    this.environment = this.configService.get<LogEnvironment>('NODE_ENV', 'development');
  }

  /**
   * PII Sanitization - masks sensitive data for logging
   */
  private sanitizeData(data: any): any {
    if (data === null || data === undefined) return data;

    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    if (typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (this.isSensitiveField(key)) {
          sanitized[key] = this.maskSensitiveValue(key, value as string);
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      return sanitized;
    }

    return data;
  }

  private isSensitiveField(fieldName: string): boolean {
    const lowerFieldName = fieldName.toLowerCase();
    return this.sensitiveFields.some(sensitive => lowerFieldName.includes(sensitive));
  }

  private sanitizeString(str: string): string {
    // Email pattern detection and masking
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return str.replace(emailRegex, (email) => this.maskEmail(email));
  }

  private maskSensitiveValue(fieldName: string, value: string): string {
    if (!value || typeof value !== 'string') return '[REDACTED]';

    const lowerFieldName = fieldName.toLowerCase();

    if (lowerFieldName.includes('email')) {
      return this.maskEmail(value);
    }

    if (lowerFieldName.includes('phone')) {
      return this.maskPhone(value);
    }

    if (lowerFieldName.includes('wallet') || lowerFieldName.includes('address')) {
      return this.maskWalletAddress(value);
    }

    if (lowerFieldName.includes('key') || lowerFieldName.includes('secret') || lowerFieldName.includes('token')) {
      return '[REDACTED]';
    }

    // Generic masking for other sensitive fields
    return value.length > 4 ? `${value.substring(0, 2)}***${value.substring(value.length - 2)}` : '[REDACTED]';
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '[REDACTED_EMAIL]';

    const maskedLocal = local.length > 2 ? `${local.substring(0, 2)}***` : '***';
    return `${maskedLocal}@${domain}`;
  }

  private maskPhone(phone: string): string {
    if (phone.length < 4) return '[REDACTED_PHONE]';
    return `***-***-${phone.substring(phone.length - 4)}`;
  }

  private maskWalletAddress(address: string): string {
    if (address.length < 8) return '[REDACTED_WALLET]';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private createStructuredLog(
    level: LogLevel,
    message: string,
    metadata: LogMetadata = {},
    context?: string
  ): any {
    const timestamp = new Date().toISOString();
    const sanitizedMetadata = this.environment === 'production'
      ? this.sanitizeData(metadata)
      : metadata;

    return {
      timestamp,
      level: level.toUpperCase(),
      service: this.context,
      context: context || 'General',
      message,
      environment: this.environment,
      ...sanitizedMetadata,
    };
  }

  private outputLog(logData: any): void {
    const logString = JSON.stringify(logData, null, this.environment === 'development' ? 2 : 0);

    switch (logData.level) {
      case 'ERROR':
        console.error(logString);
        break;
      case 'WARN':
        console.warn(logString);
        break;
      case 'INFO':
        console.log(logString);
        break;
      case 'DEBUG':
        console.debug(logString);
        break;
      default:
        console.log(logString);
    }
  }

  // Standard NestJS Logger interface implementation
  log(message: any, context?: string) {
    if (this.shouldLog('info')) {
      const logData = this.createStructuredLog('info', message, {}, context);
      this.outputLog(logData);
    }
  }

  error(message: any, trace?: string | Error, context?: string) {
    if (this.shouldLog('error')) {
      const metadata: LogMetadata = {};

      if (trace) {
        if (trace instanceof Error) {
          metadata.errorStack = trace.stack;
          metadata.errorName = trace.name;
        } else {
          metadata.trace = trace;
        }
      }

      const logData = this.createStructuredLog('error', message, metadata, context);
      this.outputLog(logData);
    }
  }

  warn(message: any, context?: string) {
    if (this.shouldLog('warn')) {
      const logData = this.createStructuredLog('warn', message, {}, context);
      this.outputLog(logData);
    }
  }

  debug(message: any, context?: string) {
    if (this.shouldLog('debug')) {
      const logData = this.createStructuredLog('debug', message, {}, context);
      this.outputLog(logData);
    }
  }

  verbose(message: any, context?: string) {
    this.debug(message, context);
  }

  // Enhanced structured logging methods
  logWithMetadata(
    level: LogLevel,
    message: string,
    metadata: LogMetadata = {},
    context?: string,
  ) {
    if (this.shouldLog(level)) {
      const logData = this.createStructuredLog(level, message, metadata, context);
      this.outputLog(logData);
    }
  }

  /**
   * Log security events with enhanced tracking
   */
  logSecurity(event: string, data: SecurityLogData, context = 'SecurityService') {
    const level: LogLevel = data.severity === 'critical' || data.severity === 'high' ? 'error' : 'warn';

    const metadata: LogMetadata = {
      securityEvent: event,
      severity: data.severity,
      category: data.category,
      userId: data.userId,
      ip: data.ip,
      alertRequired: data.severity === 'critical',
      ...data.details,
    };

    this.logWithMetadata(level, `🚨 Security Event: ${event}`, metadata, context);
  }

  /**
   * Log service role usage for audit trail
   */
  logServiceRoleUsage(
    operation: string,
    userId: string,
    metadata: LogMetadata = {},
    context = 'ServiceRoleAudit'
  ) {
    this.logSecurity('service_role_usage', {
      severity: 'medium',
      category: 'service_role',
      userId,
      details: {
        operation,
        requiresAudit: true,
        ...metadata,
      }
    }, context);
  }

  /**
   * Log RLS policy enforcement
   */
  logRLSEnforcement(
    action: 'bypass_attempt' | 'policy_enforced' | 'policy_failed',
    userId: string,
    table: string,
    metadata: LogMetadata = {},
    context = 'RLSEnforcement'
  ) {
    const severity = action === 'bypass_attempt' ? 'high' : 'medium';

    this.logSecurity('rls_enforcement', {
      severity,
      category: 'rls_bypass',
      userId,
      details: {
        action,
        table,
        requiresInvestigation: action === 'bypass_attempt',
        ...metadata,
      }
    }, context);
  }

  /**
   * Log performance metrics with alerting thresholds
   */
  logPerformance(data: PerformanceLogData, context = 'PerformanceMonitor') {
    const level: LogLevel = data.duration > 1000 ? 'warn' : 'debug';
    const isSlowOperation = data.duration > 1000;
    const isCriticalSlow = data.duration > 5000;

    const metadata: LogMetadata = {
      operation: data.operation,
      duration: data.duration,
      success: data.success,
      performanceIssue: isSlowOperation,
      criticalPerformance: isCriticalSlow,
      requiresOptimization: isCriticalSlow,
      ...data.metadata,
    };

    const message = isCriticalSlow
      ? `🐌 Critical Performance Issue: ${data.operation}`
      : isSlowOperation
        ? `⚠️ Slow Operation: ${data.operation}`
        : `✅ Performance: ${data.operation}`;

    this.logWithMetadata(level, message, metadata, context);
  }

  /**
   * Log payment events with financial audit trail
   */
  logPayment(
    event: string,
    paymentId: string,
    userId: string,
    amount: number,
    currency = 'SOL',
    metadata: LogMetadata = {},
    context = 'PaymentService'
  ) {
    const paymentMetadata: LogMetadata = {
      paymentId,
      userId,
      amount,
      currency,
      financialEvent: true,
      auditRequired: true,
      ...metadata,
    };

    this.logWithMetadata('info', `💰 Payment Event: ${event}`, paymentMetadata, context);
  }

  /**
   * Log wallet operations with blockchain audit
   */
  logWallet(
    event: string,
    walletId: string,
    userId: string,
    metadata: LogMetadata = {},
    context = 'WalletService'
  ) {
    const walletMetadata: LogMetadata = {
      walletId,
      userId,
      blockchainEvent: true,
      auditRequired: true,
      ...metadata,
    };

    this.logWithMetadata('info', `🔐 Wallet Event: ${event}`, walletMetadata, context);
  }

  /**
   * Log rate limiting events
   */
  logRateLimit(
    event: 'limit_exceeded' | 'limit_reset' | 'limit_warning',
    userId: string,
    operation: string,
    currentCount: number,
    limit: number,
    metadata: LogMetadata = {},
    context = 'RateLimitService'
  ) {
    const severity = event === 'limit_exceeded' ? 'medium' : 'low';

    this.logSecurity('rate_limit_event', {
      severity,
      category: 'rate_limit',
      userId,
      details: {
        event,
        operation,
        currentCount,
        limit,
        utilizationPercent: Math.round((currentCount / limit) * 100),
        ...metadata,
      }
    }, context);
  }

  /**
   * Log authentication events
   */
  logAuth(
    event: string,
    userId?: string,
    metadata: LogMetadata = {},
    context = 'AuthService'
  ) {
    const authMetadata: LogMetadata = {
      authEvent: event,
      userId: userId || 'anonymous',
      securityRelevant: true,
      ...metadata,
    };

    this.logWithMetadata('info', `🔑 Auth Event: ${event}`, authMetadata, context);
  }

  /**
   * Log API requests with correlation tracking
   */
  logApiRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    userId?: string,
    correlationId?: string,
    metadata: LogMetadata = {},
    context = 'APIService'
  ) {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    const apiMetadata: LogMetadata = {
      method,
      endpoint,
      statusCode,
      duration,
      userId: userId || 'anonymous',
      correlationId,
      apiCall: true,
      slow: duration > 1000,
      ...metadata,
    };

    const message = `📡 API ${method} ${endpoint} - ${statusCode} (${duration}ms)`;
    this.logWithMetadata(level, message, apiMetadata, context);
  }
}