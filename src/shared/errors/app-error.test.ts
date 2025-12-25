/**
 * AppError Tests
 */

import { describe, it, expect } from 'vitest';
import { AppError, isAppError, wrapError } from './app-error';
import { ErrorCode, ErrorHttpStatus } from './error-codes';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create error with correct properties', () => {
      const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Test error');

      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe('Test error');
      expect(error.httpStatus).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should include details when provided', () => {
      const error = new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Test error',
        [{ field: 'email', constraint: 'required' }]
      );

      expect(error.details).toHaveLength(1);
      expect(error.details?.[0].field).toBe('email');
    });

    it('should map error codes to correct HTTP status', () => {
      expect(new AppError(ErrorCode.AUTH_REQUIRED, 'test').httpStatus).toBe(401);
      expect(new AppError(ErrorCode.AUTH_FORBIDDEN, 'test').httpStatus).toBe(403);
      expect(new AppError(ErrorCode.NOT_FOUND, 'test').httpStatus).toBe(404);
      expect(new AppError(ErrorCode.CONFLICT, 'test').httpStatus).toBe(409);
      expect(new AppError(ErrorCode.RATE_LIMIT_EXCEEDED, 'test').httpStatus).toBe(429);
      expect(new AppError(ErrorCode.INTERNAL_ERROR, 'test').httpStatus).toBe(500);
    });
  });

  describe('static factory methods', () => {
    it('validation() should create validation error', () => {
      const error = AppError.validation('Invalid input', [
        { field: 'name', message: 'required' },
      ]);

      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.httpStatus).toBe(400);
    });

    it('notFound() should create not found error', () => {
      const error = AppError.notFound('Order', '123');

      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.message).toBe('Order with ID 123 not found');
      expect(error.httpStatus).toBe(404);
    });

    it('authRequired() should create auth error', () => {
      const error = AppError.authRequired();

      expect(error.code).toBe(ErrorCode.AUTH_REQUIRED);
      expect(error.httpStatus).toBe(401);
    });

    it('forbidden() should create forbidden error', () => {
      const error = AppError.forbidden('Access denied');

      expect(error.code).toBe(ErrorCode.AUTH_FORBIDDEN);
      expect(error.httpStatus).toBe(403);
    });

    it('insufficientRole() should create role error', () => {
      const error = AppError.insufficientRole('ADMIN');

      expect(error.code).toBe(ErrorCode.AUTH_INSUFFICIENT_ROLE);
      expect(error.message).toContain('ADMIN');
    });

    it('conflict() should create conflict error', () => {
      const error = AppError.conflict('Resource already exists');

      expect(error.code).toBe(ErrorCode.CONFLICT);
      expect(error.httpStatus).toBe(409);
    });

    it('alreadyExists() should create already exists error', () => {
      const error = AppError.alreadyExists('User', 'email', 'test@test.com');

      expect(error.code).toBe(ErrorCode.ALREADY_EXISTS);
      expect(error.message).toContain('email');
      expect(error.message).toContain('test@test.com');
    });

    it('rateLimitExceeded() should create rate limit error', () => {
      const error = AppError.rateLimitExceeded(60);

      expect(error.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
      expect(error.httpStatus).toBe(429);
      expect(error.details?.[0].retryAfter).toBe(60);
    });

    it('internal() should create non-operational error', () => {
      const error = AppError.internal('Database connection failed');

      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('toJSON()', () => {
    it('should serialize error correctly', () => {
      const error = new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Test error',
        [{ field: 'name' }]
      );
      const json = error.toJSON();

      expect(json.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(json.message).toBe('Test error');
      expect(json.details).toHaveLength(1);
      expect(json.timestamp).toBeDefined();
    });
  });
});

describe('isAppError', () => {
  it('should return true for AppError instances', () => {
    const error = new AppError(ErrorCode.NOT_FOUND, 'test');
    expect(isAppError(error)).toBe(true);
  });

  it('should return false for regular errors', () => {
    const error = new Error('test');
    expect(isAppError(error)).toBe(false);
  });

  it('should return false for non-error values', () => {
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError('error')).toBe(false);
    expect(isAppError({ message: 'error' })).toBe(false);
  });
});

describe('wrapError', () => {
  it('should return AppError as-is', () => {
    const original = AppError.notFound('User');
    const wrapped = wrapError(original);

    expect(wrapped).toBe(original);
  });

  it('should wrap regular errors as internal error', () => {
    const original = new Error('Something went wrong');
    const wrapped = wrapError(original);

    expect(wrapped.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(wrapped.message).toBe('Something went wrong');
    expect(wrapped.isOperational).toBe(false);
  });

  it('should handle unknown values', () => {
    const wrapped = wrapError('string error');

    expect(wrapped.code).toBe(ErrorCode.INTERNAL_ERROR);
  });
});

