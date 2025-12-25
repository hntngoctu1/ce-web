import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { bulkStatusSchema } from '@/lib/validation/admin-orders';
import {
  isAllowedTransition,
  legacyStatusFromOrderStatus,
  fulfillmentFromOrderStatus,
} from '@/lib/orders/workflow';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bulkStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { ids, newStatus, noteInternal, noteCustomer, force } = parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    const orders = await tx.order.findMany({
      where: { id: { in: ids } },
      select: { id: true, orderStatus: true },
    });

    const foundIds = new Set(orders.map((o) => o.id));
    const missing = ids.filter((id) => !foundIds.has(id));

    let updated = 0;
    const skipped: Array<{ id: string; reason: string }> = [];

    for (const o of orders) {
      if (o.orderStatus === newStatus) {
        skipped.push({ id: o.id, reason: 'Already in target status' });
        continue;
      }
      if (!isAllowedTransition(o.orderStatus, newStatus) && !force) {
        skipped.push({ id: o.id, reason: `Invalid transition ${o.orderStatus} → ${newStatus}` });
        continue;
      }

      const now = new Date();
      const fulfillmentStatus = fulfillmentFromOrderStatus(newStatus);
      const updateData: any = {
        orderStatus: newStatus,
        fulfillmentStatus,
        status: legacyStatusFromOrderStatus(newStatus),
      };
      if (newStatus === 'SHIPPED') updateData.shippedAt = now;
      if (newStatus === 'DELIVERED') updateData.deliveredAt = now;
      if (newStatus === 'CANCELED') {
        updateData.canceledAt = now;
        updateData.fulfillmentStatus = 'UNFULFILLED';
      }

      await tx.order.update({ where: { id: o.id }, data: updateData });
      await tx.orderStatusHistory.create({
        data: {
          orderId: o.id,
          fromStatus: o.orderStatus,
          toStatus: newStatus,
          actorAdminId: session.user.id,
          noteInternal: noteInternal?.trim() || null,
          noteCustomer: noteCustomer?.trim() || null,
        },
      });
      updated += 1;
    }

    return { updated, missing, skipped };
  });

  return NextResponse.json({ ok: true, ...result });
}
