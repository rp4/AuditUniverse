/**
 * Production logging framework
 * Provides structured logging with different severity levels
 * In production, errors can be sent to monitoring services
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  userId?: string;
  sessionId?: string;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  stack?: string;
  errorMessage?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
    };

    // Add to buffer for potential batch sending
    this.logBuffer.push(logEntry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift(); // Remove oldest entry
    }

    // In production, send critical errors to monitoring service
    if (!this.isDevelopment && level === 'error') {
      this.sendToMonitoring(logEntry);
    }

    // In development, use console
    if (this.isDevelopment) {
      const consoleMethod = level === 'debug' ? 'log' : level;
      console[consoleMethod](
        `[${level.toUpperCase()}] ${message}`,
        context || ''
      );
    }
  }

  /**
   * Send error to monitoring service
   * In a real production app, integrate with Sentry, LogRocket, DataDog, etc.
   */
  private sendToMonitoring(entry: LogEntry): void {
    // For now, store in sessionStorage as a backup
    // In production, replace with actual monitoring service
    try {
      const stored = sessionStorage.getItem('error_logs') || '[]';
      const logs = JSON.parse(stored);
      logs.push(entry);

      // Keep only last 50 errors in storage
      if (logs.length > 50) {
        logs.shift();
      }

      sessionStorage.setItem('error_logs', JSON.stringify(logs));

      // TODO: Send to monitoring service
      // Example with Sentry:
      // Sentry.captureException(new Error(entry.message), {
      //   contexts: { custom: entry.context },
      // });
    } catch (err) {
      // Fail silently - don't break app if logging fails
      console.error('Failed to log error:', err);
    }
  }

  /**
   * Log error with optional Error object
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, {
      ...context,
      stack: error?.stack,
      errorMessage: error?.message,
    });
  }

  /**
   * Log warning
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Log info
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Log debug (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  /**
   * Get recent logs (useful for debugging)
   */
  getRecentLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  clearLogs(): void {
    this.logBuffer = [];
  }
}

// Export singleton instance
export const logger = new Logger();
