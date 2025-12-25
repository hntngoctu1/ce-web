'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type RevenueLineChartProps = {
  data: { date: string; value: number }[];
  className?: string;
};

export function RevenueLineChart({ data, className }: RevenueLineChartProps) {
  const t = useTranslations('admin.revenue.charts');
  const { points, min, max } = useMemo(() => {
    const values = data.map((d) => d.value);
    const min = Math.min(0, ...values);
    const max = Math.max(1, ...values);
    const w = 680;
    const h = 220;
    const padX = 16;
    const padY = 18;

    const x = (i: number) => padX + (i * (w - padX * 2)) / Math.max(1, data.length - 1);
    const y = (v: number) => {
      const t = (v - min) / (max - min);
      return padY + (1 - t) * (h - padY * 2);
    };

    const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ');
    return { points: pts, min, max };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className={cn('w-full', className)}>
        <div className="mb-2 text-sm font-semibold text-foreground">{t('revenue')}</div>
        <div className="flex h-[220px] items-center justify-center rounded-xl border bg-white text-sm text-muted-foreground">
          {t('noData')}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-foreground">{t('revenueTrend')}</div>
        <div className="text-xs text-muted-foreground">
          {t('min')} {Math.round(min).toLocaleString()} • {t('max')}{' '}
          {Math.round(max).toLocaleString()}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border bg-white">
        <svg viewBox="0 0 680 220" className="h-[220px] w-full">
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(44,104,255,0.22)" />
              <stop offset="1" stopColor="rgba(44,104,255,0.02)" />
            </linearGradient>
          </defs>
          <polyline points={points} fill="none" stroke="rgb(30,64,175)" strokeWidth="2" />
          <polyline
            points={`${points} 664,202 16,202`}
            fill="url(#revFill)"
            stroke="none"
            opacity="1"
          />
        </svg>
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>{data[0]?.date}</span>
        <span>{data[Math.max(0, data.length - 1)]?.date}</span>
      </div>
    </div>
  );
}
