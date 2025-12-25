import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { recalculateOrderFinancials } from '@/lib/orders/finance';

const createPaymentSchema = z.object({
  amount: z.number().positive(),
  paymentDate: z.string().datetime().optional(),
  paymentMethod: z
    .enum(['COD', 'BANK_TRANSFER', 'CASH', 'CARD', 'MANUAL_ADJUSTMENT', 'OTHER'])
    .default('OTHER'),
  note: z.string().max(500).optional(),
});

export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = ctx.params.id;
  const payments = await prisma.payment.findMany({
    where: { orderId: id },
    orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      amount: true,
      paymentDate: true,
      paymentMethod: true,
      note: true,
      createdAt: true,
      actorAdminId: true,
    },
  });

  return NextResponse.json({ payments });
}

export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const id = ctx.params.id;
  const { amount, paymentMethod, note } = parsed.data;
  const paymentDate = parsed.data.paymentDate ? new Date(parsed.data.paymentDate) : new Date();

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        total: true,
        totalAmount: true,
        outstandingAmount: true,
        paidAmount: true,
      },
    });
    if (!order) return { type: 'not_found' as const };

    // Create payment ledger entry
    const payment = await tx.payment.create({
      data: {
        orderId: id,
        amount,
        paymentDate,
        paymentMethod: paymentMethod as any,
        note,
        actorAdminId: session.user.id,
      },
      select: { id: true },
    });

    const updated = await recalculateOrderFinancials(tx as any, id);

    await tx.orderStatusHistory.create({
      data: {
        orderId: id,
        fromStatus: order.orderStatus,
        toStatus: order.orderStatus,
        actorAdminId: session.user.id,
        noteInternal: `Payment received: ${amount} (${paymentMethod})${note ? ` - ${note}` : ''}`,
      },
    });

    return { type: 'ok' as const, paymentId: payment.id, order: updated };
  });

  if (result.type === 'not_found')
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(
    { ok: true, paymentId: result.paymentId, order: result.order },
    { status: 201 }
  );
}
