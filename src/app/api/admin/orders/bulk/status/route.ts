import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { bulkStatusSchema } from '@/lib/validation/admin-orders';
import {
  isAllowedTransition,
  legacyStatusFromOrderStatus,
  fulfillmentFromOrderStatus,
} from '@/lib/orders/workflow';
import { executeOrderStockAction, ensureDefaultWarehouse } from '@/lib/warehouse';
import type { OrderStatus } from '@prisma/client';

/**
 * Determine which stock action to take based on order status transition
 */
function getStockActionForTransition(
  from: OrderStatus,
  to: OrderStatus
): 'RESERVE' | 'DEDUCT' | 'RELEASE' | 'RESTOCK' | null {
  if (to === 'CONFIRMED' && from !== 'CONFIRMED') return 'RESERVE';
  if (to === 'SHIPPED' && from !== 'SHIPPED') return 'DEDUCT';
  if ((to === 'CANCELED' || to === 'FAILED') && (from === 'CONFIRMED' || from === 'PACKING')) return 'RELEASE';
  if (to === 'RETURNED' && (from === 'SHIPPED' || from === 'DELIVERED' || from === 'RETURN_REQUESTED')) return 'RESTOCK';
  return null;
}

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
    const updatedOrders: Array<{ id: string; from: OrderStatus; to: OrderStatus }> = [];

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
      updatedOrders.push({ id: o.id, from: o.orderStatus, to: newStatus });
    }

    return { updated, missing, skipped, updatedOrders };
  });

  // Auto stock operations for updated orders (outside transaction)
  if (result.updatedOrders.length > 0) {
    try {
      const defaultWarehouse = await ensureDefaultWarehouse(prisma);

      for (const { id: orderId, from, to } of result.updatedOrders) {
        const stockAction = getStockActionForTransition(from, to);
        if (!stockAction) continue;

        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (order && order.items.length > 0) {
          await executeOrderStockAction(prisma, {
            orderId,
            action: stockAction,
            items: order.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              productName: item.productName,
            })),
            warehouseId: defaultWarehouse.id,
            createdBy: session.user.id,
          });
        }
      }
    } catch (stockError) {
      console.error('Bulk auto stock operation failed:', stockError);
    }
  }

  return NextResponse.json({
    ok: true,
    updated: result.updated,
    missing: result.missing,
    skipped: result.skipped,
  });
}
