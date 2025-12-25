/**
 * Standardized API Response Format
 * 
 * All API endpoints should use these helpers for consistent responses.
 * 
 * Success: { success: true, data: T, meta?: { pagination } }
 * Error: { success: false, error: { code, message, details } }
 */

import { NextResponse } from 'next/server';
import { AppError, isAppError, wrapError, ErrorCodeType } from '../errors';

// ==================== Types ====================

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    [key: string]: unknown;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCodeType;
    message: string;
    details?: Array<{ [key: string]: unknown }>;
    timestamp: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ==================== Response Builders ====================

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  meta?: ApiSuccessResponse<T>['meta'],
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    body.meta = meta;
  }

  return NextResponse.json(body, { status });
}

/**
 * Create a created response (201)
 */
export function createdResponse<T>(
  data: T,
  meta?: ApiSuccessResponse<T>['meta']
): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, meta, 201);
}

/**
 * Create an error response from AppError
 */
export function errorResponse(error: AppError): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = {
    success: false,
    error: error.toJSON(),
  };

  return NextResponse.json(body, { status: error.httpStatus });
}

/**
 * Handle any error and return appropriate response
 * Use this in catch blocks
 */
export function handleError(error: unknown): NextResponse<ApiErrorResponse> {
  const appError = wrapError(error);
  
  // Log non-operational errors
  if (!appError.isOperational) {
    console.error('[API Error]', {
      code: appError.code,
      message: appError.message,
      stack: appError.stack,
      timestamp: appError.timestamp,
    });
  }

  return errorResponse(appError);
}

/**
 * Create a paginated success response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
  }
): NextResponse<ApiSuccessResponse<T[]>> {
  const totalPages = Math.ceil(pagination.totalItems / pagination.pageSize);
  
  return successResponse(data, {
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems: pagination.totalItems,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1,
    },
  });
}

// ==================== Validation Helpers ====================

import { ZodSchema, ZodError } from 'zod';

/**
 * Parse and validate request body with Zod
 * Throws AppError on validation failure
 */
export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<T> {
  let body: unknown;
  
  try {
    body = await request.json();
  } catch {
    throw AppError.validation('Invalid JSON body');
  }

  return parseData(body, schema);
}

/**
 * Parse and validate any data with Zod
 * Throws AppError on validation failure
 */
export function parseData<T>(data: unknown, schema: ZodSchema<T>): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const fields = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw AppError.validation('Validation failed', fields);
    }
    throw error;
  }
}

/**
 * Parse query parameters
 */
export function parseQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): T {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return parseData(params, schema);
}

// ==================== Common Query Params ====================

import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const SortQuerySchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type SortQuery = z.infer<typeof SortQuerySchema>;

export const SearchQuerySchema = z.object({
  q: z.string().optional(),
  search: z.string().optional(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

