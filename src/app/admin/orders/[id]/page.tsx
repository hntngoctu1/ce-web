import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { formatDate, formatPrice } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrderActions } from '@/components/admin/order-actions';

export const metadata: Metadata = {
  title: 'Order detail - Admin - Creative Engineering',
};

type BuyerSnapshot = {
  customerType?: 'PERSONAL' | 'BUSINESS';
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  taxId?: string;
  companyEmail?: string;
};

type AddressSnapshot = {
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  companyName?: string;
  taxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  district?: string;
  city?: string;
  province?: string;
  country?: string;
};

function safeJsonParse<T>(input: string | null | undefined): T | null {
  if (!input) return null;
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

function badgeForOrderStatus(status?: string | null) {
  const s = (status || 'PENDING_CONFIRMATION').toUpperCase();
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

function addressBlock(addr: AddressSnapshot | null, fallback?: string | null) {
  const line1 = addr?.addressLine1 || fallback || '—';
  const line2 = [addr?.district, addr?.city, addr?.province].filter(Boolean).join(', ');
  const contact = [addr?.recipientName, addr?.recipientPhone, addr?.recipientEmail]
    .filter(Boolean)
    .join(' • ');
  const company = [addr?.companyName, addr?.taxId ? `MST: ${addr.taxId}` : null]
    .filter(Boolean)
    .join(' • ');

  return (
    <div className="space-y-1 text-sm">
      <div className="font-medium">{line1}</div>
      {line2 ? <div className="text-muted-foreground">{line2}</div> : null}
      {contact ? <div className="text-muted-foreground">{contact}</div> : null}
      {company ? <div className="text-muted-foreground">{company}</div> : null}
    </div>
  );
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const t = await getTranslations('admin');
  const ta = await getTranslations('auth');
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: 'desc' }, include: { actor: true }, take: 50 },
    },
  });

  if (!order) notFound();

  const code = order.orderCode || order.orderNumber;
  const currency = order.currency || 'VND';
  const buyer = safeJsonParse<BuyerSnapshot>(order.buyerSnapshot) || {
    customerType: (order.buyerType as any) || 'PERSONAL',
    companyName: order.buyerCompanyName || undefined,
    taxId: order.buyerTaxId || undefined,
    companyEmail: order.buyerCompanyEmail || undefined,
    name: order.customerName,
    email: order.customerEmail,
    phone: order.customerPhone || undefined,
  };
  const shipping = safeJsonParse<AddressSnapshot>(order.shippingSnapshot);
  const billing = safeJsonParse<AddressSnapshot>(order.billingSnapshot);

  const st = badgeForOrderStatus((order as any).orderStatus);
  const pay = badgeForPaymentState((order as any).paymentState);
  const ff = badgeForFulfillment((order as any).fulfillmentStatus);

  const itemsCount = order.items.reduce((acc, it) => acc + (it.quantity || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">
            <Link href="/admin/orders" className="hover:underline">
              {t('orders.title')}
            </Link>{' '}
            <span className="mx-1">/</span>
            <span>{code}</span>
          </div>
          <h1 className="text-3xl font-heavy">{code}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={st.variant as any}>{t(`orders.statusLabels.${st.key}`)}</Badge>
            <Badge variant={pay.variant as any}>{t(`orders.paymentLabels.${pay.key}`)}</Badge>
            <Badge variant={ff.variant as any}>{t(`orders.fulfillmentLabels.${ff.key}`)}</Badge>
            <span className="text-sm text-muted-foreground">
              {t('orders.table.created')}:{' '}
              <span className="text-foreground">{formatDate(order.createdAt)}</span>
            </span>
            <span className="text-sm text-muted-foreground">
              {t('orders.table.updated')}:{' '}
              <span className="text-foreground">{formatDate(order.updatedAt)}</span>
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/orders">{t('common.backToList')}</Link>
          </Button>
          {order.userId ? (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/orders/${order.id}`} target="_blank">
                {t('orders.detail.viewCustomerPage')}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('orders.detail.items')}</CardTitle>
              <CardDescription>
                {t('orders.detail.itemsHint', { count: String(itemsCount) })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('orders.detail.product')}</TableHead>
                      <TableHead className="text-right">{t('orders.detail.qty')}</TableHead>
                      <TableHead className="text-right">{t('orders.detail.unit')}</TableHead>
                      <TableHead className="text-right">{t('orders.table.total')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell>
                          <div className="font-medium">{it.productName}</div>
                          {it.productSku ? (
                            <div className="text-xs text-muted-foreground">
                              SKU: {it.productSku}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-right">{it.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatPrice(it.unitPrice, currency)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(it.totalPrice, currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('orders.detail.buyerAndAddresses')}</CardTitle>
              <CardDescription>{t('orders.detail.buyerAndAddressesHint')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="mb-2 font-semibold">{t('orders.detail.shipping')}</div>
                  {addressBlock(shipping, order.shippingAddress)}
                </div>
                <div className="rounded-lg border p-4">
                  <div className="mb-2 font-semibold">{t('orders.detail.billing')}</div>
                  {addressBlock(billing, order.billingAddress)}
                </div>
              </div>

              <Separator />

              <div className="rounded-lg border p-4">
                <div className="mb-2 font-semibold">{t('orders.detail.buyer')}</div>
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">{t('orders.detail.buyerType')}:</span>{' '}
                    <span className="font-medium">
                      {buyer.customerType === 'BUSINESS'
                        ? ta('customerTypeBusiness')
                        : ta('customerTypePersonal')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('orders.detail.buyerName')}:</span>{' '}
                    <span className="font-medium">{buyer.name || order.customerName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('orders.detail.buyerEmail')}:</span>{' '}
                    <span className="font-medium">{buyer.email || order.customerEmail}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('orders.detail.buyerPhone')}:</span>{' '}
                    <span className="font-medium">{buyer.phone || order.customerPhone || '—'}</span>
                  </div>
                  {buyer.companyName ? (
                    <div>
                      <span className="text-muted-foreground">
                        {t('orders.detail.buyerCompany')}:
                      </span>{' '}
                      <span className="font-medium">{buyer.companyName}</span>
                    </div>
                  ) : null}
                  {buyer.taxId ? (
                    <div>
                      <span className="text-muted-foreground">
                        {t('orders.detail.buyerTaxId')}:
                      </span>{' '}
                      <span className="font-medium">{buyer.taxId}</span>
                    </div>
                  ) : null}
                  {buyer.companyEmail ? (
                    <div>
                      <span className="text-muted-foreground">
                        {t('orders.detail.buyerCompanyEmail')}:
                      </span>{' '}
                      <span className="font-medium">{buyer.companyEmail}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('orders.detail.statusHistory')}</CardTitle>
              <CardDescription>{t('orders.detail.statusHistoryHint')}</CardDescription>
            </CardHeader>
            <CardContent>
              {order.statusHistory.length === 0 ? (
                <div className="text-sm text-muted-foreground">{t('orders.detail.noHistory')}</div>
              ) : (
                <div className="space-y-3">
                  {order.statusHistory.map((h) => (
                    <div key={h.id} className="rounded-lg border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm">
                          <span className="font-medium">{h.toStatus}</span>
                          {h.fromStatus ? (
                            <span className="text-muted-foreground"> (from {h.fromStatus})</span>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(h.createdAt)} • {h.actor?.email || 'system'}
                        </div>
                      </div>
                      {h.noteInternal ? (
                        <div className="mt-2 text-sm text-muted-foreground">{h.noteInternal}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <OrderActions
              orderId={order.id}
              orderCode={code}
              orderStatus={(order as any).orderStatus}
              paymentState={(order as any).paymentState}
              fulfillmentStatus={(order as any).fulfillmentStatus}
              carrier={(order as any).carrier || null}
              trackingCode={(order as any).trackingCode || null}
              transactionRef={(order as any).transactionRef || null}
            />

            <Card>
              <CardHeader>
                <CardTitle>{t('orders.pricingTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('orders.subtotal')}</span>
                  <span className="font-medium">{formatPrice(order.subtotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('orders.discount')}</span>
                  <span className="font-medium">{formatPrice(order.discount || 0, currency)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('orders.tax')}</span>
                  <span className="font-medium">{formatPrice(order.tax || 0, currency)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('orders.shippingFee')}</span>
                  <span className="font-medium">
                    {formatPrice(order.shippingCost || 0, currency)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold">{t('orders.grandTotal')}</span>
                  <span className="font-heavy text-ce-primary">
                    {formatPrice(order.total, currency)}
                  </span>
                </div>
                <Separator />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('orders.paymentMethod')}</span>
                    <span className="font-medium">{order.paymentMethod || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('orders.legacyPaymentStatus')}</span>
                    <span className="font-medium">{order.paymentStatus}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
