'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Minus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type QuickAdjustModalProps = {
  productId: string;
  productName: string;
  productSku: string | null;
  warehouseId: string;
  warehouseCode: string;
  currentOnHand: number;
  trigger?: React.ReactNode;
};

export function QuickAdjustModal({
  productId,
  productName,
  productSku,
  warehouseId,
  warehouseCode,
  currentOnHand,
  trigger,
}: QuickAdjustModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adjustType, setAdjustType] = useState<'set' | 'add' | 'subtract'>('set');
  const [value, setValue] = useState(currentOnHand.toString());
  const [note, setNote] = useState('');

  const calculatedNewQty = (() => {
    const numValue = parseFloat(value) || 0;
    switch (adjustType) {
      case 'set':
        return numValue;
      case 'add':
        return currentOnHand + numValue;
      case 'subtract':
        return Math.max(0, currentOnHand - numValue);
      default:
        return currentOnHand;
    }
  })();

  const difference = calculatedNewQty - currentOnHand;

  async function handleSubmit() {
    if (difference === 0) {
      setError('No change in quantity');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create an adjustment document
      // Use signed qty: positive for IN, negative for OUT
      const createRes = await fetch('/api/warehouse/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ADJUSTMENT',
          warehouseId,
          note: note || `Quick adjustment for ${productSku || productName}`,
          lines: [
            {
              productId,
              qty: difference, // Use signed value directly
              direction: difference > 0 ? 'IN' : 'OUT',
            },
          ],
        }),
      });

      if (!createRes.ok) {
        const data = await createRes.json();
        throw new Error(data.error || 'Failed to create adjustment');
      }

      const createData = await createRes.json();
      const docId = createData.document?.id || createData.id;
      
      if (!docId) {
        throw new Error('Failed to get document ID');
      }

      // Post the document immediately
      const postRes = await fetch(`/api/warehouse/docs/${docId}/post`, {
        method: 'POST',
      });

      if (!postRes.ok) {
        const postData = await postRes.json();
        throw new Error(postData.error || 'Failed to post adjustment');
      }

      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <RefreshCw className="mr-1 h-4 w-4" />
            Adjust
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Stock Adjustment</DialogTitle>
          <DialogDescription>
            Adjust inventory for <strong>{productName}</strong> ({productSku || 'No SKU'})
            <br />
            Warehouse: <strong>{warehouseCode}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Stock */}
          <div className="rounded-md bg-muted p-3 text-center">
            <div className="text-sm text-muted-foreground">Current On-hand</div>
            <div className="text-3xl font-bold">{currentOnHand}</div>
          </div>

          {/* Adjustment Type */}
          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={adjustType === 'set' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setAdjustType('set');
                  setValue(currentOnHand.toString());
                }}
              >
                Set To
              </Button>
              <Button
                type="button"
                variant={adjustType === 'add' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setAdjustType('add');
                  setValue('0');
                }}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add
              </Button>
              <Button
                type="button"
                variant={adjustType === 'subtract' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setAdjustType('subtract');
                  setValue('0');
                }}
              >
                <Minus className="mr-1 h-3 w-3" />
                Subtract
              </Button>
            </div>
          </div>

          {/* Value Input */}
          <div className="space-y-2">
            <Label htmlFor="adjust-value">
              {adjustType === 'set' && 'New Quantity'}
              {adjustType === 'add' && 'Quantity to Add'}
              {adjustType === 'subtract' && 'Quantity to Remove'}
            </Label>
            <Input
              id="adjust-value"
              type="number"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Preview */}
          {difference !== 0 && (
            <div className="rounded-md bg-muted p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New On-hand:</span>
                <span className="text-xl font-bold">{calculatedNewQty}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Change:</span>
                <span
                  className={`font-semibold ${difference > 0 ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  {difference > 0 ? '+' : ''}
                  {difference}
                </span>
              </div>
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="adjust-note">Reason / Note</Label>
            <Textarea
              id="adjust-note"
              placeholder="e.g., Physical count correction, damaged items, etc."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          {/* Error */}
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading || difference === 0}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Apply Adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
