'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/icons/Icon';
import {
  AppError,
  isAppError,
  isOperationalError,
  getUserErrorMessage,
  createErrorContext,
  normalizeError
} from '@/lib/errors';
import { logger } from '@/lib/logger';

// ============================================================================
// ERROR BOUNDARY TYPES
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | AppError;
  errorId?: string;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error | AppError, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  isolate?: boolean; // Whether to isolate this boundary from parent boundaries
  level?: 'page' | 'section' | 'component'; // Error boundary level for context
}

interface ErrorFallbackProps {
  error: Error | AppError;
  resetError: () => void;
  retryCount: number;
  errorId?: string;
}

// ============================================================================
// ENHANCED ERROR BOUNDARY COMPONENT
// ============================================================================

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Normalize the error to our AppError format
    const normalizedError = normalizeError(error, {
      source: 'error-boundary',
      caughtAt: new Date().toISOString(),
    });

    return {
      hasError: true,
      error: normalizedError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const normalizedError = normalizeError(error);
    
    // Create comprehensive error context
    const errorContext = createErrorContext(
      'ErrorBoundary',
      'componentDidCatch',
      undefined, // userId would come from auth context
      {
        level: this.props.level || 'component',
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount,
        isOperational: isOperationalError(normalizedError),
        resetKeys: this.props.resetKeys,
      }
    );

    // Log error to Sentry with enhanced context
    const errorId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
        errorBoundary: {
          level: this.props.level,
          retryCount: this.state.retryCount,
          isolate: this.props.isolate,
        },
      },
      tags: {
        section: 'error-boundary',
        level: this.props.level || 'component',
        operational: isOperationalError(normalizedError).toString(),
      },
      extra: errorContext,
    });

    this.setState({ errorId });

    // Call custom error handler if provided
    this.props.onError?.(normalizedError, errorInfo);

    // Enhanced development logging
    if (process.env.NODE_ENV === 'development') {
      logger.group('🚨 Error Boundary Caught Error');
      logger.error('Error:', error);
      logger.error('Error Info:', errorInfo);
      logger.error('Normalized Error:', normalizedError);
      logger.error('Context:', errorContext);
      logger.groupEnd();
    }

    // Auto-retry for operational errors (with exponential backoff)
    if (isOperationalError(normalizedError) && this.state.retryCount < (this.props.maxRetries || 3)) {
      const retryDelay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000);
      
      this.resetTimeoutId = setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: undefined,
          errorId: undefined,
          retryCount: prevState.retryCount + 1,
        }));
      }, retryDelay);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error state when resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, index) => 
        key !== prevProps.resetKeys![index]
      );
      
      if (hasResetKeyChanged) {
        this.resetError();
      }
    }

    // Reset on any prop change if enabled
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetError();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetError = (): void => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorId: undefined,
      retryCount: 0,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error} 
            resetError={this.resetError}
            retryCount={this.state.retryCount}
            errorId={this.state.errorId}
          />
        );
      }

      // Default error UI based on boundary level
      return (
        <DefaultErrorFallback 
          error={this.state.error} 
          resetError={this.resetError}
          retryCount={this.state.retryCount}
          errorId={this.state.errorId}
          level={this.props.level}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// ERROR FALLBACK COMPONENTS
// ============================================================================

interface DefaultErrorFallbackProps extends ErrorFallbackProps {
  level?: 'page' | 'section' | 'component';
}

function DefaultErrorFallback({ 
  error, 
  resetError, 
  retryCount, 
  errorId, 
  level = 'component' 
}: DefaultErrorFallbackProps) {
  const isAppError = error instanceof AppError;
  const userMessage = getUserErrorMessage(error, 'tr');
  
  // Different layouts based on error boundary level
  if (level === 'page') {
    return <PageLevelErrorFallback 
      error={error} 
      resetError={resetError} 
      retryCount={retryCount}
      errorId={errorId}
      userMessage={userMessage}
    />;
  }
  
  if (level === 'section') {
    return <SectionLevelErrorFallback 
      error={error} 
      resetError={resetError} 
      retryCount={retryCount}
      errorId={errorId}
      userMessage={userMessage}
    />;
  }
  
  // Component level (default)
  return (
    <div className="min-h-[200px] flex items-center justify-center p-4">
      <Card className="max-w-sm w-full p-4 text-center">
        <div className="flex justify-center mb-3">
          <Icon name="bug" size={32} className="text-orange-500" aria-label="Error" />
        </div>
        
        <h3 className="text-lg font-medium mb-2">Bileşen Hatası</h3>
        <p className="text-gray-600 text-sm mb-3">
          {userMessage}
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-3 text-left">
            <summary className="cursor-pointer text-xs text-gray-500 mb-1">
              Hata detayları
            </summary>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {error.message}
              {error.stack && '\n' + error.stack}
            </pre>
          </details>
        )}
        
        <div className="flex gap-2 justify-center">
          <Button onClick={resetError} variant="outline" size="sm">
            <Icon name="refresh" size={16} className="mr-1" aria-hidden="true" />
            Tekrar Dene {retryCount > 0 && `(${retryCount})`}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Page-level error fallback
function PageLevelErrorFallback({ 
  error, 
  resetError, 
  retryCount, 
  errorId, 
  userMessage 
}: DefaultErrorFallbackProps & { userMessage: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <Icon name="alert-triangle" size={64} className="text-red-500" aria-label="Critical error" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Sayfa Yüklenemedi</h1>
        <p className="text-gray-600 mb-6">
          {userMessage}
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 mb-2">
              Geliştirici Bilgileri
            </summary>
            <div className="bg-gray-100 p-4 rounded text-xs">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              {isAppError(error) && (
                <>
                  <div className="mb-2">
                    <strong>Code:</strong> {error.code}
                  </div>
                  <div className="mb-2">
                    <strong>Status:</strong> {error.statusCode}
                  </div>
                  <div className="mb-2">
                    <strong>Operational:</strong> {error.isOperational.toString()}
                  </div>
                </>
              )}
              {error.stack && (
                <pre className="mt-2 overflow-auto max-h-40 text-xs">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}
        
        {errorId && (
          <p className="text-xs text-gray-400 mb-6">
            Hata Referans Kodu: {errorId}
          </p>
        )}
        
        <div className="flex gap-3 justify-center">
          <Button onClick={resetError} variant="outline">
            <Icon name="refresh" size={16} className="mr-2" aria-hidden="true" />
            Tekrar Dene {retryCount > 0 && `(${retryCount})`}
          </Button>
          <Button onClick={() => window.location.href = '/'}>
            <Icon name="home" size={16} className="mr-2" aria-hidden="true" />
            Ana Sayfa
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="secondary"
          >
            Sayfayı Yenile
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Section-level error fallback
function SectionLevelErrorFallback({ 
  error, 
  resetError, 
  retryCount, 
  errorId, 
  userMessage 
}: DefaultErrorFallbackProps & { userMessage: string }) {
  return (
    <div className="min-h-[300px] flex items-center justify-center p-6 bg-gray-50 rounded-lg border">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <Icon name="alert-triangle" size={48} className="text-orange-500" aria-label="Error" />
        </div>
        
        <h2 className="text-xl font-semibold mb-3">Bölüm Yüklenemedi</h2>
        <p className="text-gray-600 mb-4">
          {userMessage}
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 mb-2">
              Hata Detayları
            </summary>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-32">
              {error.message}
              {error.stack && '\n' + error.stack}
            </pre>
          </details>
        )}
        
        <div className="flex gap-2 justify-center">
          <Button onClick={resetError} variant="outline" size="sm">
            <Icon name="refresh" size={16} className="mr-2" aria-hidden="true" />
            Tekrar Dene {retryCount > 0 && `(${retryCount})`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ERROR REPORTING HOOKS AND UTILITIES
// ============================================================================

/**
 * Hook for manual error reporting with enhanced context
 */
export function useErrorReporting() {
  const reportError = React.useCallback((
    error: Error | AppError | unknown, 
    context?: Record<string, unknown>
  ) => {
    const normalizedError = normalizeError(error);
    const errorContext = createErrorContext(
      context?.component as string,
      context?.action as string,
      context?.userId as string,
      context
    );

    Sentry.captureException(normalizedError, {
      extra: errorContext,
      tags: {
        section: 'manual-report',
        operational: isOperationalError(normalizedError).toString(),
      },
      level: isOperationalError(normalizedError) ? 'warning' : 'error',
    });

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      logger.group('📊 Manual Error Report');
      logger.error('Error:', normalizedError);
      logger.error('Context:', errorContext);
      logger.groupEnd();
    }
  }, []);

  const reportMessage = React.useCallback((
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    context?: Record<string, unknown>
  ) => {
    const messageContext = createErrorContext(
      context?.component as string,
      context?.action as string,
      context?.userId as string,
      context
    );

    Sentry.captureMessage(message, level);

    if (process.env.NODE_ENV === 'development') {
      logger.info(`📝 Manual Message Report [${level.toUpperCase()}]:`, message, messageContext);
    }
  }, []);

  const reportPerformanceIssue = React.useCallback((
    metric: string,
    value: number,
    threshold: number,
    context?: Record<string, unknown>
  ) => {
    if (value > threshold) {
      const performanceContext = createErrorContext(
        'performance',
        'threshold-exceeded',
        undefined,
        {
          metric,
          value,
          threshold,
          ...context,
        }
      );

      Sentry.captureMessage(
        `Performance threshold exceeded: ${metric} (${value} > ${threshold})`,
        'warning'
      );

      if (process.env.NODE_ENV === 'development') {
        logger.warn('⚡ Performance Issue:', performanceContext);
      }
    }
  }, []);

  return { 
    reportError, 
    reportMessage, 
    reportPerformanceIssue 
  };
}

/**
 * Hook for error boundary management
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error | unknown) => {
    const normalizedError = normalizeError(error);
    setError(normalizedError);
  }, []);

  // Throw error to trigger error boundary
  if (error) {
    throw error;
  }

  return { captureError, resetError };
}

/**
 * Higher-order component for adding error boundaries
 */
export function withErrorBoundary<C extends React.ComponentType<any>>(
  Component: C,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  type Props = React.ComponentPropsWithoutRef<C>;
  type ComponentProps = React.ComponentPropsWithRef<C>;
  type Ref = ComponentProps extends { ref?: infer R } ? R : never;

  const WrappedComponent = React.forwardRef<Ref, Props>((props, ref) => {
    const componentProps = { ...props, ref } as ComponentProps;
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        {React.createElement(Component, componentProps)}
      </ErrorBoundary>
    );
  });

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Anonymous'})`;

  return WrappedComponent;
}

/**
 * Async error handler for promises and async operations
 */
export function handleAsyncError<T>(
  promise: Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  return promise.catch((error) => {
    const normalizedError = normalizeError(error, context);
    
    // Report to Sentry
    Sentry.captureException(normalizedError, {
      extra: createErrorContext(
        context?.component as string,
        context?.action as string,
        context?.userId as string,
        context
      ),
      tags: {
        section: 'async-error',
        operational: isOperationalError(normalizedError).toString(),
      },
    });

    // Re-throw the normalized error
    throw normalizedError;
  });
}

/**
 * Safe async wrapper that doesn't throw
 */
export async function safeAsync<T>(
  promise: Promise<T>,
  fallback?: T,
  context?: Record<string, unknown>
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await promise;
    return { data };
  } catch (error) {
    const normalizedError = normalizeError(error, context);
    
    // Report non-operational errors
    if (!isOperationalError(normalizedError)) {
      Sentry.captureException(normalizedError, {
        extra: createErrorContext(
          context?.component as string,
          context?.action as string,
          context?.userId as string,
          context
        ),
        tags: {
          section: 'safe-async',
        },
      });
    }

    return { 
      data: fallback, 
      error: normalizedError 
    };
  }
}