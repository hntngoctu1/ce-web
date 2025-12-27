'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Truck, CreditCard, RefreshCcw, Ban, StickyNote } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
import { ORDER_STATUS_FLOW } from '@/lib/orders/workflow';
import type { OrderStatus, PaymentState, FulfillmentStatus } from '@prisma/client';

export function OrderActions({
  orderId,
  orderCode,
  orderStatus,
  paymentState,
  fulfillmentStatus,
  carrier,
  trackingCode,
  transactionRef,
}: {
  orderId: string;
  orderCode: string;
  orderStatus: OrderStatus;
  paymentState: PaymentState;
  fulfillmentStatus: FulfillmentStatus;
  carrier: string | null;
  trackingCode: string | null;
  transactionRef: string | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('admin');

  const [busy, setBusy] = useState(false);
  const [forceTransition, setForceTransition] = useState(false);
  const [showAllStatuses, setShowAllStatuses] = useState(false);

  // Status update
  const [newStatus, setNewStatus] = useState<OrderStatus>(orderStatus);
  const [noteInternal, setNoteInternal] = useState('');
  const [noteCustomer, setNoteCustomer] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  // Shipping
  const [shipCarrier, setShipCarrier] = useState(carrier || '');
  const [shipTracking, setShipTracking] = useState(trackingCode || '');

  // Payment
  const [newPayment, setNewPayment] = useState<PaymentState>(paymentState);
  const [txRef, setTxRef] = useState(transactionRef || '');

  const statusLabel = (s: OrderStatus) => t(`orders.statusLabels.${s}`);
  const paymentLabel = (s: PaymentState) => t(`orders.paymentLabels.${s}`);

  const allowedStatuses = useMemo(() => {
    if (showAllStatuses) {
      return [
        'DRAFT',
        'PENDING_CONFIRMATION',
        'CONFIRMED',
        'PACKING',
        'SHIPPED',
        'DELIVERED',
        'CANCELED',
        'RETURN_REQUESTED',
        'RETURNED',
        'FAILED',
      ] as OrderStatus[];
    }
    const next = ORDER_STATUS_FLOW[orderStatus] || [];
    const list = [orderStatus, ...next];
    // de-dup and stable order
    return Array.from(new Set(list));
  }, [orderStatus, showAllStatuses]);

  const allowedNext = useMemo(() => ORDER_STATUS_FLOW[orderStatus] || [], [orderStatus]);

  async function doRequest(input: RequestInfo, init: RequestInit) {
    const res = await fetch(input, init);
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      // Handle structured error response: { success: false, error: { code, message, details } }
      let errorMsg = 'Request failed';
      if (json?.error) {
        if (typeof json.error === 'string') {
          errorMsg = json.error;
        } else if (typeof json.error === 'object') {
          errorMsg = json.error.message || json.error.code || 'Unknown error';
          // Add transition details if available
          if (json.error.details?.[0]?.from && json.error.details?.[0]?.to) {
            errorMsg += `: ${json.error.details[0].from} → ${json.error.details[0].to}`;
          }
        }
      } else if (json?.message) {
        errorMsg = json.message;
      }
      throw new Error(errorMsg);
    }
    return json;
  }

  async function refresh() {
    router.refresh();
  }

  async function onUpdateStatus(force?: boolean) {
    setBusy(true);
    try {
      await doRequest(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus,
          noteInternal: noteInternal || undefined,
          noteCustomer: noteCustomer || undefined,
          cancelReason: newStatus === 'CANCELED' ? cancelReason : undefined,
          force: !!force,
          notifyCustomer: false,
        }),
      });
      toast({
        title: t('orders.toast.updated'),
        description: `${t('orders.workflowTitle')} → ${statusLabel(newStatus)}`,
      });
      setNoteInternal('');
      setNoteCustomer('');
      setCancelReason('');
      await refresh();
    } catch (e) {
      toast({
        title: t('orders.toast.failed'),
        description: e instanceof Error ? e.message : 'Update failed',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  }

  async function onSaveShipping(markShipped?: boolean, markDelivered?: boolean) {
    setBusy(true);
    try {
      await doRequest(`/api/admin/orders/${orderId}/shipping`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: shipCarrier || null,
          trackingCode: shipTracking || null,
          markShipped: !!markShipped,
          markDelivered: !!markDelivered,
          force: forceTransition,
        }),
      });
      toast({
        title: t('orders.toast.shippingUpdated'),
        description: markDelivered
          ? t('orders.markDelivered')
          : markShipped
            ? t('orders.markShipped')
            : t('orders.saveShipping'),
      });
      await refresh();
    } catch (e) {
      toast({
        title: t('orders.toast.failed'),
        description: e instanceof Error ? e.message : 'Update failed',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  }

  async function onUpdatePayment() {
    setBusy(true);
    try {
      await doRequest(`/api/admin/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentState: newPayment,
          transactionRef: txRef || null,
        }),
      });
      toast({
        title: t('orders.toast.paymentUpdated'),
        description: `${t('orders.paymentTitle')} → ${paymentLabel(newPayment)}`,
      });
      await refresh();
    } catch (e) {
      toast({
        title: t('orders.toast.failed'),
        description: e instanceof Error ? e.message : 'Update failed',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  }

  async function onAddNote() {
    if (!noteInternal && !noteCustomer) {
      toast({
        title: t('orders.toast.noteEmpty'),
        description: t('orders.toast.noteEmptyDesc'),
        variant: 'destructive',
      });
      return;
    }
    setBusy(true);
    try {
      await doRequest(`/api/admin/orders/${orderId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteInternal: noteInternal || undefined,
          noteCustomer: noteCustomer || undefined,
        }),
      });
      toast({ title: t('orders.toast.saved'), description: t('orders.toast.noteAdded') });
      setNoteInternal('');
      setNoteCustomer('');
      await refresh();
    } catch (e) {
      toast({
        title: t('orders.toast.failed'),
        description: e instanceof Error ? e.message : 'Update failed',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('orders.actionsTitle')}</span>
          <Button variant="outline" size="icon" onClick={refresh} disabled={busy} title="Refresh">
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span>{t('orders.workflowTitle')}</span>
            <span className="text-xs text-muted-foreground">({orderCode})</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-md border bg-muted/20 p-3 text-sm">
            <div>
              <span className="text-muted-foreground">{t('orders.current')}:</span>{' '}
              <span className="font-semibold">{statusLabel(orderStatus)}</span>
            </div>
            <div className="text-muted-foreground">
              {t('orders.next')}:{' '}
              <span className="text-foreground">
                {allowedNext.length ? allowedNext.map((s) => statusLabel(s)).join(', ') : '—'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('orders.orderStatus')}</Label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              disabled={busy}
            >
              {allowedStatuses.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showAllStatuses}
                  onChange={(e) => setShowAllStatuses(e.target.checked)}
                  disabled={busy}
                />
                {t('common.showAllStatuses')}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={forceTransition}
                  onChange={(e) => setForceTransition(e.target.checked)}
                  disabled={busy}
                />
                {t('common.forceTransition')}
              </label>
            </div>
          </div>

          {newStatus === 'CANCELED' && (
            <div className="space-y-2">
              <Label>{t('orders.cancelReason')} *</Label>
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                disabled={busy}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('common.internalNote')}</Label>
            <textarea
              value={noteInternal}
              onChange={(e) => setNoteInternal(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={busy}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('common.customerNote')}</Label>
            <textarea
              value={noteCustomer}
              onChange={(e) => setNoteCustomer(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={busy}
            />
          </div>

          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ce" className="flex-1" disabled={busy}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {t('orders.updateStatus')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('orders.confirmStatusTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('orders.confirmStatusDesc', { status: statusLabel(newStatus) })}
                    {forceTransition ? (
                      <div className="mt-2 text-xs text-destructive">
                        {t('orders.forceWarning')}
                      </div>
                    ) : null}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onUpdateStatus(forceTransition)}>
                    {t('common.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Separator />

        {/* Shipping */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Truck className="h-4 w-4 text-ce-primary" />
            {t('orders.shippingTitle')}
          </div>
          <div className="space-y-2">
            <Label>{t('orders.carrier')}</Label>
            <Input
              value={shipCarrier}
              onChange={(e) => setShipCarrier(e.target.value)}
              disabled={busy}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('orders.trackingCode')}</Label>
            <Input
              value={shipTracking}
              onChange={(e) => setShipTracking(e.target.value)}
              disabled={busy}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Button variant="outline" onClick={() => onSaveShipping(false, false)} disabled={busy}>
              {t('orders.saveShipping')}
            </Button>
            <Button
              variant="ce-outline"
              onClick={() => onSaveShipping(true, false)}
              disabled={busy}
            >
              {t('orders.markShipped')}
            </Button>
            <Button variant="ce" onClick={() => onSaveShipping(false, true)} disabled={busy}>
              {t('orders.markDelivered')}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {t('orders.current')}:{' '}
            <span className="font-medium text-foreground">{fulfillmentStatus}</span>
          </div>
        </div>

        <Separator />

        {/* Payment */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CreditCard className="h-4 w-4 text-ce-primary" />
            {t('orders.paymentTitle')}
          </div>
          <div className="space-y-2">
            <Label>{t('orders.paymentState')}</Label>
            <select
              value={newPayment}
              onChange={(e) => setNewPayment(e.target.value as PaymentState)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              disabled={busy}
            >
              {(['UNPAID', 'PAID', 'REFUNDED', 'PARTIAL'] as PaymentState[]).map((s) => (
                <option key={s} value={s}>
                  {paymentLabel(s)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>{t('orders.transactionRef')}</Label>
            <Input value={txRef} onChange={(e) => setTxRef(e.target.value)} disabled={busy} />
          </div>
          <Button variant="ce" onClick={onUpdatePayment} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t('orders.updatePayment')}
          </Button>
        </div>

        <Separator />

        {/* Notes quick */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <StickyNote className="h-4 w-4 text-ce-primary" />
            {t('orders.addNote')}
          </div>
          <Button variant="outline" onClick={onAddNote} disabled={busy} className="w-full">
            {t('orders.saveNote')}
          </Button>
        </div>

        <Separator />

        {/* Cancel quick */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <Ban className="h-4 w-4" />
            {t('orders.cancelOrder')}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={busy} className="w-full">
                {t('orders.cancelOrder')}…
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('orders.cancelOrder')}?</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('orders.cancelReason')} ({t('orders.statusLabels.CANCELED')})
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2">
                <Label>{t('orders.cancelReason')}</Label>
                <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setNewStatus('CANCELED');
                    void onUpdateStatus(false);
                  }}
                >
                  {t('common.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
