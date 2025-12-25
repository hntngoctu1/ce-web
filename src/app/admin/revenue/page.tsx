import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getRevenueDashboardData, parseDateRange } from '@/lib/admin/analytics';
import { getTranslations } from 'next-intl/server';
import { RevenueSummaryCards } from '@/components/admin/revenue/revenue-summary-cards';
import { RevenueLineChart } from '@/components/admin/revenue/revenue-line-chart';
import { StatusDonut } from '@/components/admin/revenue/status-donut';
import { TopProductsTable } from '@/components/admin/revenue/top-products-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminFilterBar } from '@/components/admin/analytics/admin-filter-bar';

export const metadata: Metadata = {
  title: 'Revenue & Analytics - Admin',
};

function getParam(params: any, key: string) {
  const v = params?.[key];
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminRevenuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations('admin');
  const params = await searchParams;
  const { from, to, range } = parseDateRange(params);

  const accountingStatus = getParam(params, 'accountingStatus');
  const customerKind = getParam(params, 'customerKind') as 'INDIVIDUAL' | 'BUSINESS' | undefined;
  const productId = getParam(params, 'productId');

  let data;
  let todayData;
  let products: { id: string; nameEn: string }[] = [];

  try {
    data = await getRevenueDashboardData({ from, to, accountingStatus, customerKind, productId });

    // Revenue today uses payments today (independent from range selection)
    const today = parseDateRange({ range: 'today' as any });
    todayData = await getRevenueDashboardData({
      from: today.from,
      to: today.to,
      accountingStatus,
      customerKind,
      productId,
    });

    products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 200,
      select: { id: true, nameEn: true },
    });
  } catch (error) {
    console.error('Error loading revenue data:', error);
    // Fallback to empty data
    data = {
      totalRevenue: 0,
      outstandingDebt: 0,
      completedOrders: 0,
      aov: 0,
      series: [],
      statusPie: [],
      topProducts: [],
    };
    todayData = { totalRevenue: 0 };
  }

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
          <h1 className="text-3xl font-heavy text-foreground">{t('revenue.title')}</h1>
          <p className="text-muted-foreground">{t('revenue.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/api/admin/reports/revenue.csv?${buildQs({})}`}>
              {t('revenue.exportRevenueCsv')}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/api/admin/reports/debt.csv?${buildQs({})}`}>
              {t('revenue.exportDebtCsv')}
            </Link>
          </Button>
        </div>
      </div>

      <AdminFilterBar
        products={products.map((p) => ({ id: p.id, name: p.nameEn }))}
        showAccountingStatus={true}
      />

      <RevenueSummaryCards
        stats={{
          totalRevenue: data.totalRevenue,
          revenueToday: todayData.totalRevenue,
          outstandingDebt: data.outstandingDebt,
          completedOrders: data.completedOrders,
          aov: data.aov,
        }}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('revenue.charts.revenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueLineChart data={data.series} />
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('revenue.charts.statusMix')}</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDonut data={data.statusPie} />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('revenue.charts.productPerformance')}</CardTitle>
        </CardHeader>
        <CardContent>
          <TopProductsTable rows={data.topProducts} />
        </CardContent>
      </Card>
    </div>
  );
}
