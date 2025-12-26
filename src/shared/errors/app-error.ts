/**
 * Application Error Class
 * 
 * Standardized error handling across the platform.
 * All business logic errors should use this class.
 */

import { ErrorCode, ErrorCodeType, ErrorHttpStatus } from './error-codes';

export interface ErrorDetails {
  field?: string;
  value?: unknown;
  constraint?: string;
  [key: string]: unknown;
}

export class AppError extends Error {
  public readonly code: ErrorCodeType;
  public readonly httpStatus: number;
  public readonly details?: ErrorDetails[];
  public readonly isOperational: boolean;
  public readonly timestamp: Date;

  constructor(
    code: ErrorCodeType,
    message: string,
    details?: ErrorDetails[],
    isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = ErrorHttpStatus[code] ?? 500;
    this.details = details;
    this.isOperational = isOperational;
    this.timestamp = new Date();

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a validation error with field details
   */
  static validation(message: string, fields?: { field: string; message: string }[]): AppError {
    return new AppError(
      ErrorCode.VALIDATION_ERROR,
      message,
      fields?.map((f) => ({ field: f.field, constraint: f.message }))
    );
  }

  /**
   * Create a not found error
   */
  static notFound(resource: string, id?: string): AppError {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    return new AppError(ErrorCode.NOT_FOUND, message, [{ resource, id }]);
  }

  /**
   * Create an auth required error
   */
  static authRequired(message = 'Authentication required'): AppError {
    return new AppError(ErrorCode.AUTH_REQUIRED, message);
  }

  /**
   * Create a forbidden error
   */
  static forbidden(message = 'Access denied'): AppError {
    return new AppError(ErrorCode.AUTH_FORBIDDEN, message);
  }

  /**
   * Create an insufficient role error
   */
  static insufficientRole(requiredRole: string): AppError {
    return new AppError(
      ErrorCode.AUTH_INSUFFICIENT_ROLE,
      `Insufficient permissions. Required role: ${requiredRole}`,
      [{ requiredRole }]
    );
  }

  /**
   * Create a conflict error
   */
  static conflict(message: string, details?: ErrorDetails[]): AppError {
    return new AppError(ErrorCode.CONFLICT, message, details);
  }

  /**
   * Create an already exists error
   */
  static alreadyExists(resource: string, field: string, value: unknown): AppError {
    return new AppError(
      ErrorCode.ALREADY_EXISTS,
      `${resource} with ${field} '${value}' already exists`,
      [{ field, value }]
    );
  }

  /**
   * Create a rate limit error
   */
  static rateLimitExceeded(retryAfter?: number): AppError {
    return new AppError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Too many requests. Please try again later.',
      retryAfter ? [{ retryAfter }] : undefined
    );
  }

  /**
   * Create an internal error (non-operational)
   */
  static internal(message = 'An unexpected error occurred'): AppError {
    return new AppError(ErrorCode.INTERNAL_ERROR, message, undefined, false);
  }

  /**
   * Convert to JSON for API response
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Wrap unknown errors into AppError
 */
export function wrapError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      const zodError = error as Error & { errors?: Array<{ path: (string | number)[]; message: string }> };
      const fields = (zodError.errors ?? []).map((e) => ({
        field: e.path.join('.'),
        constraint: e.message,
      }));
      return AppError.validation('Validation failed', fields.map(f => ({ field: f.field, message: f.constraint })));
    }

    // Handle Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
      const prismaError = error as Error & { code?: string; meta?: { target?: string[] } };
      
      if (prismaError.code === 'P2002') {
        // Unique constraint violation
        const field = prismaError.meta?.target?.[0] ?? 'field';
        return new AppError(
          ErrorCode.ALREADY_EXISTS,
          `Record with this ${field} already exists`,
          [{ field }]
        );
      }
      
      if (prismaError.code === 'P2025') {
        // Record not found
        return new AppError(ErrorCode.NOT_FOUND, 'Record not found');
      }

      if (prismaError.code === 'P2003') {
        // Foreign key constraint
        return new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Referenced record does not exist',
          [{ constraint: 'foreign_key' }]
        );
      }
    }

    return new AppError(ErrorCode.INTERNAL_ERROR, error.message, undefined, false);
  }

  return AppError.internal();
}

