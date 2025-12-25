import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { parseDateRange } from '@/lib/admin/analytics';

function csvEscape(v: unknown) {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const { from, to } = parseDateRange(params as any);
  const customerKind = url.searchParams.get('customerKind') || null;
  const accountingStatus = url.searchParams.get('accountingStatus') || null;
  const productId = url.searchParams.get('productId') || null;

  const where: any = {
    paymentDate: { gte: from, lte: to },
  };
  if (customerKind || accountingStatus || productId) {
    where.order = {
      ...(customerKind ? { customerKind } : {}),
      ...(accountingStatus ? { accountingStatus } : {}),
      ...(productId ? { items: { some: { productId } } } : {}),
    };
  }

  const payments = await prisma.payment.findMany({
    where,
    orderBy: [{ paymentDate: 'asc' }],
    select: {
      paymentDate: true,
      amount: true,
      paymentMethod: true,
      order: {
        select: {
          orderCode: true,
          customerName: true,
          buyerCompanyName: true,
          customerKind: true,
          accountingStatus: true,
        },
      },
    },
  });

  const header = [
    'payment_date',
    'order_code',
    'customer',
    'company',
    'customer_kind',
    'accounting_status',
    'method',
    'amount',
  ];
  const rows = (payments as any[]).map((p) => [
    new Date(p.paymentDate).toISOString(),
    p.order?.orderCode || '',
    p.order?.customerName || '',
    p.order?.buyerCompanyName || '',
    p.order?.customerKind || '',
    p.order?.accountingStatus || '',
    p.paymentMethod,
    p.amount,
  ]);

  // Add UTF-8 BOM for Excel compatibility (Vietnamese text, etc.)
  const body = '\ufeff' + [header, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n');
  const filename = `revenue_${from.toISOString().slice(0, 10)}_${to.toISOString().slice(0, 10)}.csv`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
