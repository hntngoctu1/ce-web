import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateShippingSchema } from '@/lib/validation/admin-orders';
import {
  legacyStatusFromOrderStatus,
  fulfillmentFromOrderStatus,
  isAllowedTransition,
} from '@/lib/orders/workflow';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateShippingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id } = await params;
  const { carrier, trackingCode, markShipped, markDelivered, force } = parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      select: { id: true, orderStatus: true, carrier: true, trackingCode: true },
    });
    if (!order) return { type: 'not_found' as const };

    const now = new Date();
    const nextStatus = markDelivered ? 'DELIVERED' : markShipped ? 'SHIPPED' : null;

    if (nextStatus && !isAllowedTransition(order.orderStatus, nextStatus) && !force) {
      return { type: 'invalid_transition' as const, from: order.orderStatus, to: nextStatus };
    }

    const updateData: any = {
      carrier: carrier ?? null,
      trackingCode: trackingCode ?? null,
    };

    let wroteHistory = false;

    if (nextStatus) {
      updateData.orderStatus = nextStatus;
      updateData.fulfillmentStatus = fulfillmentFromOrderStatus(nextStatus);
      updateData.status = legacyStatusFromOrderStatus(nextStatus);
      if (nextStatus === 'SHIPPED') updateData.shippedAt = now;
      if (nextStatus === 'DELIVERED') updateData.deliveredAt = now;
    }

    await tx.order.update({ where: { id }, data: updateData });

    const notes: string[] = [];
    if (carrier !== undefined || trackingCode !== undefined) {
      notes.push(
        `Shipping updated${carrier ? ` • Carrier: ${carrier}` : ''}${trackingCode ? ` • Tracking: ${trackingCode}` : ''}`
      );
    }
    if (nextStatus) notes.push(`Status updated via shipping: ${order.orderStatus} → ${nextStatus}`);

    if (notes.length) {
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.orderStatus,
          toStatus: nextStatus ?? order.orderStatus,
          actorAdminId: session.user.id,
          noteInternal: notes.join(' | '),
        },
      });
      wroteHistory = true;
    }

    return { type: 'ok' as const, wroteHistory, nextStatus };
  });

  if (result.type === 'not_found')
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (result.type === 'invalid_transition') {
    return NextResponse.json(
      { error: 'Invalid status transition', from: result.from, to: result.to },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true, changed: true, statusUpdatedTo: result.nextStatus ?? null });
}
