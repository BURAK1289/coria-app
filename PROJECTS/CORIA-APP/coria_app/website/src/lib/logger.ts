/**
 * CORIA Production-Ready Logger Service
 *
 * Simple, lightweight logger with environment-aware filtering
 * Replaces all console.log usage for production readiness
 *
 * @see Sprint6_Backlog.md JIRA-616
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  timestamp: boolean;
}

class Logger {
  private config: LoggerConfig;
  private readonly levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isTest = process.env.NODE_ENV === 'test';

    this.config = {
      enabled: isDevelopment || isTest,
      level: isDevelopment ? 'debug' : isTest ? 'warn' : 'error',
      timestamp: isDevelopment,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) {
      return level === 'error'; // Always log errors, even in production
    }
    return this.levels[level] >= this.levels[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): [string, ...unknown[]] {
    if (this.config.timestamp) {
      const timestamp = new Date().toISOString();
      return [`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args];
    }
    return [`[${level.toUpperCase()}] ${message}`, ...args];
  }

  /**
   * Debug level logging - Development only
   * Use for detailed debugging information
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      const [formattedMessage, ...formattedArgs] = this.formatMessage('debug', message, ...args);
      // eslint-disable-next-line no-console
      console.debug(formattedMessage, ...formattedArgs);
    }
  }

  /**
   * Info level logging - Development and testing
   * Use for general informational messages
   */
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      const [formattedMessage, ...formattedArgs] = this.formatMessage('info', message, ...args);
      // eslint-disable-next-line no-console
      console.info(formattedMessage, ...formattedArgs);
    }
  }

  /**
   * Warning level logging - All environments
   * Use for potentially harmful situations
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      const [formattedMessage, ...formattedArgs] = this.formatMessage('warn', message, ...args);
      // eslint-disable-next-line no-console
      console.warn(formattedMessage, ...formattedArgs);
    }
  }

  /**
   * Error level logging - All environments
   * Use for error events that still allow the application to continue
   */
  error(message: string, error?: Error | unknown, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      const [formattedMessage, ...formattedArgs] = this.formatMessage('error', message, error, ...args);
      // eslint-disable-next-line no-console
      console.error(formattedMessage, ...formattedArgs);
    }
  }

  /**
   * Group logging for related messages
   * Automatically collapses in production
   */
  group(label: string, level: LogLevel = 'info'): void {
    if (this.shouldLog(level)) {
      if (this.config.enabled) {
        // eslint-disable-next-line no-console
        console.group(label);
      } else {
        // eslint-disable-next-line no-console
        console.groupCollapsed(label);
      }
    }
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (this.config.enabled) {
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  }

  /**
   * Table logging for structured data
   */
  table(data: unknown, level: LogLevel = 'debug'): void {
    if (this.shouldLog(level)) {
      // eslint-disable-next-line no-console
      console.table(data);
    }
  }

  /**
   * Performance timing utility
   */
  time(label: string): void {
    if (this.config.enabled) {
      // eslint-disable-next-line no-console
      console.time(label);
    }
  }

  /**
   * End performance timing
   */
  timeEnd(label: string): void {
    if (this.config.enabled) {
      // eslint-disable-next-line no-console
      console.timeEnd(label);
    }
  }
}

// Singleton instance
export const logger = new Logger();

// Default export for convenience
export default logger;
