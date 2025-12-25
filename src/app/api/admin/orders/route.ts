import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const querySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  orderStatus: z.string().optional(),
  paymentState: z.string().optional(),
  fulfillmentStatus: z.string().optional(),
  customerType: z.string().optional(),
  from: z.string().optional(), // yyyy-mm-dd
  to: z.string().optional(), // yyyy-mm-dd
  sort: z.enum(['newest', 'oldest', 'updated_desc', 'total_desc', 'total_asc']).default('newest'),
});

function parseDateRange(from?: string, to?: string) {
  const createdAt: any = {};
  if (from) createdAt.gte = new Date(`${from}T00:00:00.000Z`);
  if (to) createdAt.lte = new Date(`${to}T23:59:59.999Z`);
  return Object.keys(createdAt).length ? createdAt : undefined;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    q,
    page,
    pageSize,
    orderStatus,
    paymentState,
    fulfillmentStatus,
    customerType,
    from,
    to,
    sort,
  } = parsed.data;
  const skip = (page - 1) * pageSize;

  const where: any = {};

  if (q && q.trim()) {
    const qq = q.trim();
    where.OR = [
      { orderCode: { contains: qq, mode: 'insensitive' } },
      { orderNumber: { contains: qq, mode: 'insensitive' } },
      { customerEmail: { contains: qq, mode: 'insensitive' } },
      { customerPhone: { contains: qq, mode: 'insensitive' } },
      { buyerCompanyName: { contains: qq, mode: 'insensitive' } },
    ];
  }

  if (orderStatus && orderStatus !== 'ALL') where.orderStatus = orderStatus;
  if (paymentState && paymentState !== 'ALL') where.paymentState = paymentState;
  if (fulfillmentStatus && fulfillmentStatus !== 'ALL') where.fulfillmentStatus = fulfillmentStatus;
  if (customerType && customerType !== 'ALL') where.buyerType = customerType;

  const createdAt = parseDateRange(from, to);
  if (createdAt) where.createdAt = createdAt;

  const orderBy =
    sort === 'oldest'
      ? { createdAt: 'asc' as const }
      : sort === 'updated_desc'
        ? { updatedAt: 'desc' as const }
        : sort === 'total_desc'
          ? { total: 'desc' as const }
          : sort === 'total_asc'
            ? { total: 'asc' as const }
            : { createdAt: 'desc' as const };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        items: { select: { quantity: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    orders: orders.map((o) => ({
      id: o.id,
      orderCode: o.orderCode,
      orderNumber: o.orderNumber,
      userId: o.userId,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      buyerType: o.buyerType,
      buyerCompanyName: o.buyerCompanyName,
      subtotal: o.subtotal,
      total: o.total,
      currency: o.currency,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      paymentState: o.paymentState,
      orderStatus: o.orderStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      updatedAt: o.updatedAt,
      createdAt: o.createdAt,
      itemsCount: o.items.reduce((acc, it) => acc + (it.quantity || 0), 0),
    })),
  });
}
