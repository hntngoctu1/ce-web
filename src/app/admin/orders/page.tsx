import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatDate, formatPrice } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, ExternalLink } from 'lucide-react';
import { OrdersBulkBar } from '@/components/admin/orders-bulk-bar';

export const metadata: Metadata = {
  title: 'Orders - Admin - Creative Engineering',
};

const ITEMS_PER_PAGE = 20;

type OrderStatusFilter =
  | 'ALL'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'PACKING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELED'
  | 'FAILED'
  | 'RETURN_REQUESTED'
  | 'RETURNED';

type PaymentStateFilter = 'ALL' | 'UNPAID' | 'PAID' | 'REFUNDED' | 'PARTIAL';
type FulfillmentFilter = 'ALL' | 'UNFULFILLED' | 'PACKING' | 'SHIPPED' | 'DELIVERED' | 'RETURNED';

function safeStatus(s?: string | null) {
  return (s || 'PENDING_CONFIRMATION').toUpperCase();
}

function badgeForOrderStatus(status: string) {
  const s = safeStatus(status);
  if (s === 'DELIVERED') return { key: 'DELIVERED', variant: 'ce' as const };
  if (s === 'SHIPPED') return { key: 'SHIPPED', variant: 'featured' as const };
  if (s === 'PACKING') return { key: 'PACKING', variant: 'secondary' as const };
  if (s === 'CONFIRMED') return { key: 'CONFIRMED', variant: 'secondary' as const };
  if (s === 'CANCELED') return { key: 'CANCELED', variant: 'destructive' as const };
  if (s === 'FAILED') return { key: 'FAILED', variant: 'destructive' as const };
  if (s === 'RETURN_REQUESTED') return { key: 'RETURN_REQUESTED', variant: 'outline' as const };
  if (s === 'RETURNED') return { key: 'RETURNED', variant: 'outline' as const };
  return { key: 'PENDING_CONFIRMATION', variant: 'secondary' as const };
}

function badgeForPaymentState(state?: string | null) {
  const s = (state || 'UNPAID').toUpperCase();
  if (s === 'PAID') return { key: 'PAID', variant: 'ce' as const };
  if (s === 'PARTIAL') return { key: 'PARTIAL', variant: 'featured' as const };
  if (s === 'REFUNDED') return { key: 'REFUNDED', variant: 'outline' as const };
  return { key: 'UNPAID', variant: 'secondary' as const };
}

function badgeForFulfillment(state?: string | null) {
  const s = (state || 'UNFULFILLED').toUpperCase();
  if (s === 'DELIVERED') return { key: 'DELIVERED', variant: 'ce' as const };
  if (s === 'SHIPPED') return { key: 'SHIPPED', variant: 'featured' as const };
  if (s === 'PACKING') return { key: 'PACKING', variant: 'secondary' as const };
  if (s === 'RETURNED') return { key: 'RETURNED', variant: 'outline' as const };
  return { key: 'UNFULFILLED', variant: 'secondary' as const };
}

interface OrdersPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    orderStatus?: OrderStatusFilter;
    paymentState?: PaymentStateFilter;
    fulfillmentStatus?: FulfillmentFilter;
    customerType?: 'ALL' | 'PERSONAL' | 'BUSINESS';
    from?: string; // yyyy-mm-dd
    to?: string; // yyyy-mm-dd
    sort?: 'newest' | 'oldest' | 'updated_desc' | 'total_desc' | 'total_asc';
  }>;
}

function buildQueryString(params: Record<string, string | undefined>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) usp.set(k, v);
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

async function getOrders(params: {
  q?: string;
  page?: string;
  orderStatus?: string;
  paymentState?: string;
  fulfillmentStatus?: string;
  customerType?: string;
  from?: string;
  to?: string;
  sort?: string;
}) {
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: any = {};

  if (params.q) {
    const q = params.q.trim();
    if (q) {
      where.OR = [
        { orderCode: { contains: q, mode: 'insensitive' } },
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { customerEmail: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
        { buyerCompanyName: { contains: q, mode: 'insensitive' } },
      ];
    }
  }

  if (params.orderStatus && params.orderStatus !== 'ALL') where.orderStatus = params.orderStatus;
  if (params.paymentState && params.paymentState !== 'ALL')
    where.paymentState = params.paymentState;
  if (params.fulfillmentStatus && params.fulfillmentStatus !== 'ALL')
    where.fulfillmentStatus = params.fulfillmentStatus;
  if (params.customerType && params.customerType !== 'ALL') where.buyerType = params.customerType;

  if (params.from || params.to) {
    const createdAt: any = {};
    if (params.from) createdAt.gte = new Date(`${params.from}T00:00:00.000Z`);
    if (params.to) createdAt.lte = new Date(`${params.to}T23:59:59.999Z`);
    where.createdAt = createdAt;
  }

  const sort = params.sort || 'newest';
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
      take: ITEMS_PER_PAGE,
      include: { items: true },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    total,
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)),
  };
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const t = await getTranslations('admin');
  const params = await searchParams;
  const { orders, total, totalPages, currentPage } = await getOrders(params);

  const qsBase: Record<string, string | undefined> = {
    q: params.q,
    orderStatus:
      params.orderStatus && params.orderStatus !== 'ALL' ? params.orderStatus : undefined,
    paymentState:
      params.paymentState && params.paymentState !== 'ALL' ? params.paymentState : undefined,
    fulfillmentStatus:
      params.fulfillmentStatus && params.fulfillmentStatus !== 'ALL'
        ? params.fulfillmentStatus
        : undefined,
    customerType:
      params.customerType && params.customerType !== 'ALL' ? params.customerType : undefined,
    from: params.from,
    to: params.to,
    sort: params.sort,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heavy">{t('orders.title')}</h1>
          <p className="text-muted-foreground">{t('orders.subtitle')}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {t('orders.showing', { count: String(orders.length), total: String(total) })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('common.filters')}</CardTitle>
          <CardDescription>{t('orders.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-12">
            <div className="relative md:col-span-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder={t('orders.searchPlaceholder')}
                defaultValue={params.q}
                className="pl-10"
              />
            </div>

            <div className="md:col-span-2">
              <select
                name="orderStatus"
                defaultValue={params.orderStatus || 'ALL'}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ALL">{t('orders.filters.allStatuses')}</option>
                <option value="PENDING_CONFIRMATION">
                  {t('orders.statusLabels.PENDING_CONFIRMATION')}
                </option>
                <option value="CONFIRMED">{t('orders.statusLabels.CONFIRMED')}</option>
                <option value="PACKING">{t('orders.statusLabels.PACKING')}</option>
                <option value="SHIPPED">{t('orders.statusLabels.SHIPPED')}</option>
                <option value="DELIVERED">{t('orders.statusLabels.DELIVERED')}</option>
                <option value="CANCELED">{t('orders.statusLabels.CANCELED')}</option>
                <option value="FAILED">{t('orders.statusLabels.FAILED')}</option>
                <option value="RETURN_REQUESTED">
                  {t('orders.statusLabels.RETURN_REQUESTED')}
                </option>
                <option value="RETURNED">{t('orders.statusLabels.RETURNED')}</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                name="paymentState"
                defaultValue={params.paymentState || 'ALL'}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ALL">{t('orders.filters.allPayments')}</option>
                <option value="UNPAID">{t('orders.paymentLabels.UNPAID')}</option>
                <option value="PAID">{t('orders.paymentLabels.PAID')}</option>
                <option value="PARTIAL">{t('orders.paymentLabels.PARTIAL')}</option>
                <option value="REFUNDED">{t('orders.paymentLabels.REFUNDED')}</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                name="fulfillmentStatus"
                defaultValue={params.fulfillmentStatus || 'ALL'}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ALL">{t('orders.filters.allFulfillment')}</option>
                <option value="UNFULFILLED">{t('orders.fulfillmentLabels.UNFULFILLED')}</option>
                <option value="PACKING">{t('orders.fulfillmentLabels.PACKING')}</option>
                <option value="SHIPPED">{t('orders.fulfillmentLabels.SHIPPED')}</option>
                <option value="DELIVERED">{t('orders.fulfillmentLabels.DELIVERED')}</option>
                <option value="RETURNED">{t('orders.fulfillmentLabels.RETURNED')}</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                name="customerType"
                defaultValue={params.customerType || 'ALL'}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ALL">{t('orders.filters.allCustomers')}</option>
                <option value="PERSONAL">{t('orders.customerTypeLabels.PERSONAL')}</option>
                <option value="BUSINESS">{t('orders.customerTypeLabels.BUSINESS')}</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Input type="date" name="from" defaultValue={params.from} />
            </div>
            <div className="md:col-span-2">
              <Input type="date" name="to" defaultValue={params.to} />
            </div>

            <div className="md:col-span-2">
              <select
                name="sort"
                defaultValue={params.sort || 'newest'}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="newest">{t('orders.filters.sortNewest')}</option>
                <option value="oldest">{t('orders.filters.sortOldest')}</option>
                <option value="updated_desc">{t('orders.filters.sortUpdatedDesc')}</option>
                <option value="total_desc">{t('orders.filters.sortTotalDesc')}</option>
                <option value="total_asc">{t('orders.filters.sortTotalAsc')}</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Button type="submit" variant="ce" className="w-full">
                {t('common.apply')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('orders.listTitle')}</CardTitle>
            <CardDescription>
              {t('orders.showing', { count: String(orders.length), total: String(total) })}
            </CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link
              href={`/api/admin/orders${buildQueryString({ ...qsBase, page: String(currentPage) })}`}
              target="_blank"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              API
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <OrdersBulkBar checkboxName="orderIds" />
          </div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[48px]">
                    <span className="sr-only">{t('orders.table.select')}</span>
                  </TableHead>
                  <TableHead>{t('orders.table.order')}</TableHead>
                  <TableHead>{t('orders.table.customer')}</TableHead>
                  <TableHead>{t('orders.table.total')}</TableHead>
                  <TableHead>{t('orders.table.payment')}</TableHead>
                  <TableHead>{t('orders.table.orderStatus')}</TableHead>
                  <TableHead>{t('orders.table.fulfillment')}</TableHead>
                  <TableHead>{t('orders.table.created')}</TableHead>
                  <TableHead>{t('orders.table.updated')}</TableHead>
                  <TableHead className="text-right">{t('orders.table.action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => {
                  const code = o.orderCode || o.orderNumber;
                  const customerLine2 = [o.buyerCompanyName, o.customerEmail, o.customerPhone]
                    .filter(Boolean)
                    .join(' • ');
                  const totalFormatted = formatPrice(o.total, o.currency || 'VND');
                  const pay = badgeForPaymentState((o as any).paymentState);
                  const st = badgeForOrderStatus((o as any).orderStatus);
                  const ff = badgeForFulfillment((o as any).fulfillmentStatus);
                  return (
                    <TableRow key={o.id}>
                      <TableCell>
                        <input type="checkbox" name="orderIds" value={o.id} />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-medium hover:underline"
                        >
                          {code}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {o.transactionRef ? `TX: ${o.transactionRef}` : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{o.customerName}</div>
                        <div className="text-xs text-muted-foreground">{customerLine2 || '—'}</div>
                      </TableCell>
                      <TableCell className="font-medium">{totalFormatted}</TableCell>
                      <TableCell>
                        <Badge variant={pay.variant as any}>
                          {t(`orders.paymentLabels.${pay.key}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={st.variant as any}>
                          {t(`orders.statusLabels.${st.key}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ff.variant as any}>
                          {t(`orders.fulfillmentLabels.${ff.key}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(o.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(o.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/orders/${o.id}`}>{t('common.open')}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                      {t('orders.empty')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page <span className="font-medium text-foreground">{currentPage}</span> of{' '}
                <span className="font-medium text-foreground">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/admin/orders${buildQueryString({ ...qsBase, page: String(currentPage - 1) })}`}
                    >
                      Previous
                    </Link>
                  </Button>
                )}
                {currentPage < totalPages && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/admin/orders${buildQueryString({ ...qsBase, page: String(currentPage + 1) })}`}
                    >
                      Next
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
