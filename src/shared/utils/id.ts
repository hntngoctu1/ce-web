/**
 * ID Generation Utilities
 */

/**
 * Generate a unique ID
 * Uses crypto.randomUUID when available, falls back to timestamp + random
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Generate a human-readable code with prefix
 * Format: PREFIX-YEAR-SEQUENCE
 */
export function generateCode(prefix: string, year: number, sequence: number): string {
  const paddedSequence = String(sequence).padStart(6, '0');
  return `${prefix}-${year}-${paddedSequence}`;
}

/**
 * Generate a short unique code (8 characters)
 */
export function generateShortCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

/**
 * Generate an idempotency key
 */
export function generateIdempotencyKey(parts: string[]): string {
  return parts.join(':');
}

/**
 * Validate CUID format (used by Prisma default)
 */
export function isCuid(id: string): boolean {
  // CUID is 25 characters starting with 'c'
  return /^c[a-z0-9]{24}$/.test(id);
}

/**
 * Validate UUID format
 */
export function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Validate any ID format (CUID or UUID)
 */
export function isValidId(id: string): boolean {
  return isCuid(id) || isUuid(id);
}

