/**
 * Audit Logger
 * 
 * Tracks sensitive actions for compliance and debugging.
 * Writes to database and optionally to external logging service.
 */

import { prisma } from '../database/prisma';
import { logger } from './logger';

export type AuditAction =
  // Orders
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_PAYMENT_ADDED'
  | 'ORDER_CANCELED'
  | 'ORDER_REFUNDED'
  // Inventory
  | 'STOCK_DOCUMENT_CREATED'
  | 'STOCK_DOCUMENT_POSTED'
  | 'STOCK_DOCUMENT_VOIDED'
  | 'INVENTORY_ADJUSTED'
  // Users
  | 'USER_CREATED'
  | 'USER_ROLE_CHANGED'
  | 'USER_DELETED'
  | 'USER_LOGIN'
  | 'USER_LOGIN_FAILED'
  // Content
  | 'BLOG_POST_PUBLISHED'
  | 'BLOG_POST_DELETED'
  // Settings
  | 'SETTING_CHANGED'
  // Files
  | 'FILE_UPLOADED'
  | 'FILE_DELETED';

export type AuditEntityType =
  | 'Order'
  | 'Payment'
  | 'StockDocument'
  | 'InventoryItem'
  | 'User'
  | 'BlogPost'
  | 'Setting'
  | 'MediaFile'
  | 'Product';

export interface AuditLogEntry {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Write an audit log entry
 */
export async function audit(entry: AuditLogEntry): Promise<void> {
  try {
    // Write to database
    await prisma.inventoryAuditLog.create({
      data: {
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        before: entry.before ? JSON.parse(JSON.stringify(entry.before)) : undefined,
        after: entry.after ? JSON.parse(JSON.stringify(entry.after)) : undefined,
        createdBy: entry.userId ?? null,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
      },
    });

    // Also log to console for immediate visibility
    logger.info(`[AUDIT] ${entry.action}`, {
      userId: entry.userId,
      ip: entry.ip,
    }, {
      entityType: entry.entityType,
      entityId: entry.entityId,
      metadata: entry.metadata,
    });
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    logger.error('[AUDIT] Failed to write audit log', error, {
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
    } as any);
  }
}

/**
 * Create an auditor function with preset context
 */
export function createAuditor(context: {
  userId?: string;
  ip?: string;
  userAgent?: string;
}) {
  return async (entry: Omit<AuditLogEntry, 'userId' | 'ip' | 'userAgent'>) => {
    await audit({
      ...entry,
      ...context,
    });
  };
}

/**
 * Helper to extract audit context from request
 */
export function getAuditContext(request: Request, userId?: string) {
  return {
    userId,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  };
}

