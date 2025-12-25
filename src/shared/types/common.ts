/**
 * Common Types
 * 
 * Shared type definitions used across the platform.
 */

/**
 * Entity with ID and timestamps
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Soft-deletable entity
 */
export interface SoftDeletable {
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

/**
 * Auditable entity
 */
export interface Auditable {
  createdBy?: string | null;
  updatedBy?: string | null;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Pagination result
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Sort parameters
 */
export interface SortParams<T = string> {
  sortBy: T;
  sortOrder: 'asc' | 'desc';
}

/**
 * Search parameters
 */
export interface SearchParams {
  query?: string;
  fields?: string[];
}

/**
 * Date range filter
 */
export interface DateRange {
  from?: Date;
  to?: Date;
}

/**
 * Generic filter with common operations
 */
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'startsWith';

export interface Filter {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Utility to create success result
 */
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Utility to create error result
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * User context for service operations
 */
export interface UserContext {
  userId: string;
  role: 'ADMIN' | 'EDITOR' | 'CUSTOMER';
  email?: string;
  name?: string;
}

/**
 * Request context for tracing
 */
export interface RequestContext {
  requestId: string;
  user?: UserContext;
  ip?: string;
  userAgent?: string;
}

/**
 * Money representation (use Decimal in calculations)
 */
export interface Money {
  amount: number;
  currency: string;
}

/**
 * Locale type
 */
export type Locale = 'en' | 'vi' | 'zh' | 'ko' | 'ja';

/**
 * Bilingual content
 */
export interface BilingualContent {
  en: string;
  vi: string;
}

/**
 * Multilingual content
 */
export interface MultilingualContent {
  en: string;
  vi: string;
  zh?: string;
  ko?: string;
  ja?: string;
}

