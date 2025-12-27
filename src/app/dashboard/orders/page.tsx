import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatDate, formatPrice } from '@/lib/utils';
import { toBCP47Locale } from '@/lib/i18n/locale';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Use new OrderStatus enum values for consistent filtering
type StatusFilter = 'ALL' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';

// Map URL params to OrderStatus values
const STATUS_MAP: Record<string, StatusFilter> = {
  'ALL': 'ALL',
  'PENDING': 'PENDING_CONFIRMATION',
  'CONFIRMED': 'CONFIRMED',
  'SHIPPED': 'SHIPPED',
  'DELIVERED': 'DELIVERED',
  'CANCELLED': 'CANCELED',
  'CANCELED': 'CANCELED',
  // Also support direct OrderStatus values
  'PENDING_CONFIRMATION': 'PENDING_CONFIRMATION',
};

export default async function OrdersPage({ searchParams }: { searchParams?: { status?: string } }) {
  const locale = await getLocale();
  const fmtLocale = toBCP47Locale(locale);
  const t = await getTranslations('customerOrders');
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/orders');
  }

  const requested = (searchParams?.status || 'ALL').toUpperCase();
  const activeStatus: StatusFilter = STATUS_MAP[requested] || 'ALL';

  const statusConfig: Record<StatusFilter, { badge: any; label: string }> = {
    ALL: { badge: 'secondary', label: 'ALL' },
    PENDING_CONFIRMATION: { badge: 'secondary', label: 'PENDING' },
    CONFIRMED: { badge: 'featured', label: 'CONFIRMED' },
    SHIPPED: { badge: 'featured', label: 'SHIPPED' },
    DELIVERED: { badge: 'ce', label: 'DELIVERED' },
    CANCELED: { badge: 'destructive', label: 'CANCELLED' },
  };

  const statusLabel = (k: StatusFilter) => {
    // Use the mapped label for translations
    const translationKey = statusConfig[k]?.label || k;
    return t(`status.${translationKey}`);
  };

  const paymentMethodLabel = (paymentMethod?: string | null) => {
    if (!paymentMethod) return t('paymentMethod.unknown');
    if (paymentMethod === 'cod') return t('paymentMethod.cod');
    if (paymentMethod === 'bank_transfer') return t('paymentMethod.bank_transfer');
    return paymentMethod;
  };

  const paymentStatusLabel = (status?: string | null) => {
    if (!status) return t('paymentStatus.unknown');
    const upper = status.toUpperCase();
    if (upper === 'PENDING') return t('paymentStatus.PENDING');
    if (upper === 'PAID') return t('paymentStatus.PAID');
    if (upper === 'FAILED') return t('paymentStatus.FAILED');
    if (upper === 'REFUNDED') return t('paymentStatus.REFUNDED');
    return status;
  };

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where: {
        userId: session.user.id,
        ...(activeStatus === 'ALL' ? {} : { orderStatus: activeStatus }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { items: true },
    }),
    Promise.all([
      prisma.order.count({ where: { userId: session.user.id } }).then((n) => ['ALL', n] as const),
      prisma.order
        .count({ where: { userId: session.user.id, orderStatus: 'PENDING_CONFIRMATION' } })
        .then((n) => ['PENDING_CONFIRMATION', n] as const),
      prisma.order
        .count({ where: { userId: session.user.id, orderStatus: 'CONFIRMED' } })
        .then((n) => ['CONFIRMED', n] as const),
      prisma.order
        .count({ where: { userId: session.user.id, orderStatus: 'SHIPPED' } })
        .then((n) => ['SHIPPED', n] as const),
      prisma.order
        .count({ where: { userId: session.user.id, orderStatus: 'DELIVERED' } })
        .then((n) => ['DELIVERED', n] as const),
      prisma.order
        .count({ where: { userId: session.user.id, orderStatus: 'CANCELED' } })
        .then((n) => ['CANCELED', n] as const),
    ]).then((pairs) => Object.fromEntries(pairs) as Record<StatusFilter, number>),
  ]);

  return (
    <div className="ce-section">
      <div className="ce-container space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-heavy">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">{t('backToDashboard')}</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('filtersTitle')}</CardTitle>
            <CardDescription>{t('filtersSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'PENDING_CONFIRMATION', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELED'] as StatusFilter[]).map(
                (key) => {
                  const isActive = key === activeStatus;
                  const href =
                    key === 'ALL' ? '/dashboard/orders' : `/dashboard/orders?status=${key}`;
                  return (
                    <Link
                      key={key}
                      href={href}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
                        isActive
                          ? 'border-ce-primary bg-ce-primary/10 text-ce-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span className="font-medium">{statusLabel(key)}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {counts[key] ?? 0}
                      </span>
                    </Link>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>{t('listTitle')}</CardTitle>
                <CardDescription>
                  {activeStatus === 'ALL'
                    ? t('listDescAll')
                    : t('listDescFiltered', { status: statusLabel(activeStatus) })}
                </CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                {t('totalLabel')}{' '}
                <span className="font-medium text-foreground">{counts.ALL ?? 0}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">{t('emptyTitle')}</p>
                <Button variant="ce" className="mt-4" asChild>
                  <Link href="/menu/product">{t('emptyCta')}</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('table.order')}</TableHead>
                        <TableHead>{t('table.date')}</TableHead>
                        <TableHead className="text-right">{t('table.items')}</TableHead>
                        <TableHead className="text-right">{t('table.total')}</TableHead>
                        <TableHead>{t('table.payment')}</TableHead>
                        <TableHead>{t('table.status')}</TableHead>
                        <TableHead className="text-right">{t('table.action')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((o) => {
                        const st = o.orderStatus as StatusFilter;
                        const stMeta = statusConfig[st] ?? statusConfig.PENDING_CONFIRMATION;
                        const date = formatDate(o.createdAt, fmtLocale, {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                        });
                        const total = formatPrice(o.total.toNumber(), o.currency || 'VND', fmtLocale);
                        const itemsCount =
                          o.items?.reduce((acc, it) => acc + (it.quantity || 0), 0) ?? 0;
                        return (
                          <TableRow key={o.id}>
                            <TableCell className="font-medium">
                              <Link href={`/dashboard/orders/${o.id}`} className="hover:underline">
                                {o.orderNumber}
                              </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{date}</TableCell>
                            <TableCell className="text-right">{itemsCount}</TableCell>
                            <TableCell className="text-right font-medium">{total}</TableCell>
                            <TableCell className="text-muted-foreground">
                              <div className="text-sm">{paymentMethodLabel(o.paymentMethod)}</div>
                              <div className="text-xs text-muted-foreground">
                                {paymentStatusLabel(o.paymentStatus)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={stMeta.badge as any}>{statusLabel(st)}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/dashboard/orders/${o.id}`}>{t('table.view')}</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile cards */}
                <div className="grid gap-3 md:hidden">
                  {orders.map((o) => {
                    const st = o.orderStatus as StatusFilter;
                    const stMeta = statusConfig[st] ?? statusConfig.PENDING_CONFIRMATION;
                    const date = formatDate(o.createdAt, fmtLocale);
                    const total = formatPrice(o.total.toNumber(), o.currency || 'VND', fmtLocale);
                    const itemsCount =
                      o.items?.reduce((acc, it) => acc + (it.quantity || 0), 0) ?? 0;
                    return (
                      <Link
                        key={o.id}
                        href={`/dashboard/orders/${o.id}`}
                        className="rounded-lg border p-4 hover:bg-muted/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold">{o.orderNumber}</div>
                            <div className="text-sm text-muted-foreground">{date}</div>
                          </div>
                          <Badge variant={stMeta.badge as any}>{statusLabel(st)}</Badge>
                        </div>
                        <Separator className="my-3" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {itemsCount} {t('itemsShort')}
                          </span>
                          <span className="font-semibold">{total}</span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {paymentMethodLabel(o.paymentMethod)} •{' '}
                          {paymentStatusLabel(o.paymentStatus)}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
