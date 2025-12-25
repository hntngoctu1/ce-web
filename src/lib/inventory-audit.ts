import { PrismaClient } from '@prisma/client';

export async function writeInventoryAuditLog(
  prisma: PrismaClient,
  params: {
    entityType: string;
    entityId: string;
    action: string;
    before?: unknown;
    after?: unknown;
    createdBy?: string | null;
    ip?: string | null;
    userAgent?: string | null;
  }
) {
  return prisma.inventoryAuditLog.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      before: params.before ? (params.before as any) : undefined,
      after: params.after ? (params.after as any) : undefined,
      createdBy: params.createdBy || null,
      ip: params.ip || null,
      userAgent: params.userAgent || null,
    },
  });
}
