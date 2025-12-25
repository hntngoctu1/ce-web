'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AddPaymentSheet({
  orderId,
  orderCode,
  defaultOutstanding,
}: {
  orderId: string;
  orderCode: string;
  defaultOutstanding: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState(String(Math.max(0, Math.round(defaultOutstanding))));
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [note, setNote] = useState('');

  async function submit() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          paymentMethod,
          note: note || undefined,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || 'Failed to add payment');

      toast({
        title: 'Payment added',
        description: `${orderCode} • ${Number(amount).toLocaleString()}`,
      });
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Request failed' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          Add payment
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[92vw] max-w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add payment</SheetTitle>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          <div className="text-sm text-muted-foreground">
            Order: <span className="font-medium text-foreground">{orderCode}</span>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
            />
          </div>

          <div className="space-y-2">
            <Label>Payment method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BANK_TRANSFER">Bank transfer</SelectItem>
                <SelectItem value="COD">COD</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Bank TX 123..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              variant="ce"
              onClick={submit}
              disabled={busy || !Number(amount)}
            >
              {busy ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
