import { prisma } from '@/lib/db';

export type AdminAnalyticsFilters = {
  from: Date;
  to: Date;
  accountingStatus?: string;
  customerKind?: 'INDIVIDUAL' | 'BUSINESS';
  productId?: string;
  dueInDays?: number;
  companyQuery?: string;
};

export function parseDateRange(params: Record<string, string | string[] | undefined>) {
  const now = new Date();
  const range = (Array.isArray(params.range) ? params.range[0] : params.range) || '30d';

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  if (range === 'today') {
    return { from: startOfDay(now), to: endOfDay(now), range };
  }
  if (range === '7d') {
    const from = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
    return { from, to: endOfDay(now), range };
  }
  if (range === '30d') {
    const from = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
    return { from, to: endOfDay(now), range };
  }
  if (range === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = endOfDay(now);
    return { from, to, range };
  }

  const fromStr = Array.isArray(params.from) ? params.from[0] : params.from;
  const toStr = Array.isArray(params.to) ? params.to[0] : params.to;
  const from = fromStr
    ? startOfDay(new Date(fromStr))
    : startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
  const to = toStr ? endOfDay(new Date(toStr)) : endOfDay(now);
  return { from, to, range: 'custom' as const };
}

function ymd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function getRevenueDashboardData(filters: AdminAnalyticsFilters) {
  const { from, to, accountingStatus, customerKind, productId } = filters;

  // Keep a split between:
  // - base filters (status/customer/product) and
  // - date window filters
  //
  // This avoids a common reporting pitfall where revenue (payments) is accidentally limited
  // to orders created in the date range, instead of payments recorded in the date range.
  const baseOrderWhere: any = {};
  if (accountingStatus) baseOrderWhere.accountingStatus = accountingStatus;
  if (customerKind) baseOrderWhere.customerKind = customerKind;
  if (productId) baseOrderWhere.items = { some: { productId } };

  // Simplified: Use createdAt for order date filtering (orderDate will be populated by backfill script)
  const ordersWhere: any = {
    ...baseOrderWhere,
    createdAt: { gte: from, lte: to },
  };

  // For payments, we need to match orders by date range
  // Payments are linked to orders, so we filter by paymentDate and by base order filters.
  // (Do NOT also filter by order createdAt, otherwise you miss payments for older orders.)
  const paymentWhere: any = {
    paymentDate: { gte: from, lte: to },
    order: {
      ...baseOrderWhere,
    },
  };

  const [payments, orders] = await Promise.all([
    (prisma.payment.findMany as any)({
      where: paymentWhere,
      select: { amount: true, paymentDate: true },
    }),
    (prisma.order.findMany as any)({
      where: ordersWhere,
      select: {
        id: true,
        totalAmount: true,
        paidAmount: true,
        outstandingAmount: true,
        accountingStatus: true,
        orderStatus: true,
        orderDate: true,
        total: true, // Fallback for old orders
      },
    }),
  ]);

  // Revenue series (by day)
  const buckets = new Map<string, number>();
  payments.forEach((p: any) => {
    const k = ymd(new Date(p.paymentDate));
    buckets.set(k, (buckets.get(k) || 0) + Number(p.amount));
  });
  const series: { date: string; value: number }[] = [];
  for (let d = new Date(from); d <= to; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
    const k = ymd(d);
    series.push({ date: k, value: Number(buckets.get(k) || 0) });
  }

  const totalRevenue = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  // Use nullish-coalescing so 0 is treated as a valid value (avoid inflating numbers).
  const outstandingDebt = orders.reduce(
    (sum: number, o: any) => sum + Number(o.outstandingAmount ?? o.totalAmount ?? o.total ?? 0),
    0
  );

  const completedOrders = orders.filter((o: any) => o.accountingStatus === 'COMPLETED').length;
  const paidOrPartial = orders.filter((o: any) => Number(o.paidAmount || 0) > 0);
  const aov =
    paidOrPartial.length > 0
      ? paidOrPartial.reduce(
          (sum: number, o: any) => sum + Number(o.totalAmount ?? o.total ?? 0),
          0
        ) / paidOrPartial.length
      : 0;

  // Pie status (by accounting status)
  const statusAmounts = new Map<string, number>();
  orders.forEach((o: any) => {
    const key = o.accountingStatus || 'UNKNOWN';
    statusAmounts.set(key, (statusAmounts.get(key) || 0) + Number(o.totalAmount ?? o.total ?? 0));
  });
  const statusPie = Array.from(statusAmounts.entries()).map(([key, value]) => ({ key, value }));

  // Top products table (revenue proxy from order items)
  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        ...ordersWhere,
        paymentState: { in: ['PAID', 'PARTIAL'] },
      },
      ...(productId ? { productId } : {}),
    },
    select: { productName: true, totalPrice: true },
  });
  const prodMap = new Map<string, number>();
  items.forEach((it: any) => {
    const name = it.productName || 'Unknown';
    prodMap.set(name, (prodMap.get(name) || 0) + Number(it.totalPrice || 0));
  });
  const topProducts = Array.from(prodMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return {
    totalRevenue,
    outstandingDebt,
    completedOrders,
    aov,
    series,
    statusPie,
    topProducts,
  };
}

export async function getReceivables(filters: AdminAnalyticsFilters & { overdueOnly?: boolean }) {
  const {
    from,
    to,
    accountingStatus,
    customerKind,
    productId,
    overdueOnly,
    dueInDays,
    companyQuery,
  } = filters;
  const where: any = {
    outstandingAmount: { gt: 0 },
    accountingStatus: accountingStatus || { in: ['PENDING_PAYMENT', 'PARTIALLY_PAID'] },
  };
  const and: any[] = [];
  if (customerKind) where.customerKind = customerKind;
  if (productId) where.items = { some: { productId } };
  if (from && to) {
    // Simplified: Use createdAt for date filtering
    where.createdAt = { gte: from, lte: to };
  }
  if (overdueOnly) {
    and.push({ dueDate: { lt: new Date() } });
  }
  if (dueInDays && dueInDays > 0) {
    and.push({
      dueDate: { lte: new Date(Date.now() + dueInDays * 24 * 60 * 60 * 1000) },
    });
  }
  if (companyQuery && companyQuery.trim()) {
    const qq = companyQuery.trim();
    and.push({
      OR: [
        { buyerCompanyName: { contains: qq, mode: 'insensitive' } },
        { customerName: { contains: qq, mode: 'insensitive' } },
        { invoiceNo: { contains: qq, mode: 'insensitive' } },
        { orderCode: { contains: qq, mode: 'insensitive' } },
      ],
    });
  }
  if (and.length > 0) where.AND = and;

  const orders = await (prisma.order.findMany as any)({
    where,
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      orderCode: true,
      orderNumber: true,
      customerName: true,
      buyerCompanyName: true,
      customerKind: true,
      totalAmount: true,
      paidAmount: true,
      outstandingAmount: true,
      dueDate: true,
      invoiceNo: true,
      orderDate: true,
      accountingStatus: true,
    },
  });

  const totalOutstanding = orders.reduce(
    (sum: number, o: any) => sum + Number(o.outstandingAmount ?? o.totalAmount ?? o.total ?? 0),
    0
  );
  const overdueAmount = orders
    .filter((o: any) => o.dueDate && new Date(o.dueDate).getTime() < Date.now())
    .reduce(
      (sum: number, o: any) => sum + Number(o.outstandingAmount ?? o.totalAmount ?? o.total ?? 0),
      0
    );

  return { orders, totalOutstanding, overdueAmount };
}
