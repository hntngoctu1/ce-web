/**
 * Structured Logger
 * 
 * Provides consistent logging across the application with:
 * - Request IDs for tracing
 * - User context
 * - Structured JSON output (for production log aggregation)
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  userId?: string;
  userRole?: string;
  ip?: string;
  path?: string;
  method?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  data?: unknown;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDev = process.env.NODE_ENV !== 'production';
  private minLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.minLevel];
  }

  private formatEntry(entry: LogEntry): string {
    if (this.isDev) {
      // Pretty print for development
      const { timestamp, level, message, context, data, error } = entry;
      const levelColors: Record<LogLevel, string> = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
      };
      const reset = '\x1b[0m';
      
      let output = `${levelColors[level]}[${level.toUpperCase()}]${reset} ${timestamp} ${message}`;
      
      if (context?.requestId) {
        output += ` [${context.requestId}]`;
      }
      if (context?.userId) {
        output += ` user:${context.userId}`;
      }
      if (data) {
        output += `\n  Data: ${JSON.stringify(data, null, 2)}`;
      }
      if (error) {
        output += `\n  Error: ${error.name}: ${error.message}`;
        if (error.stack) {
          output += `\n  ${error.stack}`;
        }
      }
      
      return output;
    }

    // JSON for production
    return JSON.stringify(entry);
  }

  private log(level: LogLevel, message: string, context?: LogContext, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
    };

    const formatted = this.formatEntry(entry);

    switch (level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  debug(message: string, context?: LogContext, data?: unknown): void {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: LogContext, data?: unknown): void {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: LogContext, data?: unknown): void {
    this.log('warn', message, context, data);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
    };

    if (error instanceof Error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      entry.data = error;
    }

    const formatted = this.formatEntry(entry);
    console.error(formatted);
  }

  /**
   * Create a child logger with preset context
   */
  child(context: LogContext): ChildLogger {
    return new ChildLogger(this, context);
  }
}

class ChildLogger {
  constructor(
    private parent: Logger,
    private context: LogContext
  ) {}

  debug(message: string, data?: unknown): void {
    this.parent.debug(message, this.context, data);
  }

  info(message: string, data?: unknown): void {
    this.parent.info(message, this.context, data);
  }

  warn(message: string, data?: unknown): void {
    this.parent.warn(message, this.context, data);
  }

  error(message: string, error?: Error | unknown): void {
    this.parent.error(message, error, this.context);
  }
}

// Singleton instance
export const logger = new Logger();

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Extract request context from Next.js request
 */
export function getRequestContext(
  request: Request,
  userId?: string,
  userRole?: string
): LogContext {
  const url = new URL(request.url);
  return {
    requestId: generateRequestId(),
    method: request.method,
    path: url.pathname,
    userId,
    userRole,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
  };
}

