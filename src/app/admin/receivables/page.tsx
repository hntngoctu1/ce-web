import { Metadata } from 'next';
import Link from 'next/link';
import { getReceivables, parseDateRange } from '@/lib/admin/analytics';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AddPaymentSheet } from '@/components/admin/receivables/add-payment-sheet';
import { formatPrice } from '@/lib/utils';
import { AdminFilterBar } from '@/components/admin/analytics/admin-filter-bar';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Receivables - Admin',
};

function getParam(params: any, key: string) {
  const v = params?.[key];
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminReceivablesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations('admin');
  const params = await searchParams;
  const { from, to, range } = parseDateRange(params);
  const customerKind = getParam(params, 'customerKind') as 'INDIVIDUAL' | 'BUSINESS' | undefined;
  const overdueOnly = getParam(params, 'overdue') === 'true';
  const dueIn = getParam(params, 'dueIn');
  const q = getParam(params, 'q');
  const dueInDays = dueIn ? Number(dueIn) : undefined;

  const { orders, totalOutstanding, overdueAmount } = await getReceivables({
    from,
    to,
    customerKind,
    overdueOnly,
    dueInDays,
    companyQuery: q || undefined,
  });

  const buildQs = (updates: Record<string, string | null>) => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (!v) return;
      if (Array.isArray(v)) v.forEach((x) => urlParams.append(k, x));
      else urlParams.set(k, v);
    });
    Object.entries(updates).forEach(([k, v]) => {
      urlParams.delete(k);
      if (v) urlParams.set(k, v);
    });
    return urlParams.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-heavy text-foreground">{t('receivables.title')}</h1>
          <p className="text-muted-foreground">{t('receivables.subtitle')}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/api/admin/reports/debt.csv?${buildQs({})}`}>
            {t('receivables.exportCsv')}
          </Link>
        </Button>
      </div>

      <AdminFilterBar showOverdue showDueIn showAccountingStatus={false} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('receivables.summary.totalOutstanding')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(totalOutstanding, 'VND', 'vi-VN')}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('receivables.summary.overdueAmount')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatPrice(overdueAmount, 'VND', 'vi-VN')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('receivables.table.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('receivables.table.orderInvoice')}</TableHead>
                  <TableHead>{t('receivables.table.customer')}</TableHead>
                  <TableHead className="text-right">{t('receivables.table.total')}</TableHead>
                  <TableHead className="text-right">{t('receivables.table.paid')}</TableHead>
                  <TableHead className="text-right">{t('receivables.table.outstanding')}</TableHead>
                  <TableHead>{t('receivables.table.dueDate')}</TableHead>
                  <TableHead>{t('receivables.table.status')}</TableHead>
                  <TableHead className="text-right">{t('receivables.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length ? (
                  orders.map((o: any) => {
                    const code = o.orderCode || o.orderNumber;
                    const due = o.dueDate ? new Date(o.dueDate) : null;
                    const overdue = due ? due.getTime() < Date.now() : false;
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <Link className="hover:underline" href={`/admin/orders/${o.id}`}>
                              {code}
                            </Link>
                            <span className="text-xs text-muted-foreground">
                              {o.invoiceNo || '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{o.customerName}</span>
                            <span className="text-xs text-muted-foreground">
                              {o.buyerCompanyName || '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(o.totalAmount, 'VND', 'vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(o.paidAmount, 'VND', 'vi-VN')}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatPrice(o.outstandingAmount, 'VND', 'vi-VN')}
                        </TableCell>
                        <TableCell>{due ? due.toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <Badge variant={overdue ? 'destructive' : 'secondary'}>
                            {overdue
                              ? t('receivables.badge.overdue')
                              : t('receivables.badge.onTime')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <AddPaymentSheet
                              orderId={o.id}
                              orderCode={code}
                              defaultOutstanding={Number(o.outstandingAmount || 0)}
                            />
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/orders/${o.id}`}>
                                {t('receivables.actions.view')}
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      {t('receivables.empty')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
