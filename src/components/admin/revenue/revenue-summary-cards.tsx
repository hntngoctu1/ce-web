'use client';

import { cn, formatPrice } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export function RevenueSummaryCards({
  currency = 'VND',
  stats,
  className,
}: {
  currency?: string;
  stats: {
    totalRevenue: number;
    revenueToday: number;
    outstandingDebt: number;
    completedOrders: number;
    aov: number;
  };
  className?: string;
}) {
  const t = useTranslations('admin.revenue.summary');
  const fmt = (n: number) => formatPrice(Math.round(n), currency, 'vi-VN');

  const cards = [
    { title: t('totalRevenue'), value: fmt(stats.totalRevenue) },
    { title: t('revenueToday'), value: fmt(stats.revenueToday) },
    { title: t('outstandingDebt'), value: fmt(stats.outstandingDebt) },
    { title: t('ordersCompleted'), value: String(stats.completedOrders) },
    { title: t('aov'), value: fmt(stats.aov) },
  ];

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-5', className)}>
      {cards.map((c) => (
        <Card key={c.title} className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{c.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
