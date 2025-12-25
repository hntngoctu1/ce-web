'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type AdminFilterBarProps = {
  title?: string;
  className?: string;
  products?: { id: string; name: string }[];
  showOverdue?: boolean;
  showDueIn?: boolean;
  showAccountingStatus?: boolean;
};

function isoDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function AdminFilterBar({
  title,
  className,
  products = [],
  showOverdue = false,
  showDueIn = false,
  showAccountingStatus = true,
}: AdminFilterBarProps) {
  const t = useTranslations('admin');
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = useMemo(() => {
    const get = (k: string) => sp.get(k) || '';
    return {
      range: get('range') || '30d',
      from: get('from'),
      to: get('to'),
      customerKind: get('customerKind'),
      accountingStatus: get('accountingStatus'),
      productId: get('productId'),
      overdue: get('overdue') === 'true',
      dueIn: get('dueIn'),
    };
  }, [sp]);

  const [range, setRange] = useState(current.range);
  const [from, setFrom] = useState(current.from);
  const [to, setTo] = useState(current.to);
  const [customerKind, setCustomerKind] = useState(current.customerKind);
  const [accountingStatus, setAccountingStatus] = useState(current.accountingStatus);
  const [productId, setProductId] = useState(current.productId);
  const [overdue, setOverdue] = useState(current.overdue);
  const [dueIn, setDueIn] = useState(current.dueIn);

  const presets = useMemo(
    () => [
      { key: 'today', label: t('analytics.range.today') },
      { key: '7d', label: t('analytics.range.7d') },
      { key: '30d', label: t('analytics.range.30d') },
      { key: 'month', label: t('analytics.range.month') },
    ],
    [t]
  );

  const apply = () => {
    startTransition(() => {
      const next = new URLSearchParams(sp.toString());
      // range/preset
      next.set('range', range);
      // custom dates only when range=custom
      if (range === 'custom') {
        if (from) next.set('from', from);
        else next.delete('from');
        if (to) next.set('to', to);
        else next.delete('to');
      } else {
        next.delete('from');
        next.delete('to');
      }

      if (customerKind) next.set('customerKind', customerKind);
      else next.delete('customerKind');
      if (showAccountingStatus) {
        if (accountingStatus) next.set('accountingStatus', accountingStatus);
        else next.delete('accountingStatus');
      }
      if (productId) next.set('productId', productId);
      else next.delete('productId');

      if (showOverdue) {
        if (overdue) next.set('overdue', 'true');
        else next.delete('overdue');
      }
      if (showDueIn) {
        if (dueIn) next.set('dueIn', dueIn);
        else next.delete('dueIn');
      }

      router.push(`?${next.toString()}`);
    });
  };

  const reset = () => {
    startTransition(() => {
      router.push('?range=30d');
    });
  };

  // Auto-fill dates on entering custom
  const onRangeChange = (v: string) => {
    setRange(v);
    if (v === 'custom' && (!from || !to)) {
      const now = new Date();
      setTo(to || isoDate(now));
      setFrom(from || isoDate(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)));
    }
  };

  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title || t('analytics.filtersTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <Button
              key={p.key}
              size="sm"
              variant={range === p.key ? 'ce' : 'outline'}
              onClick={() => onRangeChange(p.key)}
              disabled={isPending}
            >
              {p.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant={range === 'custom' ? 'ce' : 'outline'}
            onClick={() => onRangeChange('custom')}
            disabled={isPending}
          >
            {t('analytics.range.custom')}
          </Button>
        </div>

        {/* Controls */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {range === 'custom' ? (
            <>
              <div className="space-y-1">
                <Label>{t('analytics.from')}</Label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{t('analytics.to')}</Label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </>
          ) : (
            <div className="md:col-span-2 lg:col-span-2" />
          )}

          <div className="space-y-1">
            <Label>{t('analytics.customerType')}</Label>
            <Select
              value={customerKind || 'ALL'}
              onValueChange={(v) => setCustomerKind(v === 'ALL' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('analytics.all')}</SelectItem>
                <SelectItem value="BUSINESS">{t('analytics.b2b')}</SelectItem>
                <SelectItem value="INDIVIDUAL">{t('analytics.b2c')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showAccountingStatus ? (
            <div className="space-y-1">
              <Label>{t('analytics.status')}</Label>
              <Select
                value={accountingStatus || 'ALL'}
                onValueChange={(v) => setAccountingStatus(v === 'ALL' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('analytics.all')}</SelectItem>
                  <SelectItem value="PENDING_PAYMENT">PENDING_PAYMENT</SelectItem>
                  <SelectItem value="PARTIALLY_PAID">PARTIALLY_PAID</SelectItem>
                  <SelectItem value="PAID">PAID</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  <SelectItem value="REFUNDED">REFUNDED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div />
          )}

          <div className="space-y-1">
            <Label>{t('analytics.product')}</Label>
            <Select
              value={productId || 'ALL'}
              onValueChange={(v) => setProductId(v === 'ALL' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('analytics.all')}</SelectItem>
                {products.slice(0, 200).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {(showOverdue || showDueIn) && (
          <div className="flex flex-wrap gap-2">
            {showOverdue ? (
              <Button
                size="sm"
                variant={overdue ? 'ce' : 'outline'}
                onClick={() => setOverdue(!overdue)}
                disabled={isPending}
              >
                {t('analytics.overdueOnly')}
              </Button>
            ) : null}
            {showDueIn ? (
              <Select value={dueIn || 'ALL'} onValueChange={(v) => setDueIn(v === 'ALL' ? '' : v)}>
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('analytics.dueAny')}</SelectItem>
                  <SelectItem value="7">{t('analytics.dueIn7')}</SelectItem>
                  <SelectItem value="30">{t('analytics.dueIn30')}</SelectItem>
                </SelectContent>
              </Select>
            ) : null}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={reset} disabled={isPending}>
            {t('analytics.reset')}
          </Button>
          <Button variant="ce" onClick={apply} disabled={isPending}>
            {isPending ? t('analytics.applying') : t('analytics.apply')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
