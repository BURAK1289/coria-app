/**
 * Custom error classes with proper TypeScript inheritance
 */

// ============================================================================
// BASE ERROR CLASSES
// ============================================================================

/**
 * Base application error class
 */
export abstract class AppError extends Error {
  public readonly name: string;
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON for logging/reporting
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
    };
  }

  /**
   * Get user-friendly error message
   */
  abstract getUserMessage(locale?: string): string;
}

// ============================================================================
// SPECIFIC ERROR CLASSES
// ============================================================================

/**
 * Validation error for user input
 */
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly validationRule?: string;

  constructor(
    message: string,
    field?: string,
    validationRule?: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', 400, true, {
      ...context,
      field,
      validationRule,
    });
    
    this.field = field;
    this.validationRule = validationRule;
  }

  getUserMessage(locale: string = 'tr'): string {
    const messages = {
      tr: this.field 
        ? `${this.field} alanı geçersiz: ${this.message}`
        : `Girilen bilgiler geçersiz: ${this.message}`,
      en: this.field
        ? `Invalid ${this.field}: ${this.message}`
        : `Invalid input: ${this.message}`,
      de: this.field
        ? `Ungültiges ${this.field}: ${this.message}`
        : `Ungültige Eingabe: ${this.message}`,
      fr: this.field
        ? `${this.field} invalide: ${this.message}`
        : `Entrée invalide: ${this.message}`,
    };

    return messages[locale as keyof typeof messages] || messages.en;
  }
}

/**
 * API communication error
 */
export class ApiError extends AppError {
  public readonly endpoint?: string;
  public readonly method?: string;
  public readonly responseData?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    endpoint?: string,
    method?: string,
    responseData?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, 'API_ERROR', statusCode, true, {
      ...context,
      endpoint,
      method,
      responseData,
    });
    
    this.endpoint = endpoint;
    this.method = method;
    this.responseData = responseData;
  }

  getUserMessage(locale: string = 'tr'): string {
    const messages = {
      tr: this.statusCode >= 500
        ? 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.'
        : 'İstek işlenirken bir hata oluştu.',
      en: this.statusCode >= 500
        ? 'Server error occurred. Please try again later.'
        : 'An error occurred while processing your request.',
      de: this.statusCode >= 500
        ? 'Serverfehler aufgetreten. Bitte versuchen Sie es später erneut.'
        : 'Beim Verarbeiten Ihrer Anfrage ist ein Fehler aufgetreten.',
      fr: this.statusCode >= 500
        ? 'Erreur serveur survenue. Veuillez réessayer plus tard.'
        : 'Une erreur s\'est produite lors du traitement de votre demande.',
    };

    return messages[locale as keyof typeof messages] || messages.en;
  }
}

/**
 * Network connectivity error
 */
export class NetworkError extends AppError {
  public readonly isOffline: boolean;
  public readonly retryAfter?: number;

  constructor(
    message: string,
    isOffline: boolean = false,
    retryAfter?: number,
    context?: Record<string, unknown>
  ) {
    super(message, 'NETWORK_ERROR', 0, true, {
      ...context,
      isOffline,
      retryAfter,
    });
    
    this.isOffline = isOffline;
    this.retryAfter = retryAfter;
  }

  getUserMessage(locale: string = 'tr'): string {
    const messages = {
      tr: this.isOffline
        ? 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.'
        : 'Ağ bağlantısı hatası. Lütfen tekrar deneyin.',
      en: this.isOffline
        ? 'Please check your internet connection and try again.'
        : 'Network connection error. Please try again.',
      de: this.isOffline
        ? 'Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.'
        : 'Netzwerkverbindungsfehler. Bitte versuchen Sie es erneut.',
      fr: this.isOffline
        ? 'Veuillez vérifier votre connexion Internet et réessayer.'
        : 'Erreur de connexion réseau. Veuillez réessayer.',
    };

    return messages[locale as keyof typeof messages] || messages.en;
  }
}

/**
 * Authentication/Authorization error
 */
export class AuthError extends AppError {
  public readonly authType: 'authentication' | 'authorization';
  public readonly requiredRole?: string;

  constructor(
    message: string,
    authType: 'authentication' | 'authorization',
    requiredRole?: string,
    context?: Record<string, unknown>
  ) {
    const statusCode = authType === 'authentication' ? 401 : 403;
    super(message, 'AUTH_ERROR', statusCode, true, {
      ...context,
      authType,
      requiredRole,
    });
    
    this.authType = authType;
    this.requiredRole = requiredRole;
  }

  getUserMessage(locale: string = 'tr'): string {
    const messages = {
      tr: this.authType === 'authentication'
        ? 'Oturum açmanız gerekiyor.'
        : 'Bu işlem için yetkiniz bulunmuyor.',
      en: this.authType === 'authentication'
        ? 'You need to sign in.'
        : 'You don\'t have permission for this action.',
      de: this.authType === 'authentication'
        ? 'Sie müssen sich anmelden.'
        : 'Sie haben keine Berechtigung für diese Aktion.',
      fr: this.authType === 'authentication'
        ? 'Vous devez vous connecter.'
        : 'Vous n\'avez pas la permission pour cette action.',
    };

    return messages[locale as keyof typeof messages] || messages.en;
  }
}

/**
 * Content/Resource not found error
 */
export class NotFoundError extends AppError {
  public readonly resourceType?: string;
  public readonly resourceId?: string;

  constructor(
    message: string,
    resourceType?: string,
    resourceId?: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'NOT_FOUND_ERROR', 404, true, {
      ...context,
      resourceType,
      resourceId,
    });
    
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  getUserMessage(locale: string = 'tr'): string {
    const messages = {
      tr: this.resourceType
        ? `${this.resourceType} bulunamadı.`
        : 'Aradığınız sayfa bulunamadı.',
      en: this.resourceType
        ? `${this.resourceType} not found.`
        : 'The page you are looking for was not found.',
      de: this.resourceType
        ? `${this.resourceType} nicht gefunden.`
        : 'Die gesuchte Seite wurde nicht gefunden.',
      fr: this.resourceType
        ? `${this.resourceType} introuvable.`
        : 'La page que vous recherchez est introuvable.',
    };

    return messages[locale as keyof typeof messages] || messages.en;
  }
}

/**
 * Rate limiting error
 */
export class RateLimitError extends AppError {
  public readonly limit: number;
  public readonly resetTime: Date;

  constructor(
    message: string,
    limit: number,
    resetTime: Date,
    context?: Record<string, unknown>
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429, true, {
      ...context,
      limit,
      resetTime: resetTime.toISOString(),
    });
    
    this.limit = limit;
    this.resetTime = resetTime;
  }

  getUserMessage(locale: string = 'tr'): string {
    const messages = {
      tr: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.',
      en: 'Too many requests. Please wait a moment.',
      de: 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
      fr: 'Trop de demandes. Veuillez attendre un moment.',
    };

    return messages[locale as keyof typeof messages] || messages.en;
  }
}

/**
 * Configuration or setup error
 */
export class ConfigurationError extends AppError {
  public readonly configKey?: string;
  public readonly expectedValue?: unknown;
  public readonly actualValue?: unknown;

  constructor(
    message: string,
    configKey?: string,
    expectedValue?: unknown,
    actualValue?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, 'CONFIGURATION_ERROR', 500, false, {
      ...context,
      configKey,
      expectedValue,
      actualValue,
    });
    
    this.configKey = configKey;
    this.expectedValue = expectedValue;
    this.actualValue = actualValue;
  }

  getUserMessage(locale: string = 'tr'): string {
    const messages = {
      tr: 'Sistem yapılandırma hatası. Lütfen yöneticiye başvurun.',
      en: 'System configuration error. Please contact administrator.',
      de: 'Systemkonfigurationsfehler. Bitte wenden Sie sich an den Administrator.',
      fr: 'Erreur de configuration système. Veuillez contacter l\'administrateur.',
    };

    return messages[locale as keyof typeof messages] || messages.en;
  }
}

// ============================================================================
// ERROR TYPE GUARDS
// ============================================================================

/**
 * Check if error is an instance of AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Check if error is operational (expected) vs programming error
 */
export function isOperationalError(error: unknown): boolean {
  return isAppError(error) && error.isOperational;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Check if error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Check if error is an auth error
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

/**
 * Check if error is a configuration error
 */
export function isConfigurationError(error: unknown): error is ConfigurationError {
  return error instanceof ConfigurationError;
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Convert unknown error to AppError
 */
export function normalizeError(error: unknown, context?: Record<string, unknown>): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(
      error.message,
      500,
      undefined,
      undefined,
      undefined,
      { ...context, originalError: error.name }
    );
  }

  if (typeof error === 'string') {
    return new ApiError(error, 500, undefined, undefined, undefined, context);
  }

  return new ApiError(
    'An unknown error occurred',
    500,
    undefined,
    undefined,
    error,
    context
  );
}

/**
 * Extract error message with fallback
 */
export function getErrorMessage(error: unknown, fallback: string = 'An error occurred'): string {
  if (isAppError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallback;
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: unknown, locale: string = 'tr'): string {
  if (isAppError(error)) {
    return error.getUserMessage(locale);
  }

  const fallbackMessages = {
    tr: 'Beklenmeyen bir hata oluştu.',
    en: 'An unexpected error occurred.',
    de: 'Ein unerwarteter Fehler ist aufgetreten.',
    fr: 'Une erreur inattendue s\'est produite.',
  };

  return fallbackMessages[locale as keyof typeof fallbackMessages] || fallbackMessages.en;
}

/**
 * Create error context for logging
 */
export function createErrorContext(
  component?: string,
  action?: string,
  userId?: string,
  additionalContext?: Record<string, unknown>
): Record<string, unknown> {
  return {
    component,
    action,
    userId,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    ...additionalContext,
  };
}