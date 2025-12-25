import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateOrderStatusSchema } from '@/lib/validation/admin-orders';
import {
  isAllowedTransition,
  legacyStatusFromOrderStatus,
  fulfillmentFromOrderStatus,
} from '@/lib/orders/workflow';
import { executeOrderStockAction, ensureDefaultWarehouse } from '@/lib/warehouse';
import type { OrderStatus } from '@prisma/client';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { newStatus, noteInternal, noteCustomer, force, cancelReason } = parsed.data;
  const { id } = await params;

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id },
      select: { id: true, orderStatus: true, fulfillmentStatus: true },
    });
    if (!existing) return { type: 'not_found' as const };

    const from = existing.orderStatus;
    const to = newStatus;

    if (!isAllowedTransition(from, to) && !force) {
      return { type: 'invalid_transition' as const, from, to };
    }

    if (from === to && !noteInternal && !noteCustomer) {
      return { type: 'no_change' as const, orderId: id };
    }

    if (to === 'CANCELED' && (!cancelReason || cancelReason.trim().length < 3)) {
      return { type: 'cancel_reason_required' as const };
    }

    const now = new Date();
    const fulfillmentStatus = fulfillmentFromOrderStatus(to);

    const updateData: any = {
      orderStatus: to,
      fulfillmentStatus,
      status: legacyStatusFromOrderStatus(to),
      // Keep legacy paymentStatus unchanged here
    };

    if (to === 'SHIPPED') {
      updateData.shippedAt = now;
    }
    if (to === 'DELIVERED') {
      updateData.deliveredAt = now;
    }
    if (to === 'CANCELED') {
      updateData.canceledAt = now;
      updateData.cancelReason = cancelReason?.trim() || null;
      updateData.fulfillmentStatus = 'UNFULFILLED';
    }

    await tx.order.update({
      where: { id },
      data: updateData,
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: id,
        fromStatus: from === to ? from : from,
        toStatus: to,
        actorAdminId: session.user.id,
        noteInternal: noteInternal?.trim() || null,
        noteCustomer: noteCustomer?.trim() || null,
      },
    });

    return { type: 'ok' as const, from, to, orderId: id };
  });

  // Auto stock operations based on status transition (outside transaction for better error handling)
  if (result.type === 'ok' && result.from !== result.to) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: result.orderId },
        include: { items: true },
      });

      if (order && order.items.length > 0) {
        const defaultWarehouse = await ensureDefaultWarehouse(prisma);
        const stockItems = order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          productName: item.productName,
        }));

        // Determine stock action based on status transition
        const stockAction = getStockActionForTransition(result.from as OrderStatus, result.to as OrderStatus);

        if (stockAction) {
          await executeOrderStockAction(prisma, {
            orderId: result.orderId,
            action: stockAction,
            items: stockItems,
            warehouseId: defaultWarehouse.id,
            createdBy: session.user.id,
          });
        }
      }
    } catch (stockError) {
      // Log but don't fail the status update - stock can be adjusted manually
      console.error('Auto stock operation failed:', stockError);
    }
  }

  if (result.type === 'not_found') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (result.type === 'invalid_transition') {
    return NextResponse.json(
      {
        error: 'Invalid status transition',
        from: result.from,
        to: result.to,
        hint: 'Use force=true to override',
      },
      { status: 400 }
    );
  }
  if (result.type === 'cancel_reason_required') {
    return NextResponse.json({ error: 'Cancel reason is required' }, { status: 400 });
  }
  if (result.type === 'no_change') {
    return NextResponse.json({ ok: true, changed: false });
  }

  return NextResponse.json({ ok: true, changed: true, from: result.from, to: result.to });
}

/**
 * Determine which stock action to take based on order status transition
 */
function getStockActionForTransition(
  from: OrderStatus,
  to: OrderStatus
): 'RESERVE' | 'DEDUCT' | 'RELEASE' | 'RESTOCK' | null {
  // CONFIRMED: Reserve stock (ready to ship)
  if (to === 'CONFIRMED' && from !== 'CONFIRMED') {
    return 'RESERVE';
  }

  // SHIPPED: Deduct stock (items left warehouse)
  if (to === 'SHIPPED' && from !== 'SHIPPED') {
    return 'DEDUCT';
  }

  // CANCELED/FAILED: Release reserved stock (if was in CONFIRMED/PACKING state)
  if ((to === 'CANCELED' || to === 'FAILED') && (from === 'CONFIRMED' || from === 'PACKING')) {
    return 'RELEASE';
  }

  // RETURNED: Restock items (items came back after being shipped)
  if (to === 'RETURNED' && (from === 'SHIPPED' || from === 'DELIVERED' || from === 'RETURN_REQUESTED')) {
    return 'RESTOCK';
  }

  return null;
}
