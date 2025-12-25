'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type StatusDonutProps = {
  data: { key: string; value: number }[];
  className?: string;
};

const COLORS = ['#1e40af', '#0ea5e9', '#f59e0b', '#ef4444', '#10b981', '#6b7280', '#a855f7'];

export function StatusDonut({ data, className }: StatusDonutProps) {
  const t = useTranslations('admin.revenue.charts');

  function polar(cx: number, cy: number, r: number, angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
    const s = polar(cx, cy, r, end);
    const e = polar(cx, cy, r, start);
    const large = end - start <= 180 ? 0 : 1;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
  }

  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;

  if (!data || data.length === 0) {
    return (
      <div className={cn('w-full', className)}>
        <div className="mb-2 text-sm font-semibold text-foreground">{t('statusMix')}</div>
        <div className="flex h-[220px] items-center justify-center rounded-xl border bg-white text-sm text-muted-foreground">
          {t('noData')}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-2 text-sm font-semibold text-foreground">{t('statusMix')}</div>
      <div className="grid gap-4 rounded-xl border bg-white p-4 sm:grid-cols-[220px_1fr]">
        <svg viewBox="0 0 120 120" className="h-52 w-52">
          <circle cx="60" cy="60" r="44" fill="none" stroke="#eef2ff" strokeWidth="14" />
          {data.map((d, i) => {
            const start = (acc / total) * 360;
            acc += d.value;
            const end = (acc / total) * 360;
            const path = arcPath(60, 60, 44, start, end);
            return (
              <path
                key={d.key}
                d={path}
                fill="none"
                stroke={COLORS[i % COLORS.length]}
                strokeWidth="14"
                strokeLinecap="round"
              >
                <title>
                  {d.key}: {Math.round(d.value).toLocaleString()}
                </title>
              </path>
            );
          })}
          <text
            x="60"
            y="58"
            textAnchor="middle"
            className="fill-foreground"
            fontSize="12"
            fontWeight="700"
          >
            {t('total')}
          </text>
          <text x="60" y="74" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
            {Math.round(total).toLocaleString()}
          </text>
        </svg>

        <div className="space-y-2">
          {data.map((d, i) => (
            <div key={d.key} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="text-muted-foreground">{d.key}</span>
              </div>
              <div className="font-medium text-foreground">
                {Math.round(d.value).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
