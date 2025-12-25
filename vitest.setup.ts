/**
 * Vitest Setup File
 * 
 * Runs before all tests to set up the test environment.
 */

import { vi } from 'vitest';

// Mock Prisma client for unit tests
vi.mock('@/lib/db', () => ({
  prisma: {
    $transaction: vi.fn((fn) => fn({})),
    order: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    orderStatusHistory: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    inventoryItem: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    stockDocument: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    stockMovement: {
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock shared database
vi.mock('@/shared/database', () => ({
  prisma: {
    $transaction: vi.fn((fn) => fn({})),
  },
  withTransaction: vi.fn((fn) => fn({})),
  withRetryTransaction: vi.fn((fn) => fn({})),
}));

// Mock audit logging
vi.mock('@/shared/logging', () => ({
  audit: vi.fn(),
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  },
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

// Set up global test utilities
globalThis.console = {
  ...console,
  // Uncomment to suppress console output during tests
  // log: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
};

