import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updatePaymentSchema } from '@/lib/validation/admin-orders';
import { legacyPaymentStatusFromPaymentState } from '@/lib/orders/workflow';
import { recalculateOrderFinancials } from '@/lib/orders/finance';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updatePaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id } = await params;
  const { paymentState, transactionRef } = parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    const order = (await tx.order.findUnique({
      where: { id },
      select: {
        id: true,
        paymentState: true,
        paymentStatus: true,
        transactionRef: true,
        orderStatus: true,
        total: true,
        totalAmount: true,
        paidAmount: true,
        outstandingAmount: true,
      },
    } as any)) as any;
    if (!order) return { type: 'not_found' as const };

    const desiredLegacy = legacyPaymentStatusFromPaymentState(paymentState);
    const desiredTx = transactionRef ?? null;
    const needsUpdate =
      order.paymentState !== paymentState ||
      (order.transactionRef ?? null) !== desiredTx ||
      order.paymentStatus !== desiredLegacy;

    if (!needsUpdate) return { type: 'no_change' as const };

    const totalAmount =
      order.totalAmount && order.totalAmount > 0 ? order.totalAmount : order.total;

    // Keep ledger consistent: when marking PAID via this legacy endpoint, create a manual adjustment payment for remaining amount.
    if (paymentState === 'PAID') {
      const outstanding = Math.max(0, totalAmount - (order.paidAmount ?? 0));
      if (outstanding > 0) {
        await (tx as any).payment.create({
          data: {
            orderId: id,
            amount: outstanding,
            paymentDate: new Date(),
            paymentMethod: 'MANUAL_ADJUSTMENT',
            note: 'Marked as PAID from admin payment override',
            actorAdminId: session.user.id,
          },
        });
      }
    }

    await tx.order.update({
      where: { id },
      data: {
        // Store the override state and legacy status for compatibility
        paymentState,
        transactionRef: desiredTx,
        paymentStatus: desiredLegacy,

        // Best-effort amounts for consistency (final numbers are recalculated below)
        totalAmount,
      } as any,
    } as any);

    // Recalculate paid/outstanding based on ledger
    await recalculateOrderFinancials(tx as any, id);

    await tx.orderStatusHistory.create({
      data: {
        orderId: id,
        fromStatus: order.orderStatus,
        toStatus: order.orderStatus,
        actorAdminId: session.user.id,
        noteInternal: `Payment updated: ${order.paymentState} → ${paymentState}${transactionRef ? ` (TX: ${transactionRef})` : ''}`,
      },
    });

    return { type: 'ok' as const, from: order.paymentState, to: paymentState };
  });

  if (result.type === 'not_found')
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (result.type === 'no_change') return NextResponse.json({ ok: true, changed: false });
  return NextResponse.json({ ok: true, changed: true, from: result.from, to: result.to });
}
