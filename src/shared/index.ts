/**
 * Shared Module
 * 
 * Cross-cutting concerns used across all domain modules.
 * 
 * @example
 * import { prisma, AppError, successResponse, logger } from '@/shared';
 */

// Database
export { prisma, type PrismaTransaction } from './database';
export { withTransaction, withRetryTransaction, batchOperations } from './database';

// Errors
export { AppError, isAppError, wrapError, ErrorCode, type ErrorCodeType, type ErrorDetails } from './errors';

// API
export {
  successResponse,
  createdResponse,
  errorResponse,
  handleError,
  paginatedResponse,
  parseBody,
  parseData,
  parseQuery,
  PaginationQuerySchema,
  SortQuerySchema,
  SearchQuerySchema,
  type ApiSuccessResponse,
  type ApiErrorResponse,
  type ApiResponse,
  type PaginationMeta,
  type PaginationQuery,
  type SortQuery,
  type SearchQuery,
} from './api';

// Logging
export {
  logger,
  generateRequestId,
  getRequestContext,
  audit,
  createAuditor,
  getAuditContext,
  type LogLevel,
  type LogContext,
  type AuditAction,
  type AuditEntityType,
  type AuditLogEntry,
} from './logging';

// Types
export * from './types';

// Utils
export * from './utils';

// Security
export * from './security';

