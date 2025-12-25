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
  const overdue = url.searchParams.get('overdue') === 'true';
  const dueIn = url.searchParams.get('dueIn');
  const q = url.searchParams.get('q');

  const where: any = {
    // Align with analytics dashboard: use createdAt as the date filter for now.
    // (orderDate will be reliably populated by the backfill script.)
    createdAt: { gte: from, lte: to },
    outstandingAmount: { gt: 0 },
    accountingStatus: { in: ['PENDING_PAYMENT', 'PARTIALLY_PAID'] },
  };
  if (customerKind) where.customerKind = customerKind;
  if (overdue) where.dueDate = { lt: new Date() };
  if (dueIn && !Number.isNaN(Number(dueIn))) {
    where.dueDate = {
      ...(where.dueDate || {}),
      lte: new Date(Date.now() + Number(dueIn) * 24 * 60 * 60 * 1000),
    };
  }
  if (q) {
    // Note: keep filters compatible with SQLite nullable string filters (avoid `mode` here)
    where.OR = [
      { buyerCompanyName: { contains: q } },
      { customerName: { contains: q } },
      { invoiceNo: { contains: q } },
      { orderCode: { contains: q } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    select: {
      orderCode: true,
      invoiceNo: true,
      customerName: true,
      buyerCompanyName: true,
      customerKind: true,
      totalAmount: true,
      paidAmount: true,
      outstandingAmount: true,
      dueDate: true,
      accountingStatus: true,
    },
  });

  const header = [
    'order_code',
    'invoice_no',
    'customer',
    'company',
    'customer_kind',
    'total',
    'paid',
    'outstanding',
    'due_date',
    'status',
  ];
  const rows = orders.map((o) => [
    o.orderCode || '',
    o.invoiceNo || '',
    o.customerName || '',
    o.buyerCompanyName || '',
    o.customerKind || '',
    o.totalAmount,
    o.paidAmount,
    o.outstandingAmount,
    o.dueDate ? o.dueDate.toISOString().slice(0, 10) : '',
    o.accountingStatus,
  ]);

  // Add UTF-8 BOM for Excel compatibility (Vietnamese text, etc.)
  const body = '\ufeff' + [header, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n');
  const filename = `debt_${from.toISOString().slice(0, 10)}_${to.toISOString().slice(0, 10)}.csv`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
