import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateOrderStatusSchema } from '@/lib/validation/admin-orders';
import {
  isAllowedTransition,
  legacyStatusFromOrderStatus,
  fulfillmentFromOrderStatus,
} from '@/lib/orders/workflow';

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
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
  const id = ctx.params.id;

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

    return { type: 'ok' as const, from, to };
  });

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
