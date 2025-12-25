/**
 * Rate Limiting
 * 
 * Simple in-memory rate limiter for API protection.
 * For production, use Redis-based solution.
 */

import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '../api/response';
import { AppError } from '../errors';

export interface RateLimitConfig {
  /** Maximum requests allowed in window */
  limit: number;
  /** Time window in seconds */
  windowSec: number;
  /** Key generator function */
  keyGenerator?: (req: NextRequest) => string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (use Redis in production)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 60000); // Cleanup every minute

/**
 * Default key generator - uses IP address
 */
function defaultKeyGenerator(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] ?? req.headers.get('x-real-ip') ?? 'unknown';
  return `rate:${ip}`;
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: Date } {
  const key = (config.keyGenerator ?? defaultKeyGenerator)(req);
  const now = Date.now();
  const windowMs = config.windowSec * 1000;

  let entry = store.get(key);

  // Reset if window expired
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count++;

  return {
    allowed: entry.count <= config.limit,
    remaining: Math.max(0, config.limit - entry.count),
    resetAt: new Date(entry.resetAt),
  };
}

/**
 * Rate limit middleware
 * Returns error response if limit exceeded, undefined otherwise
 */
export function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): NextResponse | undefined {
  const result = checkRateLimit(req, config);

  if (!result.allowed) {
    const response = errorResponse(AppError.rateLimitExceeded());
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', String(config.limit));
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt.getTime() / 1000)));
    response.headers.set('Retry-After', String(config.windowSec));
    
    return response;
  }

  return undefined;
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  /** Login: 5 attempts per 15 minutes */
  LOGIN: { limit: 5, windowSec: 15 * 60 },
  
  /** Register: 3 attempts per hour */
  REGISTER: { limit: 3, windowSec: 60 * 60 },
  
  /** Checkout: 10 attempts per hour */
  CHECKOUT: { limit: 10, windowSec: 60 * 60 },
  
  /** Contact form: 5 per hour */
  CONTACT: { limit: 5, windowSec: 60 * 60 },
  
  /** API general: 100 per minute */
  API_GENERAL: { limit: 100, windowSec: 60 },
  
  /** Admin API: 200 per minute */
  API_ADMIN: { limit: 200, windowSec: 60 },
  
  /** Search: 30 per minute */
  SEARCH: { limit: 30, windowSec: 60 },
} as const;

/**
 * Create rate limiter for specific endpoint
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (req: NextRequest) => rateLimit(req, config);
}

