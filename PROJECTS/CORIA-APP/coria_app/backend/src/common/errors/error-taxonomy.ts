/**
 * CORIA Error Taxonomy and Classification System
 *
 * Provides structured error handling with:
 * - Consistent error classification
 * - Automatic retry strategy determination
 * - User-friendly error messages
 * - Monitoring and alerting integration
 */

export enum ErrorCategory {
  // Client-side errors (4xx range)
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',

  // Server-side errors (5xx range)
  INTERNAL_SERVER = 'INTERNAL_SERVER',
  DATABASE = 'DATABASE',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  BLOCKCHAIN = 'BLOCKCHAIN',
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  CONFIGURATION = 'CONFIGURATION',

  // Security-related errors
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  RLS_BYPASS_ATTEMPT = 'RLS_BYPASS_ATTEMPT',
  SERVICE_ROLE_MISUSE = 'SERVICE_ROLE_MISUSE',

  // Business logic errors
  BUSINESS_RULE = 'BUSINESS_RULE',
  WALLET_ERROR = 'WALLET_ERROR',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  PREMIUM_ERROR = 'PREMIUM_ERROR',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum RetryStrategy {
  NO_RETRY = 'NO_RETRY',
  IMMEDIATE_RETRY = 'IMMEDIATE_RETRY',
  EXPONENTIAL_BACKOFF = 'EXPONENTIAL_BACKOFF',
  LINEAR_BACKOFF = 'LINEAR_BACKOFF',
  CIRCUIT_BREAKER = 'CIRCUIT_BREAKER',
}

export interface ErrorClassification {
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  retryStrategy: RetryStrategy;
  userMessage: string;
  technicalMessage: string;
  httpStatusCode: number;
  alerting: boolean;
  logLevel: 'error' | 'warn' | 'info';
  requiresInvestigation: boolean;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface ErrorContext {
  userId?: string;
  correlationId?: string;
  operation?: string;
  service?: string;
  endpoint?: string;
  method?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  metadata?: Record<string, any>;
  // Circuit breaker context
  circuitKey?: string;
  retryKey?: string;
  state?: string;
  // Transaction context
  fromAddress?: string;
  toAddress?: string;
  amount?: number;
  signature?: string;
  originalError?: string;
  available?: number;
  // Multi-signature context
  required?: number;
  signatureCount?: number;
  // Additional blockchain context
  blockNumber?: number;
  timestamp?: number;
}

export class CoriaError extends Error {
  public readonly classification: ErrorClassification;
  public readonly context: ErrorContext;
  public readonly timestamp: Date;
  public readonly errorId: string;
  public readonly originalError?: Error;

  constructor(
    classification: ErrorClassification,
    context: ErrorContext = {},
    originalError?: Error
  ) {
    super(classification.technicalMessage);

    this.name = 'CoriaError';
    this.classification = classification;
    this.context = context;
    this.timestamp = new Date();
    this.errorId = this.generateErrorId();
    this.originalError = originalError;

    // Preserve stack trace
    if (originalError?.stack) {
      this.stack = originalError.stack;
    } else if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CoriaError);
    }
  }

  private generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  public toJSON() {
    return {
      errorId: this.errorId,
      category: this.classification.category,
      severity: this.classification.severity,
      userMessage: this.classification.userMessage,
      technicalMessage: this.classification.technicalMessage,
      httpStatusCode: this.classification.httpStatusCode,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
    };
  }

  public getUserMessage(): string {
    return this.classification.userMessage;
  }

  public shouldRetry(): boolean {
    return this.classification.retryStrategy !== RetryStrategy.NO_RETRY;
  }

  public requiresAlerting(): boolean {
    return this.classification.alerting;
  }
}

// Pre-defined error classifications
export const ERROR_CLASSIFICATIONS: Record<string, ErrorClassification> = {
  // Validation Errors
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryStrategy: RetryStrategy.NO_RETRY,
    userMessage: 'The provided input is invalid. Please check your data and try again.',
    technicalMessage: 'Input validation failed',
    httpStatusCode: 400,
    alerting: false,
    logLevel: 'warn',
    requiresInvestigation: false,
  },

  MISSING_REQUIRED_FIELD: {
    code: 'MISSING_REQUIRED_FIELD',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryStrategy: RetryStrategy.NO_RETRY,
    userMessage: 'Required information is missing. Please provide all required fields.',
    technicalMessage: 'Required field validation failed',
    httpStatusCode: 400,
    alerting: false,
    logLevel: 'warn',
    requiresInvestigation: false,
  },

  // Authentication Errors
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    retryStrategy: RetryStrategy.NO_RETRY,
    userMessage: 'Invalid credentials. Please check your email and password.',
    technicalMessage: 'Authentication failed - invalid credentials',
    httpStatusCode: 401,
    alerting: false,
    logLevel: 'warn',
    requiresInvestigation: false,
  },

  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.LOW,
    retryStrategy: RetryStrategy.NO_RETRY,
    userMessage: 'Your session has expired. Please log in again.',
    technicalMessage: 'JWT token has expired',
    httpStatusCode: 401,
    alerting: false,
    logLevel: 'info',
    requiresInvestigation: false,
  },

  // Authorization Errors
  INSUFFICIENT_PERMISSIONS: {
    code: 'INSUFFICIENT_PERMISSIONS',
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.MEDIUM,
    retryStrategy: RetryStrategy.NO_RETRY,
    userMessage: 'You do not have permission to perform this action.',
    technicalMessage: 'Insufficient permissions for requested operation',
    httpStatusCode: 403,
    alerting: true,
    logLevel: 'warn',
    requiresInvestigation: true,
  },

  PREMIUM_REQUIRED: {
    code: 'PREMIUM_REQUIRED',
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.LOW,
    retryStrategy: RetryStrategy.NO_RETRY,
    userMessage: 'This feature requires a premium subscription. Please upgrade your account.',
    technicalMessage: 'Premium subscription required for this operation',
    httpStatusCode: 403,
    alerting: false,
    logLevel: 'info',
    requiresInvestigation: false,
  },

  // Rate Limiting Errors
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    category: ErrorCategory.RATE_LIMIT,
    severity: ErrorSeverity.MEDIUM,
    retryStrategy: RetryStrategy.LINEAR_BACKOFF,
    userMessage: 'You have exceeded the rate limit. Please wait before trying again.',
    technicalMessage: 'Rate limit exceeded for operation',
    httpStatusCode: 429,
    alerting: false,
    logLevel: 'warn',
    requiresInvestigation: false,
    maxRetries: 3,
    retryDelayMs: 60000,
  },

  // Resource Errors
  RESOURCE_NOT_FOUND: {
    code: 'RESOURCE_NOT_FOUND',
    category: ErrorCategory.NOT_FOUND,
    severity: ErrorSeverity.LOW,
    retryStrategy: RetryStrategy.NO_RETRY,
    userMessage: 'The requested resource was not found.',
    technicalMessage: 'Resource not found',
    httpStatusCode: 404,
    alerting: false,
    logLevel: 'warn',
    requiresInvestigation: false,
  },

  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    category: ErrorCategory.NOT_FOUND,
    severity: ErrorSeverity.MEDIUM,
    retryStrategy: RetryStrategy.NO_RETRY,
    userMessage: 'User account not found.',
    technicalMessage: 'User not found in database',
    httpStatusCode: 404,
    alerting: true,
    logLevel: 'warn',
    requiresInvestigation: true,
  },

  WALLET_NOT_FOUND: {
    code: 'WALLET_NOT_FOUND',
    category: ErrorCategory.WALLET_ERROR,
    severity: ErrorSeverity.HIGH,
    retryStrategy: RetryStrategy.NO_RETRY,
    userMessage: 'Wallet not found. Please contact support.',
    technicalMessage: 'Wallet not found in database',
    httpStatusCode: 404,
    alerting: true,
    logLevel: 'error',
    requiresInvestigation: true,
  },

  // Database Errors
  DATABASE_CONNECTION_ERROR: {
    code: 'DATABASE_CONNECTION_ERROR',
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.CRITICAL,
    retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
    userMessage: 'We are experiencing technical difficulties. Please try again later.',
    technicalMessage: 'Database connection failed',
    httpStatusCode: 503,
    alerting: true,
    logLevel: 'error',
    requiresInvestigation: true,
    maxRetries: 3,
    retryDelayMs: 1000,
  },

  DATABASE_TIMEOUT: {
    code: 'DATABASE_TIMEOUT',
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
    userMessage: 'The operation is taking longer than expected. Please try again.',
    technicalMessage: 'Database operation timed out',
    httpStatusCode: 504,
    alerting: true,
    logLevel: 'error',
    requiresInvestigation: true,
    maxRetries: 2,
    retryDelayMs: 2000,
  },

  // Blockchain Errors
  SOLANA_RPC_ERROR: {
    code: 'SOLANA_RPC_ERROR',
    category: ErrorCategory.BLOCKCHAIN,
    severity: ErrorSeverity.HIGH,
    retryStrategy: RetryStrategy.CIRCUIT_BREAKER,
    userMessage: 'Blockchain network is temporarily unavailable. Please try again.',
    technicalMessage: 'Solana RPC endpoint error',
    httpStatusCode: 503,
    alerting: true,
    logLevel: 'error',
    requiresInvestigation: true,
    maxRetries: 5,
    retryDelayMs: 5000,
  },

  TRANSACTION_FAILED: {
    code: 'TRANSACTION_FAILED',
    category: ErrorCategory.BLOCKCHAIN,
    severity: ErrorSeverity.HIGH,
    retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
    userMessage: 'Transaction failed. Please check your wallet balance and try again.',
    technicalMessage: 'Blockchain transaction failed',
    httpStatusCode: 400,
    alerting: true,
    logLevel: 'error',
    requiresInvestigation: true,
    maxRetries: 3,
    retryDelayMs: 10000,
  },

  INSUFFICIENT_SOL_BALANCE: {
    code: 'INSUFFICIENT_SOL_BALANCE',
    category: ErrorCategory.INSUFFICIENT_FUNDS,
    severity: ErrorSeverity.MEDIUM,
    retryStrategy: RetryStrategy.NO_RETRY,
    userMessage: 'Insufficient SOL balance for this transaction. Please add funds to your wallet.',
    technicalMessage: 'Insufficient SOL balance for transaction fees',
    httpStatusCode: 400,
    alerting: false,
    logLevel: 'warn',
    requiresInvestigation: false,
  },

  // Payment Errors
  PAYMENT_PROCESSING_ERROR: {
    code: 'PAYMENT_PROCESSING_ERROR',
    category: ErrorCategory.PAYMENT_ERROR,
    severity: ErrorSeverity.HIGH,
    retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
    userMessage: 'Payment processing failed. Please try again or contact support.',
    technicalMessage: 'Payment processing error',
    httpStatusCode: 400,
    alerting: true,
    logLevel: 'error',
    requiresInvestigation: true,
    maxRetries: 2,
    retryDelayMs: 5000,
  },

  PAYMENT_ALREADY_PROCESSED: {
    code: 'PAYMENT_ALREADY_PROCESSED',
    category: ErrorCategory.PAYMENT_ERROR,
    severity: ErrorSeverity.MEDIUM,
    retryStrategy: RetryStrategy.NO_RETRY,
    userMessage: 'This payment has already been processed.',
    technicalMessage: 'Duplicate payment attempt detected',
    httpStatusCode: 409,
    alerting: true,
    logLevel: 'warn',
    requiresInvestigation: true,
  },

  // Security Errors
  SECURITY_VIOLATION: {
    code: 'SECURITY_VIOLATION',
    category: ErrorCategory.SECURITY_VIOLATION,
    severity: ErrorSeverity.CRITICAL,
    retryStrategy: RetryStrategy.NO_RETRY,
    userMessage: 'Security violation detected. Access denied.',
    technicalMessage: 'Security policy violation',
    httpStatusCode: 403,
    alerting: true,
    logLevel: 'error',
    requiresInvestigation: true,
  },

  RLS_BYPASS_ATTEMPT: {
    code: 'RLS_BYPASS_ATTEMPT',
    category: ErrorCategory.RLS_BYPASS_ATTEMPT,
    severity: ErrorSeverity.CRITICAL,
    retryStrategy: RetryStrategy.NO_RETRY,
    userMessage: 'Access denied due to security policy violation.',
    technicalMessage: 'Row Level Security bypass attempt detected',
    httpStatusCode: 403,
    alerting: true,
    logLevel: 'error',
    requiresInvestigation: true,
  },

  SERVICE_ROLE_MISUSE: {
    code: 'SERVICE_ROLE_MISUSE',
    category: ErrorCategory.SERVICE_ROLE_MISUSE,
    severity: ErrorSeverity.CRITICAL,
    retryStrategy: RetryStrategy.NO_RETRY,
    userMessage: 'Unauthorized operation detected.',
    technicalMessage: 'Service role misuse detected',
    httpStatusCode: 403,
    alerting: true,
    logLevel: 'error',
    requiresInvestigation: true,
  },

  // External Service Errors
  EXTERNAL_API_ERROR: {
    code: 'EXTERNAL_API_ERROR',
    category: ErrorCategory.EXTERNAL_SERVICE,
    severity: ErrorSeverity.HIGH,
    retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
    userMessage: 'External service is temporarily unavailable. Please try again later.',
    technicalMessage: 'External API request failed',
    httpStatusCode: 503,
    alerting: true,
    logLevel: 'error',
    requiresInvestigation: true,
    maxRetries: 3,
    retryDelayMs: 2000,
  },

  EXTERNAL_API_TIMEOUT: {
    code: 'EXTERNAL_API_TIMEOUT',
    category: ErrorCategory.TIMEOUT,
    severity: ErrorSeverity.HIGH,
    retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
    userMessage: 'The service is taking longer than expected. Please try again.',
    technicalMessage: 'External API request timed out',
    httpStatusCode: 504,
    alerting: true,
    logLevel: 'error',
    requiresInvestigation: true,
    maxRetries: 2,
    retryDelayMs: 5000,
  },

  // Configuration Errors
  CONFIGURATION_ERROR: {
    code: 'CONFIGURATION_ERROR',
    category: ErrorCategory.CONFIGURATION,
    severity: ErrorSeverity.CRITICAL,
    retryStrategy: RetryStrategy.NO_RETRY,
    userMessage: 'Service configuration error. Please contact support.',
    technicalMessage: 'Application configuration error',
    httpStatusCode: 500,
    alerting: true,
    logLevel: 'error',
    requiresInvestigation: true,
  },

  // Generic Server Errors
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    category: ErrorCategory.INTERNAL_SERVER,
    severity: ErrorSeverity.CRITICAL,
    retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
    userMessage: 'An unexpected error occurred. Please try again later.',
    technicalMessage: 'Internal server error',
    httpStatusCode: 500,
    alerting: true,
    logLevel: 'error',
    requiresInvestigation: true,
    maxRetries: 1,
    retryDelayMs: 5000,
  },
};

// Error factory functions for common use cases
export const ErrorFactory = {
  // Validation errors
  invalidInput(details: string, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.INVALID_INPUT,
      technicalMessage: `Input validation failed: ${details}`,
    };
    return new CoriaError(classification, context);
  },

  missingField(fieldName: string, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.MISSING_REQUIRED_FIELD,
      technicalMessage: `Missing required field: ${fieldName}`,
      userMessage: `Please provide the required field: ${fieldName}`,
    };
    return new CoriaError(classification, context);
  },

  // Authentication errors
  invalidCredentials(context?: ErrorContext): CoriaError {
    return new CoriaError(ERROR_CLASSIFICATIONS.INVALID_CREDENTIALS, context);
  },

  tokenExpired(context?: ErrorContext): CoriaError {
    return new CoriaError(ERROR_CLASSIFICATIONS.TOKEN_EXPIRED, context);
  },

  // Authorization errors
  insufficientPermissions(operation: string, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.INSUFFICIENT_PERMISSIONS,
      technicalMessage: `Insufficient permissions for operation: ${operation}`,
    };
    return new CoriaError(classification, context);
  },

  premiumRequired(feature: string, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.PREMIUM_REQUIRED,
      technicalMessage: `Premium subscription required for feature: ${feature}`,
      userMessage: `This feature (${feature}) requires a premium subscription. Please upgrade your account.`,
    };
    return new CoriaError(classification, context);
  },

  // Rate limiting errors
  rateLimitExceeded(operation: string, retryAfter: number, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.RATE_LIMIT_EXCEEDED,
      technicalMessage: `Rate limit exceeded for operation: ${operation}`,
      userMessage: `You have exceeded the rate limit for ${operation}. Please wait ${retryAfter} seconds before trying again.`,
      retryDelayMs: retryAfter * 1000,
    };
    return new CoriaError(classification, context);
  },

  // Resource errors
  resourceNotFound(resourceType: string, resourceId: string, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.RESOURCE_NOT_FOUND,
      technicalMessage: `${resourceType} not found: ${resourceId}`,
    };
    return new CoriaError(classification, context);
  },

  userNotFound(userId: string, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.USER_NOT_FOUND,
      technicalMessage: `User not found: ${userId}`,
    };
    return new CoriaError(classification, context);
  },

  walletNotFound(walletId: string, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.WALLET_NOT_FOUND,
      technicalMessage: `Wallet not found: ${walletId}`,
    };
    return new CoriaError(classification, context);
  },

  // Database errors
  databaseError(operation: string, originalError: Error, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.DATABASE_CONNECTION_ERROR,
      technicalMessage: `Database error during ${operation}: ${originalError.message}`,
    };
    return new CoriaError(classification, context, originalError);
  },

  // Blockchain errors
  solanaRpcError(endpoint: string, originalError: Error, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.SOLANA_RPC_ERROR,
      technicalMessage: `Solana RPC error on ${endpoint}: ${originalError.message}`,
    };
    return new CoriaError(classification, context, originalError);
  },

  transactionFailed(txSignature: string, reason: string, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.TRANSACTION_FAILED,
      technicalMessage: `Transaction failed ${txSignature}: ${reason}`,
    };
    return new CoriaError(classification, context);
  },

  insufficientFunds(required: number, available: number, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.INSUFFICIENT_SOL_BALANCE,
      technicalMessage: `Insufficient funds: required ${required}, available ${available}`,
      userMessage: `Insufficient SOL balance. Required: ${required} SOL, Available: ${available} SOL`,
    };
    return new CoriaError(classification, context);
  },

  // Security errors
  securityViolation(violation: string, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.SECURITY_VIOLATION,
      technicalMessage: `Security violation: ${violation}`,
    };
    return new CoriaError(classification, context);
  },

  rlsBypassAttempt(table: string, userId: string, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.RLS_BYPASS_ATTEMPT,
      technicalMessage: `RLS bypass attempt detected for table ${table} by user ${userId}`,
    };
    return new CoriaError(classification, context);
  },

  serviceRoleMisuse(operation: string, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.SERVICE_ROLE_MISUSE,
      technicalMessage: `Service role misuse in operation: ${operation}`,
    };
    return new CoriaError(classification, context);
  },

  // External service errors
  externalApiError(service: string, originalError: Error, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.EXTERNAL_API_ERROR,
      technicalMessage: `External API error from ${service}: ${originalError.message}`,
    };
    return new CoriaError(classification, context, originalError);
  },

  // Generic errors
  internalServerError(message: string, originalError?: Error, context?: ErrorContext): CoriaError {
    const classification = {
      ...ERROR_CLASSIFICATIONS.INTERNAL_SERVER_ERROR,
      technicalMessage: message,
    };
    return new CoriaError(classification, context, originalError);
  },
};