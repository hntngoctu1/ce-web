/**
 * Audit Logging for important CMS actions
 * Logs to console in development, can be extended to external service
 */

export type AuditAction =
  | 'blog.create'
  | 'blog.update'
  | 'blog.delete'
  | 'blog.publish'
  | 'blog.unpublish'
  | 'blog.schedule'
  | 'blog.archive'
  | 'blog.bulk_action'
  | 'media.upload'
  | 'media.delete'
  | 'user.login'
  | 'user.logout';

interface AuditLogEntry {
  action: AuditAction;
  userId: string;
  userEmail?: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxInMemoryLogs = 1000;

  async log(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
    };

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', JSON.stringify(fullEntry, null, 2));
    }

    // Store in memory (for demo - in production use database or external service)
    this.logs.push(fullEntry);
    if (this.logs.length > this.maxInMemoryLogs) {
      this.logs.shift();
    }

    // TODO: In production, send to:
    // - Database (create AuditLog model in Prisma)
    // - External logging service (DataDog, Splunk, etc.)
    // - File system with rotation
  }

  getRecentLogs(limit = 100): AuditLogEntry[] {
    return this.logs.slice(-limit).reverse();
  }

  getLogsByUser(userId: string, limit = 50): AuditLogEntry[] {
    return this.logs
      .filter((log) => log.userId === userId)
      .slice(-limit)
      .reverse();
  }

  getLogsByResource(resourceType: string, resourceId: string, limit = 50): AuditLogEntry[] {
    return this.logs
      .filter((log) => log.resourceType === resourceType && log.resourceId === resourceId)
      .slice(-limit)
      .reverse();
  }
}

export const auditLogger = new AuditLogger();

// Helper function for easy logging
export async function logAudit(
  action: AuditAction,
  userId: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, unknown>,
  request?: Request
): Promise<void> {
  await auditLogger.log({
    action,
    userId,
    resourceType,
    resourceId,
    details,
    ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
    userAgent: request?.headers.get('user-agent') || undefined,
  });
}
