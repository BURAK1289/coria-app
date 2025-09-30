/**
 * Comprehensive error handling utilities with proper TypeScript patterns
 */

import { 
  AppError, 
  ApiError, 
  NetworkError, 
  ValidationError, 
  AuthError, 
  NotFoundError,
  RateLimitError,
  normalizeError,
  isAppError,
  isOperationalError,
  createErrorContext
} from './errors';
import { logger, logError } from './logging';

// ============================================================================
// ERROR HANDLER TYPES
// ============================================================================

export interface ErrorHandlerOptions {
  component?: string;
  action?: string;
  userId?: string;
  fallbackValue?: unknown;
  shouldRethrow?: boolean;
  shouldReport?: boolean;
  context?: Record<string, unknown>;
}

export interface AsyncErrorHandlerOptions extends ErrorHandlerOptions {
  retries?: number;
  retryDelay?: number;
  retryCondition?: (error: AppError, attempt: number) => boolean;
}

export type ErrorHandler<T = unknown> = (error: AppError) => T;
export type AsyncErrorHandler<T = unknown> = (error: AppError) => Promise<T>;

// ============================================================================
// SYNCHRONOUS ERROR HANDLING
// ============================================================================

/**
 * Safe execution wrapper for synchronous operations
 */
export function safeExecute<T>(
  operation: () => T,
  options: ErrorHandlerOptions = {}
): { data?: T; error?: AppError } {
  const {
    component,
    action,
    userId,
    fallbackValue,
    shouldRethrow = false,
    shouldReport = true,
    context = {},
  } = options;

  try {
    const data = operation();
    return { data };
  } catch (error) {
    const normalizedError = normalizeError(error, createErrorContext(
      component,
      action,
      userId,
      context
    ));

    // Report error if enabled
    if (shouldReport) {
      logError(normalizedError, {
        component,
        action,
        userId,
        ...context,
      });
    }

    // Re-throw if requested
    if (shouldRethrow) {
      throw normalizedError;
    }

    return { 
      data: fallbackValue as T, 
      error: normalizedError 
    };
  }
}

/**
 * Try-catch wrapper with typed error handling
 */
export function tryCatch<T>(
  operation: () => T,
  errorHandler?: ErrorHandler<T>,
  options: ErrorHandlerOptions = {}
): T {
  const result = safeExecute(operation, { ...options, shouldRethrow: !errorHandler });
  
  if (result.error && errorHandler) {
    return errorHandler(result.error);
  }
  
  if (result.error && !errorHandler) {
    throw result.error;
  }
  
  return result.data!;
}

// ============================================================================
// ASYNCHRONOUS ERROR HANDLING
// ============================================================================

/**
 * Safe async execution wrapper with retry logic
 */
export async function safeAsyncExecute<T>(
  operation: () => Promise<T>,
  options: AsyncErrorHandlerOptions = {}
): Promise<{ data?: T; error?: AppError }> {
  const {
    component,
    action,
    userId,
    fallbackValue,
    shouldRethrow = false,
    shouldReport = true,
    context = {},
    retries = 0,
    retryDelay = 1000,
    retryCondition = (error) => isOperationalError(error) && !(error instanceof ValidationError),
  } = options;

  let lastError: AppError | undefined;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const data = await operation();
      
      // Log successful retry if this wasn't the first attempt
      if (attempt > 0) {
        logger.info(`Operation succeeded after ${attempt} retries`, {
          component,
          action,
          userId,
          attempt,
          ...context,
        });
      }
      
      return { data };
    } catch (error) {
      const normalizedError = normalizeError(error, createErrorContext(
        component,
        action,
        userId,
        { ...context, attempt }
      ));

      lastError = normalizedError;

      // Check if we should retry
      if (attempt < retries && retryCondition(normalizedError, attempt)) {
        attempt++;
        
        logger.warn(`Operation failed, retrying (${attempt}/${retries})`, {
          component,
          action,
          userId,
          attempt,
          error: normalizedError.message,
          ...context,
        });

        // Exponential backoff with jitter
        const delay = retryDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        continue;
      }

      // No more retries or retry condition not met
      break;
    }
  }

  // Report final error if enabled
  if (shouldReport && lastError) {
    logError(lastError, {
      component,
      action,
      userId,
      totalAttempts: attempt + 1,
      ...context,
    });
  }

  // Re-throw if requested
  if (shouldRethrow) {
    throw lastError;
  }

  return { 
    data: fallbackValue as T, 
    error: lastError 
  };
}

/**
 * Async try-catch wrapper with typed error handling
 */
export async function asyncTryCatch<T>(
  operation: () => Promise<T>,
  errorHandler?: AsyncErrorHandler<T>,
  options: AsyncErrorHandlerOptions = {}
): Promise<T> {
  const result = await safeAsyncExecute(operation, { 
    ...options, 
    shouldRethrow: !errorHandler 
  });
  
  if (result.error && errorHandler) {
    return await errorHandler(result.error);
  }
  
  if (result.error && !errorHandler) {
    throw result.error;
  }
  
  return result.data!;
}

// ============================================================================
// SPECIALIZED ERROR HANDLERS
// ============================================================================

/**
 * API call error handler with specific error type handling
 */
export async function handleApiCall<T>(
  apiCall: () => Promise<T>,
  options: AsyncErrorHandlerOptions = {}
): Promise<{ data?: T; error?: AppError }> {
  return safeAsyncExecute(apiCall, {
    ...options,
    retries: options.retries ?? 3,
    retryCondition: (error, attempt) => {
      // Retry on network errors and 5xx server errors
      if (error instanceof NetworkError) return true;
      if (error instanceof ApiError && error.statusCode >= 500) return true;
      
      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.statusCode < 500) return false;
      if (error instanceof ValidationError) return false;
      if (error instanceof AuthError) return false;
      if (error instanceof NotFoundError) return false;
      if (error instanceof RateLimitError) return false;
      
      return isOperationalError(error);
    },
  });
}

/**
 * Form submission error handler
 */
export async function handleFormSubmission<T>(
  submitFn: () => Promise<T>,
  options: AsyncErrorHandlerOptions = {}
): Promise<{ data?: T; error?: AppError; fieldErrors?: Record<string, string> }> {
  const result = await safeAsyncExecute(submitFn, {
    ...options,
    retries: 0, // Don't retry form submissions
  });

  // Extract field errors from validation errors
  let fieldErrors: Record<string, string> | undefined;
  if (result.error instanceof ValidationError && result.error.field) {
    fieldErrors = {
      [result.error.field]: result.error.message,
    };
  }

  return {
    data: result.data,
    error: result.error,
    fieldErrors,
  };
}

/**
 * File upload error handler
 */
export async function handleFileUpload<T>(
  uploadFn: () => Promise<T>,
  options: AsyncErrorHandlerOptions = {}
): Promise<{ data?: T; error?: AppError }> {
  return safeAsyncExecute(uploadFn, {
    ...options,
    retries: options.retries ?? 2,
    retryDelay: 2000,
    retryCondition: (error) => {
      // Retry on network errors but not on validation errors
      return error instanceof NetworkError || 
             (error instanceof ApiError && error.statusCode >= 500);
    },
  });
}

/**
 * Data fetching error handler with caching fallback
 */
export async function handleDataFetch<T>(
  fetchFn: () => Promise<T>,
  cacheKey?: string,
  options: AsyncErrorHandlerOptions = {}
): Promise<{ data?: T; error?: AppError; fromCache?: boolean }> {
  // Try to get cached data first if available
  let cachedData: T | undefined;
  if (cacheKey && typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(`cache_${cacheKey}`);
      if (cached) {
        cachedData = JSON.parse(cached);
      }
    } catch {
      // Ignore cache errors
    }
  }

  const result = await safeAsyncExecute(fetchFn, {
    ...options,
    fallbackValue: cachedData,
    retries: options.retries ?? 2,
  });

  // Cache successful results
  if (result.data && cacheKey && typeof window !== 'undefined') {
    try {
      localStorage.setItem(`cache_${cacheKey}`, JSON.stringify(result.data));
    } catch {
      // Ignore cache storage errors
    }
  }

  return {
    data: result.data,
    error: result.error,
    fromCache: !result.data ? !!cachedData : false,
  };
}

// ============================================================================
// ERROR BOUNDARY HELPERS
// ============================================================================

/**
 * Create error handler for React components
 */
export function createComponentErrorHandler(
  componentName: string,
  fallbackComponent?: React.ComponentType<{ error: AppError }>
) {
  return (error: AppError): React.ReactElement => {
    logError(error, {
      component: componentName,
      action: 'render',
    });

    if (fallbackComponent) {
      return React.createElement(fallbackComponent, { error });
    }

    return React.createElement('div', {
      className: 'error-fallback p-4 text-center text-red-600',
    }, `Error in ${componentName}: ${error.message}`);
  };
}

/**
 * Higher-order function for wrapping component methods with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  componentName: string,
  methodName: string
): T {
  return ((...args: Parameters<T>) => {
    return tryCatch(
      () => fn(...args),
      (error) => {
        logError(error, {
          component: componentName,
          action: methodName,
        });
        
        // Return undefined for failed operations
        return undefined;
      }
    );
  }) as T;
}

/**
 * Higher-order function for wrapping async component methods
 */
export function withAsyncErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  componentName: string,
  methodName: string
): T {
  return (async (...args: Parameters<T>) => {
    return asyncTryCatch(
      () => fn(...args),
      async (error) => {
        logError(error, {
          component: componentName,
          action: methodName,
        });
        
        // Return undefined for failed operations
        return undefined;
      }
    );
  }) as T;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a debounced error handler to prevent spam
 */
export function createDebouncedErrorHandler(
  handler: (error: AppError) => void,
  delay: number = 1000
): (error: AppError) => void {
  const errorCounts = new Map<string, number>();
  const timeouts = new Map<string, NodeJS.Timeout>();

  return (error: AppError) => {
    const errorKey = `${error.code}_${error.message}`;
    const currentCount = errorCounts.get(errorKey) || 0;
    
    errorCounts.set(errorKey, currentCount + 1);

    // Clear existing timeout
    const existingTimeout = timeouts.get(errorKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      const count = errorCounts.get(errorKey) || 1;
      
      // Call handler with count information
      const errorWithCount = {
        ...error,
        context: {
          ...error.context,
          occurrenceCount: count,
        },
      };
      
      // Call handler with error object (use any to bypass type checking)
      handler(errorWithCount as any);

      // Clean up
      errorCounts.delete(errorKey);
      timeouts.delete(errorKey);
    }, delay);

    timeouts.set(errorKey, timeout);
  };
}

/**
 * Global unhandled error handler setup
 */
export function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = normalizeError(event.reason, {
      source: 'unhandledrejection',
      promise: event.promise,
    });

    logError(error, {
      component: 'global',
      action: 'unhandledrejection',
    });

    // Prevent default browser behavior
    event.preventDefault();
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    const error = normalizeError(event.error || event.message, {
      source: 'uncaughterror',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });

    logError(error, {
      component: 'global',
      action: 'uncaughterror',
    });
  });
}

// Import React for JSX
import React from 'react';