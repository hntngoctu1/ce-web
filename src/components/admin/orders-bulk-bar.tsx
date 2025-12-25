'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'PACKING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELED'
  | 'FAILED'
  | 'RETURN_REQUESTED'
  | 'RETURNED';

export function OrdersBulkBar({ checkboxName = 'orderIds' }: { checkboxName?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('admin');
  const [selected, setSelected] = useState<string[]>([]);
  const [target, setTarget] = useState<OrderStatus>('CONFIRMED');
  const [noteInternal, setNoteInternal] = useState('');
  const [force, setForce] = useState(false);
  const [busy, setBusy] = useState(false);

  const count = selected.length;

  const selector = useMemo(() => `input[type="checkbox"][name="${checkboxName}"]`, [checkboxName]);

  function readSelected() {
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>(selector));
    return inputs.filter((i) => i.checked).map((i) => i.value);
  }

  function toggleAll(checked: boolean) {
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>(selector));
    for (const i of inputs) i.checked = checked;
    setSelected(readSelected());
  }

  useEffect(() => {
    const handler = () => setSelected(readSelected());
    document.addEventListener('change', handler);
    return () => document.removeEventListener('change', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector]);

  async function applyBulk() {
    if (count === 0) {
      toast({
        title: t('orders.toast.noSelection'),
        description: t('orders.toast.selectAtLeastOne'),
        variant: 'destructive',
      });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/orders/bulk/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selected,
          newStatus: target,
          noteInternal: noteInternal || undefined,
          force,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || 'Bulk update failed');

      toast({
        title: t('orders.toast.bulkUpdated'),
        description: t('orders.toast.bulkDesc', {
          updated: String(json.updated),
          skipped: String(json.skipped?.length || 0),
        }),
      });
      setNoteInternal('');
      setForce(false);
      toggleAll(false);
      router.refresh();
    } catch (e) {
      toast({
        title: t('orders.toast.failed'),
        description: e instanceof Error ? e.message : 'Bulk update failed',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  }

  const statusOptions: { value: OrderStatus; label: string }[] = useMemo(
    () => [
      { value: 'PENDING_CONFIRMATION', label: t('orders.statusLabels.PENDING_CONFIRMATION') },
      { value: 'CONFIRMED', label: t('orders.statusLabels.CONFIRMED') },
      { value: 'PACKING', label: t('orders.statusLabels.PACKING') },
      { value: 'SHIPPED', label: t('orders.statusLabels.SHIPPED') },
      { value: 'DELIVERED', label: t('orders.statusLabels.DELIVERED') },
      { value: 'CANCELED', label: t('orders.statusLabels.CANCELED') },
      { value: 'FAILED', label: t('orders.statusLabels.FAILED') },
      { value: 'RETURN_REQUESTED', label: t('orders.statusLabels.RETURN_REQUESTED') },
      { value: 'RETURNED', label: t('orders.statusLabels.RETURNED') },
    ],
    [t]
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" onChange={(e) => toggleAll(e.target.checked)} />
          <span className="font-medium">{t('orders.selectAllPage')}</span>
        </label>
        <span className="text-sm text-muted-foreground">
          {t('orders.selected', { count: String(count) })}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value as OrderStatus)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          disabled={busy}
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          value={noteInternal}
          onChange={(e) => setNoteInternal(e.target.value)}
          placeholder={t('common.internalNote')}
          className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm"
          disabled={busy}
        />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={force}
            onChange={(e) => setForce(e.target.checked)}
            disabled={busy}
          />
          {t('common.force')}
        </label>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ce" disabled={busy || count === 0}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('orders.bulkApply')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('orders.bulkConfirmTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('orders.bulkConfirmDesc', {
                  count: String(count),
                  status: statusOptions.find((x) => x.value === target)?.label || target,
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={applyBulk}>{t('common.confirm')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
