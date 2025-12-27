import { notFound, redirect } from 'next/navigation';
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

import type { OrderStatus } from '@prisma/client';

function safeJsonParse<T>(input: string | null | undefined): T | null {
  if (!input) return null;
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

// Map orderStatus to badge styling and translation keys
function statusBadge(orderStatus: OrderStatus) {
  const config: Record<OrderStatus, { key: string; variant: 'ce' | 'featured' | 'secondary' | 'destructive' }> = {
    DRAFT: { key: 'PENDING', variant: 'secondary' },
    PENDING_CONFIRMATION: { key: 'PENDING', variant: 'secondary' },
    CONFIRMED: { key: 'CONFIRMED', variant: 'featured' },
    PACKING: { key: 'CONFIRMED', variant: 'featured' },
    SHIPPED: { key: 'SHIPPED', variant: 'featured' },
    DELIVERED: { key: 'DELIVERED', variant: 'ce' },
    RETURN_REQUESTED: { key: 'RETURN_REQUESTED', variant: 'destructive' },
    RETURNED: { key: 'CANCELLED', variant: 'destructive' },
    CANCELED: { key: 'CANCELLED', variant: 'destructive' },
    FAILED: { key: 'CANCELLED', variant: 'destructive' },
  };
  return config[orderStatus] || { key: 'PENDING', variant: 'secondary' };
}

type AddressLabels = { company: string; taxId: string };

type BuyerSnapshot = {
  customerType?: 'PERSONAL' | 'BUSINESS';
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

function renderAddressLines(
  labels: AddressLabels,
  addr: AddressSnapshot | null,
  fallback?: string | null
) {
  if (!addr && !fallback) return <div className="text-sm text-muted-foreground">—</div>;

  const lines: string[] = [];
  const top = addr?.addressLine1 || fallback || '';
  if (top) lines.push(top);

  const cityParts = [addr?.district, addr?.city, addr?.province].filter(Boolean).join(', ');
  if (cityParts) lines.push(cityParts);

  const contactParts = [addr?.recipientName, addr?.recipientPhone, addr?.recipientEmail]
    .filter(Boolean)
    .join(' • ');
  if (contactParts) lines.push(contactParts);

  const companyParts = [
    addr?.companyName ? `${labels.company}: ${addr.companyName}` : null,
    addr?.taxId ? `${labels.taxId}: ${addr.taxId}` : null,
  ]
    .filter(Boolean)
    .join(' • ');
  if (companyParts) lines.push(companyParts);

  return (
    <div className="space-y-1 text-sm">
      {lines.map((line, idx) => (
        <div key={idx} className={idx === 0 ? 'font-medium' : 'text-muted-foreground'}>
          {line}
        </div>
      ))}
    </div>
  );
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const locale = await getLocale();
  const fmtLocale = toBCP47Locale(locale);
  const t = await getTranslations('customerOrders');
  const ta = await getTranslations('auth');
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/dashboard/orders/${params.id}`);
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order || order.userId !== session.user.id) {
    // For privacy, treat as not found.
    notFound();
  }

  const badge = statusBadge(order.orderStatus);
  const orderDate = formatDate(order.createdAt, fmtLocale);
  const currency = order.currency || 'VND';
  const subtotal = formatPrice(order.subtotal.toNumber(), currency, fmtLocale);
  const total = formatPrice(order.total.toNumber(), currency, fmtLocale);

  const buyer = safeJsonParse<BuyerSnapshot>(order.buyerSnapshot) || {
    customerType: order.buyerType as any,
    companyName: order.buyerCompanyName || undefined,
    taxId: order.buyerTaxId || undefined,
    companyEmail: order.buyerCompanyEmail || undefined,
  };

  const shipping = safeJsonParse<AddressSnapshot>(order.shippingSnapshot);
  const billing = safeJsonParse<AddressSnapshot>(order.billingSnapshot);

  const itemsCount = order.items.reduce((acc, it) => acc + (it.quantity || 0), 0);

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

  const addressLabels: AddressLabels = {
    company: t('detail.buyerCompany').replace(':', ''),
    taxId: t('detail.buyerTaxId').replace(':', ''),
  };

  return (
    <div className="ce-section">
      <div className="ce-container space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm text-muted-foreground">
              <Link href="/dashboard" className="hover:underline">
                {t('backToDashboard')}
              </Link>{' '}
              <span className="mx-1">/</span>
              <Link href="/dashboard/orders" className="hover:underline">
                {t('detail.breadcrumbOrders')}
              </Link>
            </div>
            <h1 className="text-3xl font-heavy">{order.orderNumber}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={badge.variant as any}>{t(`status.${badge.key}`)}</Badge>
              <span className="text-sm text-muted-foreground">
                {t('detail.placedOn')} <span className="text-foreground">{orderDate}</span>
              </span>
              <span className="text-sm text-muted-foreground">
                {t('detail.itemsCount')} <span className="text-foreground">{itemsCount}</span>
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/orders">{t('detail.back')}</Link>
            </Button>
            <Button variant="ce" asChild>
              <Link href="/menu/product">{t('detail.shopMore')}</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('detail.itemsTitle')}</CardTitle>
                <CardDescription>{t('detail.itemsSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('detail.product')}</TableHead>
                      <TableHead className="text-right">{t('detail.qty')}</TableHead>
                      <TableHead className="text-right">{t('detail.unit')}</TableHead>
                      <TableHead className="text-right">{t('table.total')}</TableHead>
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
                          {formatPrice(it.unitPrice.toNumber(), currency, fmtLocale)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(it.totalPrice.toNumber(), currency, fmtLocale)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('detail.shippingBillingTitle')}</CardTitle>
                <CardDescription>{t('detail.shippingBillingSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 font-semibold">{t('detail.shipping')}</div>
                    {renderAddressLines(addressLabels, shipping, order.shippingAddress)}
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 font-semibold">{t('detail.billing')}</div>
                    {renderAddressLines(addressLabels, billing, order.billingAddress)}
                  </div>
                </div>

                <Separator />

                <div className="rounded-lg border p-4">
                  <div className="mb-2 font-semibold">{t('detail.buyerInfo')}</div>
                  <div className="grid gap-2 text-sm md:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground">{t('detail.buyerType')}</span>{' '}
                      <span className="font-medium">
                        {buyer?.customerType === 'BUSINESS'
                          ? ta('customerTypeBusiness')
                          : ta('customerTypePersonal')}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('detail.buyerEmail')}</span>{' '}
                      <span className="font-medium">{order.customerEmail}</span>
                    </div>
                    {buyer?.companyName ? (
                      <div>
                        <span className="text-muted-foreground">{t('detail.buyerCompany')}</span>{' '}
                        <span className="font-medium">{buyer.companyName}</span>
                      </div>
                    ) : null}
                    {buyer?.taxId ? (
                      <div>
                        <span className="text-muted-foreground">{t('detail.buyerTaxId')}</span>{' '}
                        <span className="font-medium">{buyer.taxId}</span>
                      </div>
                    ) : null}
                    {buyer?.companyEmail ? (
                      <div>
                        <span className="text-muted-foreground">
                          {t('detail.buyerCompanyEmail')}
                        </span>{' '}
                        <span className="font-medium">{buyer.companyEmail}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{t('detail.summaryTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('detail.subtotal')}</span>
                  <span className="font-medium">{subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('detail.discount')}</span>
                  <span className="font-medium">
                    {formatPrice(order.discount?.toNumber() || 0, currency, fmtLocale)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('detail.tax')}</span>
                  <span className="font-medium">
                    {formatPrice(order.tax?.toNumber() || 0, currency, fmtLocale)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('detail.shippingFee')}</span>
                  <span className="font-medium">
                    {formatPrice(order.shippingCost?.toNumber() || 0, currency, fmtLocale)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold">{t('detail.total')}</span>
                  <span className="text-lg font-heavy text-ce-primary">{total}</span>
                </div>
                <Separator />
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('detail.method')}</span>
                    <span className="font-medium">{paymentMethodLabel(order.paymentMethod)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('detail.paymentStatusLabel')}</span>
                    <span className="font-medium">{paymentStatusLabel(order.paymentStatus)}</span>
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
