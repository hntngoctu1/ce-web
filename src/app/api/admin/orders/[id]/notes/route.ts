import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { addNoteSchema } from '@/lib/validation/admin-orders';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = addNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id } = await params;
  const { noteInternal, noteCustomer } = parsed.data;

  if (!noteInternal && !noteCustomer) {
    return NextResponse.json({ error: 'At least one note is required' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, orderStatus: true },
  });
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.orderStatusHistory.create({
    data: {
      orderId: id,
      fromStatus: order.orderStatus,
      toStatus: order.orderStatus,
      actorAdminId: session.user.id,
      noteInternal: noteInternal?.trim() || null,
      noteCustomer: noteCustomer?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true });
}
