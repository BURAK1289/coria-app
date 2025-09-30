import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StructuredLoggerService } from './structured-logger.service';
import { CoriaError, ERROR_CLASSIFICATIONS, ErrorCategory, ErrorSeverity, RetryStrategy } from '../errors/error-taxonomy';

export enum CircuitState {
  CLOSED = 'closed',     // Normal operation
  OPEN = 'open',         // Circuit breaker is open, fast-fail
  HALF_OPEN = 'half-open' // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number;    // Number of failures before opening
  successThreshold: number;    // Number of successes before closing from half-open
  timeout: number;            // Time in ms before moving to half-open
  monitoringPeriod: number;   // Time window for failure counting
  enabled: boolean;
}

export interface CircuitMetrics {
  totalCalls: number;
  successCount: number;
  failureCount: number;
  state: CircuitState;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  timeouts: number;
  rejections: number;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterEnabled: boolean;
  retryableErrors: ErrorCategory[];
}

@Injectable()
export class CircuitBreakerService implements OnModuleInit {
  private circuits = new Map<string, CircuitMetrics>();
  private configs = new Map<string, CircuitBreakerConfig>();
  private retryConfigs = new Map<string, RetryConfig>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: StructuredLoggerService,
  ) {}

  async onModuleInit() {
    this.initializeDefaultConfigs();
    this.startCleanupTask();
    this.logger.logWithMetadata('info', 'Circuit breaker service initialized', {
      circuitCount: this.configs.size,
      retryConfigCount: this.retryConfigs.size,
    }, 'CircuitBreakerService');
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private initializeDefaultConfigs() {
    // Circuit breaker configurations for different services
    const circuitConfigs: Array<[string, CircuitBreakerConfig]> = [
      // Solana RPC endpoints
      ['solana:rpc', {
        failureThreshold: 5,
        successThreshold: 3,
        timeout: 30000, // 30 seconds
        monitoringPeriod: 60000, // 1 minute
        enabled: true,
      }],

      // Database operations
      ['database:query', {
        failureThreshold: 10,
        successThreshold: 5,
        timeout: 15000, // 15 seconds
        monitoringPeriod: 30000, // 30 seconds
        enabled: true,
      }],

      // External API calls
      ['external:api', {
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 60000, // 1 minute
        monitoringPeriod: 120000, // 2 minutes
        enabled: true,
      }],

      // Payment processing
      ['payment:processing', {
        failureThreshold: 2,
        successThreshold: 1,
        timeout: 120000, // 2 minutes
        monitoringPeriod: 300000, // 5 minutes
        enabled: true,
      }],
    ];

    // Retry configurations for different operation types
    const retryConfigs: Array<[string, RetryConfig]> = [
      ['solana:transaction', {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        jitterEnabled: true,
        retryableErrors: [ErrorCategory.NETWORK, ErrorCategory.TIMEOUT, ErrorCategory.RATE_LIMIT],
      }],

      ['database:operation', {
        maxAttempts: 5,
        baseDelay: 500,
        maxDelay: 10000,
        backoffMultiplier: 1.5,
        jitterEnabled: true,
        retryableErrors: [ErrorCategory.NETWORK, ErrorCategory.TIMEOUT, ErrorCategory.DATABASE],
      }],

      ['external:api_call', {
        maxAttempts: 3,
        baseDelay: 2000,
        maxDelay: 60000,
        backoffMultiplier: 2.5,
        jitterEnabled: true,
        retryableErrors: [ErrorCategory.NETWORK, ErrorCategory.TIMEOUT, ErrorCategory.RATE_LIMIT],
      }],

      ['payment:transaction', {
        maxAttempts: 2,
        baseDelay: 5000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        jitterEnabled: false,
        retryableErrors: [ErrorCategory.NETWORK, ErrorCategory.TIMEOUT],
      }],
    ];

    circuitConfigs.forEach(([key, config]) => {
      this.configs.set(key, config);
    });

    retryConfigs.forEach(([key, config]) => {
      this.retryConfigs.set(key, config);
    });
  }

  /**
   * Execute operation with circuit breaker protection and retry logic
   */
  async executeWithProtection<T>(
    operationName: string,
    operation: () => Promise<T>,
    options?: {
      circuitKey?: string;
      retryKey?: string;
      context?: Record<string, any>;
    }
  ): Promise<T> {
    const circuitKey = options?.circuitKey || operationName;
    const retryKey = options?.retryKey || operationName;
    const context = options?.context || {};

    const circuit = this.getOrCreateCircuit(circuitKey);
    const retryConfig = this.retryConfigs.get(retryKey);

    // Check circuit state first
    if (this.shouldRejectCall(circuitKey)) {
      circuit.rejections++;
      const error = new CoriaError(
        ERROR_CLASSIFICATIONS.CIRCUIT_BREAKER_OPEN,
        {
          circuitKey,
          state: circuit.state,
          ...context
        }
      );

      this.logger.logSecurity('circuit_breaker_rejection', {
        severity: 'medium',
        category: 'service_role',
        details: {
          circuitKey,
          state: circuit.state,
          totalFailures: circuit.failureCount,
          lastFailureTime: circuit.lastFailureTime,
          ...context,
        }
      });

      throw error;
    }

    // Execute with retry logic if configured
    if (retryConfig) {
      return this.executeWithRetry(operation, retryConfig, circuitKey, context);
    } else {
      return this.executeSingle(operation, circuitKey, context);
    }
  }

  /**
   * Execute operation with exponential backoff retry
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryConfig: RetryConfig,
    circuitKey: string,
    context: Record<string, any>
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        const result = await this.executeSingle(operation, circuitKey, context);

        // Log successful retry if not first attempt
        if (attempt > 1) {
          this.logger.logWithMetadata('info', 'Operation succeeded after retry', {
            circuitKey,
            attempt,
            totalAttempts: retryConfig.maxAttempts,
            ...context,
          }, 'CircuitBreakerService');
        }

        return result;
      } catch (error) {
        lastError = error;

        // Check if error is retryable
        if (error instanceof CoriaError) {
          if (!this.isRetryableError(error, retryConfig)) {
            this.logger.logWithMetadata('warn', 'Non-retryable error encountered', {
              circuitKey,
              errorCategory: error.classification.category,
              errorCode: error.classification.code,
              attempt,
              ...context,
            }, 'CircuitBreakerService');
            throw error;
          }
        }

        // Don't retry on last attempt
        if (attempt === retryConfig.maxAttempts) {
          break;
        }

        // Calculate delay with jitter
        const delay = this.calculateRetryDelay(attempt - 1, retryConfig);

        this.logger.logWithMetadata('warn', 'Operation failed, retrying', {
          circuitKey,
          attempt,
          totalAttempts: retryConfig.maxAttempts,
          retryDelayMs: delay,
          error: error.message,
          ...context,
        }, 'CircuitBreakerService');

        await this.sleep(delay);
      }
    }

    // All retries exhausted
    this.logger.logWithMetadata('error', 'Operation failed after all retries', {
      circuitKey,
      totalAttempts: retryConfig.maxAttempts,
      finalError: lastError.message,
      ...context,
    }, 'CircuitBreakerService');

    throw lastError;
  }

  /**
   * Execute operation once and update circuit metrics
   */
  private async executeSingle<T>(
    operation: () => Promise<T>,
    circuitKey: string,
    context: Record<string, any>
  ): Promise<T> {
    const circuit = this.getOrCreateCircuit(circuitKey);
    const startTime = Date.now();

    try {
      circuit.totalCalls++;
      const result = await operation();

      // Operation succeeded
      this.recordSuccess(circuitKey);

      const duration = Date.now() - startTime;
      this.logger.logPerformance({
        operation: circuitKey,
        duration,
        success: true,
        metadata: {
          circuitState: circuit.state,
          ...context,
        }
      });

      return result;
    } catch (error) {
      // Operation failed
      this.recordFailure(circuitKey, error);

      const duration = Date.now() - startTime;
      this.logger.logPerformance({
        operation: circuitKey,
        duration,
        success: false,
        metadata: {
          circuitState: circuit.state,
          error: error.message,
          ...context,
        }
      });

      // Convert to CoriaError if not already
      if (!(error instanceof CoriaError)) {
        const classification = this.classifyError(error);
        throw new CoriaError(classification, context, error);
      }

      throw error;
    }
  }

  /**
   * Check if circuit should reject calls
   */
  private shouldRejectCall(circuitKey: string): boolean {
    const circuit = this.getOrCreateCircuit(circuitKey);
    const config = this.configs.get(circuitKey);

    if (!config || !config.enabled) {
      return false;
    }

    const now = Date.now();

    switch (circuit.state) {
      case CircuitState.OPEN:
        // Check if timeout period has passed
        if (circuit.lastFailureTime && (now - circuit.lastFailureTime) > config.timeout) {
          circuit.state = CircuitState.HALF_OPEN;
          this.logger.logWithMetadata('info', 'Circuit breaker moving to half-open', {
            circuitKey,
            timeoutPeriod: config.timeout,
          }, 'CircuitBreakerService');
          return false;
        }
        return true;

      case CircuitState.HALF_OPEN:
        // Allow limited calls in half-open state
        return false;

      case CircuitState.CLOSED:
      default:
        return false;
    }
  }

  /**
   * Record successful operation
   */
  private recordSuccess(circuitKey: string): void {
    const circuit = this.getOrCreateCircuit(circuitKey);
    const config = this.configs.get(circuitKey);

    if (!config) return;

    circuit.successCount++;
    circuit.lastSuccessTime = Date.now();

    // Check if we should close the circuit from half-open state
    if (circuit.state === CircuitState.HALF_OPEN &&
        circuit.successCount >= config.successThreshold) {
      circuit.state = CircuitState.CLOSED;
      circuit.failureCount = 0; // Reset failure count

      this.logger.logWithMetadata('info', 'Circuit breaker closed after successful operations', {
        circuitKey,
        successesRequired: config.successThreshold,
        totalSuccesses: circuit.successCount,
      }, 'CircuitBreakerService');
    }
  }

  /**
   * Record failed operation
   */
  private recordFailure(circuitKey: string, error: Error): void {
    const circuit = this.getOrCreateCircuit(circuitKey);
    const config = this.configs.get(circuitKey);

    if (!config) return;

    circuit.failureCount++;
    circuit.lastFailureTime = Date.now();

    // Check if we should open the circuit
    if (circuit.state === CircuitState.CLOSED &&
        circuit.failureCount >= config.failureThreshold) {
      circuit.state = CircuitState.OPEN;

      this.logger.logSecurity('circuit_breaker_opened', {
        severity: 'high',
        category: 'service_role',
        details: {
          circuitKey,
          failureThreshold: config.failureThreshold,
          totalFailures: circuit.failureCount,
          error: error.message,
          timeoutPeriod: config.timeout,
        }
      });
    } else if (circuit.state === CircuitState.HALF_OPEN) {
      // Failure in half-open state, go back to open
      circuit.state = CircuitState.OPEN;
      circuit.failureCount = 0; // Reset for next attempt

      this.logger.logWithMetadata('warn', 'Circuit breaker reopened due to failure in half-open state', {
        circuitKey,
        error: error.message,
      }, 'CircuitBreakerService');
    }
  }

  /**
   * Get or create circuit metrics
   */
  private getOrCreateCircuit(circuitKey: string): CircuitMetrics {
    let circuit = this.circuits.get(circuitKey);

    if (!circuit) {
      circuit = {
        totalCalls: 0,
        successCount: 0,
        failureCount: 0,
        state: CircuitState.CLOSED,
        timeouts: 0,
        rejections: 0,
      };
      this.circuits.set(circuitKey, circuit);
    }

    return circuit;
  }

  /**
   * Check if error is retryable based on configuration
   */
  private isRetryableError(error: CoriaError, retryConfig: RetryConfig): boolean {
    return retryConfig.retryableErrors.includes(error.classification.category);
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  private calculateRetryDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
    const cappedDelay = Math.min(exponentialDelay, config.maxDelay);

    if (config.jitterEnabled) {
      // Add random jitter of ±25%
      const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
      return Math.max(0, cappedDelay + jitter);
    }

    return cappedDelay;
  }

  /**
   * Classify unknown errors into CoriaError types
   */
  private classifyError(error: Error): typeof ERROR_CLASSIFICATIONS[keyof typeof ERROR_CLASSIFICATIONS] {
    const message = error.message.toLowerCase();

    // Network-related errors
    if (message.includes('network') || message.includes('connection') ||
        message.includes('timeout') || message.includes('dns')) {
      return ERROR_CLASSIFICATIONS.NETWORK_ERROR;
    }

    // Database-related errors
    if (message.includes('database') || message.includes('sql') ||
        message.includes('connection pool')) {
      return ERROR_CLASSIFICATIONS.DATABASE_CONNECTION_ERROR;
    }

    // Rate limiting
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return ERROR_CLASSIFICATIONS.RATE_LIMIT_EXCEEDED;
    }

    // Authentication/Authorization
    if (message.includes('unauthorized') || message.includes('forbidden') ||
        message.includes('authentication')) {
      return ERROR_CLASSIFICATIONS.AUTHENTICATION_FAILED;
    }

    // Default to system error
    return ERROR_CLASSIFICATIONS.SYSTEM_ERROR;
  }

  /**
   * Get circuit breaker statistics
   */
  getCircuitStats(circuitKey?: string): Record<string, CircuitMetrics> {
    if (circuitKey) {
      const circuit = this.circuits.get(circuitKey);
      return circuit ? { [circuitKey]: circuit } : {};
    }

    return Object.fromEntries(this.circuits.entries());
  }

  /**
   * Reset circuit breaker to closed state
   */
  resetCircuit(circuitKey: string): void {
    const circuit = this.getOrCreateCircuit(circuitKey);
    circuit.state = CircuitState.CLOSED;
    circuit.failureCount = 0;
    circuit.successCount = 0;
    circuit.lastFailureTime = undefined;
    circuit.lastSuccessTime = undefined;

    this.logger.logWithMetadata('info', 'Circuit breaker manually reset', {
      circuitKey,
      resetBy: 'admin',
    }, 'CircuitBreakerService');
  }

  /**
   * Update circuit breaker configuration
   */
  updateCircuitConfig(circuitKey: string, config: Partial<CircuitBreakerConfig>): void {
    const existingConfig = this.configs.get(circuitKey);
    if (existingConfig) {
      this.configs.set(circuitKey, { ...existingConfig, ...config });
    } else {
      this.configs.set(circuitKey, {
        failureThreshold: 5,
        successThreshold: 3,
        timeout: 30000,
        monitoringPeriod: 60000,
        enabled: true,
        ...config,
      });
    }

    this.logger.logWithMetadata('info', 'Circuit breaker configuration updated', {
      circuitKey,
      config,
    }, 'CircuitBreakerService');
  }

  /**
   * Update retry configuration
   */
  updateRetryConfig(retryKey: string, config: Partial<RetryConfig>): void {
    const existingConfig = this.retryConfigs.get(retryKey);
    if (existingConfig) {
      this.retryConfigs.set(retryKey, { ...existingConfig, ...config });
    } else {
      this.retryConfigs.set(retryKey, {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        jitterEnabled: true,
        retryableErrors: [ErrorCategory.NETWORK, ErrorCategory.TIMEOUT],
        ...config,
      });
    }

    this.logger.logWithMetadata('info', 'Retry configuration updated', {
      retryKey,
      config,
    }, 'CircuitBreakerService');
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup old circuit metrics
   */
  private startCleanupTask(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldMetrics();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private cleanupOldMetrics(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    let cleanedCount = 0;

    for (const [circuitKey, circuit] of this.circuits.entries()) {
      const config = this.configs.get(circuitKey);
      if (!config) continue;

      const lastActivity = Math.max(
        circuit.lastSuccessTime || 0,
        circuit.lastFailureTime || 0
      );

      // Only clean up circuits that are closed and haven't been active
      if (circuit.state === CircuitState.CLOSED &&
          lastActivity > 0 &&
          (now - lastActivity) > maxAge) {
        this.circuits.delete(circuitKey);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.logWithMetadata('debug', 'Cleaned up old circuit breaker metrics', {
        cleanedCount,
        remainingCircuits: this.circuits.size,
      }, 'CircuitBreakerService');
    }
  }
}