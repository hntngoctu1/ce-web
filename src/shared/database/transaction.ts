/**
 * Transaction Helpers
 * 
 * Provides utilities for running database transactions
 * with proper error handling and rollback.
 */

import { Prisma } from '@prisma/client';
import { prisma, PrismaTransaction } from './prisma';
import { AppError, wrapError } from '../errors';
import { logger } from '../logging';

/**
 * Run a function within a database transaction
 * Automatically rolls back on error
 */
export async function withTransaction<T>(
  fn: (tx: PrismaTransaction) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  }
): Promise<T> {
  try {
    return await prisma.$transaction(fn, {
      maxWait: options?.maxWait ?? 5000,
      timeout: options?.timeout ?? 10000,
      isolationLevel: options?.isolationLevel,
    });
  } catch (error) {
    logger.error('Transaction failed', error);
    throw wrapError(error);
  }
}

/**
 * Run multiple operations in a transaction with automatic retry
 * Useful for operations that might face temporary conflicts
 */
export async function withRetryTransaction<T>(
  fn: (tx: PrismaTransaction) => Promise<T>,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const retryDelay = options?.retryDelay ?? 100;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(fn);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Only retry on specific errors
      const isRetryable = 
        lastError.message.includes('deadlock') ||
        lastError.message.includes('lock') ||
        lastError.message.includes('timeout');

      if (!isRetryable || attempt === maxRetries) {
        break;
      }

      logger.warn(`Transaction attempt ${attempt} failed, retrying...`, {
        attempt: String(attempt),
        maxRetries: String(maxRetries),
      });

      await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
    }
  }

  throw wrapError(lastError);
}

/**
 * Execute a batch of operations
 * Each operation runs in its own transaction
 */
export async function batchOperations<T, R>(
  items: T[],
  operation: (item: T, tx: PrismaTransaction) => Promise<R>,
  options?: {
    batchSize?: number;
    continueOnError?: boolean;
  }
): Promise<{ success: R[]; failed: { item: T; error: Error }[] }> {
  const batchSize = options?.batchSize ?? 10;
  const continueOnError = options?.continueOnError ?? true;

  const success: R[] = [];
  const failed: { item: T; error: Error }[] = [];

  // Process in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map((item) =>
        prisma.$transaction((tx) => operation(item, tx))
      )
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        success.push(result.value);
      } else {
        const item = batch[index];
        const error = result.reason instanceof Error 
          ? result.reason 
          : new Error(String(result.reason));
        
        if (!continueOnError) {
          throw error;
        }
        
        failed.push({ item, error });
      }
    });
  }

  return { success, failed };
}

