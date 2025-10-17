/**
 * Type-safe logging and monitoring system
 */

import * as Sentry from '@sentry/nextjs';
import { 
  AppError, 
  isAppError, 
  isOperationalError, 
  createErrorContext 
} from './errors';

// ============================================================================
// LOGGING TYPES
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error | AppError;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export interface PerformanceLogEntry extends LogEntry {
  level: 'info';
  metric: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  threshold?: number;
  category: 'web-vitals' | 'api' | 'render' | 'navigation' | 'resource';
}

export interface SecurityLogEntry extends LogEntry {
  level: 'warn' | 'error';
  securityEvent: 'auth-failure' | 'rate-limit' | 'suspicious-activity' | 'data-breach' | 'xss-attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
  blocked: boolean;
}

export interface BusinessLogEntry extends LogEntry {
  level: 'info';
  event: 'user-signup' | 'subscription' | 'conversion' | 'feature-usage' | 'content-view';
  value?: number;
  currency?: string;
  properties?: Record<string, string | number | boolean>;
}

// ============================================================================
// LOGGER CLASS
// ============================================================================

class Logger {
  private isDevelopment: boolean;
  private isClient: boolean;
  private sessionId: string;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isClient = typeof window !== 'undefined';
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    if (this.isClient) {
      let sessionId = sessionStorage.getItem('logger-session-id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('logger-session-id', sessionId);
      }
      return sessionId;
    }
    return `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error | AppError
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      sessionId: this.sessionId,
      userId: context?.userId as string,
      component: context?.component as string,
      action: context?.action as string,
      metadata: {
        url: this.isClient ? window.location.href : undefined,
        userAgent: this.isClient ? navigator.userAgent : undefined,
        referrer: this.isClient ? document.referrer : undefined,
        ...context?.metadata as Record<string, unknown>,
      },
    };
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.isDevelopment) return;

    const style = this.getConsoleStyle(entry.level);
    const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp}`;

    // eslint-disable-next-line no-console
    console.group(`%c${prefix}`, style);
    // eslint-disable-next-line no-console
    console.log('Message:', entry.message);

    // eslint-disable-next-line no-console
    if (entry.component) console.log('Component:', entry.component);
    // eslint-disable-next-line no-console
    if (entry.action) console.log('Action:', entry.action);
    // eslint-disable-next-line no-console
    if (entry.userId) console.log('User ID:', entry.userId);
    // eslint-disable-next-line no-console
    if (entry.context) console.log('Context:', entry.context);
    // eslint-disable-next-line no-console
    if (entry.error) console.error('Error:', entry.error);
    // eslint-disable-next-line no-console
    if (entry.metadata) console.log('Metadata:', entry.metadata);

    // eslint-disable-next-line no-console
    console.groupEnd();
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      debug: 'color: #6B7280; font-weight: normal;',
      info: 'color: #3B82F6; font-weight: normal;',
      warn: 'color: #F59E0B; font-weight: bold;',
      error: 'color: #EF4444; font-weight: bold;',
      fatal: 'color: #DC2626; font-weight: bold; background: #FEE2E2;',
    };
    return styles[level];
  }

  private logToSentry(entry: LogEntry): void {
    const sentryLevel = this.mapToSentryLevel(entry.level);
    
    if (entry.error) {
      Sentry.captureException(entry.error, {
        level: sentryLevel,
        extra: {
          ...entry.context,
          ...entry.metadata,
          component: entry.component,
          action: entry.action,
          sessionId: entry.sessionId,
        },
        tags: {
          component: entry.component || 'unknown',
          action: entry.action || 'unknown',
          level: entry.level,
        },
        user: entry.userId ? { id: entry.userId } : undefined,
      });
    } else {
      Sentry.captureMessage(entry.message, sentryLevel);
    }
  }

  private mapToSentryLevel(level: LogLevel): Sentry.SeverityLevel {
    const mapping: Record<LogLevel, Sentry.SeverityLevel> = {
      debug: 'debug',
      info: 'info',
      warn: 'warning',
      error: 'error',
      fatal: 'fatal',
    };
    return mapping[level];
  }

  // ============================================================================
  // PUBLIC LOGGING METHODS
  // ============================================================================

  debug(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('debug', message, context);
    this.logToConsole(entry);
  }

  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('info', message, context);
    this.logToConsole(entry);
    
    // Only log info to Sentry in production for important events
    if (!this.isDevelopment && context?.important) {
      this.logToSentry(entry);
    }
  }

  warn(message: string, context?: Record<string, unknown>, error?: Error | AppError): void {
    const entry = this.createLogEntry('warn', message, context, error);
    this.logToConsole(entry);
    this.logToSentry(entry);
  }

  error(message: string, context?: Record<string, unknown>, error?: Error | AppError): void {
    const entry = this.createLogEntry('error', message, context, error);
    this.logToConsole(entry);
    this.logToSentry(entry);
  }

  fatal(message: string, context?: Record<string, unknown>, error?: Error | AppError): void {
    const entry = this.createLogEntry('fatal', message, context, error);
    this.logToConsole(entry);
    this.logToSentry(entry);
  }

  // ============================================================================
  // SPECIALIZED LOGGING METHODS
  // ============================================================================

  performance(entry: Omit<PerformanceLogEntry, 'level' | 'timestamp' | 'sessionId'>): void {
    const perfEntry: PerformanceLogEntry = {
      ...entry,
      level: 'info',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    };

    this.logToConsole(perfEntry);

    // Log to Sentry if threshold exceeded or in production
    if (perfEntry.threshold && perfEntry.value > perfEntry.threshold) {
      Sentry.captureMessage(
        `Performance threshold exceeded: ${perfEntry.metric} (${perfEntry.value}${perfEntry.unit} > ${perfEntry.threshold}${perfEntry.unit})`,
        'warning'
      );
    } else if (!this.isDevelopment) {
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `${perfEntry.metric}: ${perfEntry.value}${perfEntry.unit}`,
        level: 'info',
        data: {
          metric: perfEntry.metric,
          value: perfEntry.value,
          unit: perfEntry.unit,
          category: perfEntry.category,
        },
      });
    }
  }

  security(entry: Omit<SecurityLogEntry, 'timestamp' | 'sessionId'>): void {
    const secEntry: SecurityLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    };

    this.logToConsole(secEntry);

    // Always log security events to Sentry
    Sentry.captureMessage(
      `Security Event: ${secEntry.securityEvent} - ${secEntry.message}`,
      this.mapToSentryLevel(secEntry.level)
    );

    // Add security context
    Sentry.setContext('security', {
      event: secEntry.securityEvent,
      severity: secEntry.severity,
      blocked: secEntry.blocked,
      ipAddress: secEntry.ipAddress,
      userAgent: secEntry.userAgent,
    });
  }

  business(entry: Omit<BusinessLogEntry, 'level' | 'timestamp' | 'sessionId'>): void {
    const bizEntry: BusinessLogEntry = {
      ...entry,
      level: 'info',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    };

    this.logToConsole(bizEntry);

    // Log business events as breadcrumbs
    Sentry.addBreadcrumb({
      category: 'business',
      message: `${bizEntry.event}: ${bizEntry.message}`,
      level: 'info',
      data: {
        event: bizEntry.event,
        value: bizEntry.value,
        currency: bizEntry.currency,
        properties: bizEntry.properties,
      },
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Create a child logger with additional context
   */
  child(context: Record<string, unknown>): Logger {
    const childLogger = new Logger();
    
    // Override methods to include additional context
    const originalMethods = ['debug', 'info', 'warn', 'error', 'fatal'] as const;
    
    originalMethods.forEach(method => {
      const originalMethod = childLogger[method].bind(childLogger);
      childLogger[method] = (message: string, additionalContext?: Record<string, unknown>, error?: Error | AppError) => {
        return originalMethod(message, { ...context, ...additionalContext }, error);
      };
    });

    return childLogger;
  }

  /**
   * Time a function execution
   */
  async time<T>(
    label: string,
    fn: () => Promise<T> | T,
    context?: Record<string, unknown>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      
      this.performance({
        message: `${label} completed`,
        metric: label,
        value: Math.round(duration),
        unit: 'ms',
        category: 'api',
        context,
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.error(`${label} failed after ${Math.round(duration)}ms`, context, error as Error);
      throw error;
    }
  }

  /**
   * Flush all pending logs (useful for cleanup)
   */
  flush(): void {
    if (this.isClient) {
      // Clear session storage
      sessionStorage.removeItem('logger-session-id');
    }
  }
}

// ============================================================================
// SINGLETON LOGGER INSTANCE
// ============================================================================

export const logger = new Logger();

// ============================================================================
// TYPED LOGGING FUNCTIONS
// ============================================================================

/**
 * Type-safe error logging
 */
export function logError(
  error: Error | AppError | unknown,
  context?: Record<string, unknown>
): void {
  if (isAppError(error)) {
    logger.error(error.message, {
      ...context,
      code: error.code,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      errorContext: error.context,
    }, error);
  } else if (error instanceof Error) {
    logger.error(error.message, context, error);
  } else {
    logger.error('Unknown error occurred', { ...context, error });
  }
}

/**
 * Type-safe performance logging
 */
export function logPerformance(
  metric: string,
  value: number,
  unit: 'ms' | 'bytes' | 'count' | 'percentage',
  category: 'web-vitals' | 'api' | 'render' | 'navigation' | 'resource',
  threshold?: number,
  context?: Record<string, unknown>
): void {
  logger.performance({
    message: `Performance metric: ${metric}`,
    metric,
    value,
    unit,
    category,
    threshold,
    context,
  });
}

/**
 * Type-safe security event logging
 */
export function logSecurityEvent(
  event: SecurityLogEntry['securityEvent'],
  message: string,
  severity: SecurityLogEntry['severity'],
  blocked: boolean = false,
  context?: Record<string, unknown>
): void {
  logger.security({
    level: severity === 'critical' || severity === 'high' ? 'error' : 'warn',
    message,
    securityEvent: event,
    severity,
    blocked,
    context,
  });
}

/**
 * Type-safe business event logging
 */
export function logBusinessEvent(
  event: BusinessLogEntry['event'],
  message: string,
  value?: number,
  currency?: string,
  properties?: Record<string, string | number | boolean>,
  context?: Record<string, unknown>
): void {
  logger.business({
    message,
    event,
    value,
    currency,
    properties,
    context,
  });
}

// ============================================================================
// REACT HOOKS FOR LOGGING
// ============================================================================

/**
 * Hook for component-level logging
 */
export function useLogger(componentName: string) {
  const componentLogger = React.useMemo(
    () => logger.child({ component: componentName }),
    [componentName]
  );

  return componentLogger;
}

/**
 * Hook for performance monitoring
 */
export function usePerformanceLogger() {
  const logRender = React.useCallback((componentName: string, renderTime: number) => {
    logPerformance(
      `${componentName}-render`,
      renderTime,
      'ms',
      'render',
      100, // 100ms threshold
      { component: componentName }
    );
  }, []);

  const logInteraction = React.useCallback((action: string, duration: number) => {
    logPerformance(
      `interaction-${action}`,
      duration,
      'ms',
      'navigation',
      200, // 200ms threshold
      { action }
    );
  }, []);

  return { logRender, logInteraction };
}

// Import React for hooks
import React from 'react';