'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type CreateLocationButtonProps = {
  warehouseId: string;
  warehouseCode: string;
};

export function CreateLocationButton({ warehouseId, warehouseCode }: CreateLocationButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '',
    name: '',
    isDefault: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/warehouses/${warehouseId}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          name: form.name || undefined,
          isDefault: form.isDefault,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create location');
      }

      setOpen(false);
      setForm({ code: '', name: '', isDefault: false });
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
        <Button variant="outline" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Add Location
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Create Location for {warehouseCode}
          </DialogTitle>
          <DialogDescription>
            Add a storage location (bin, shelf, zone) to this warehouse.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location-code">Code *</Label>
            <Input
              id="location-code"
              placeholder="e.g., A1-01, BIN001, SHELF-B"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
              className="uppercase"
            />
            <p className="text-xs text-muted-foreground">Unique within this warehouse.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location-name">Name / Description</Label>
            <Input
              id="location-name"
              placeholder="e.g., Aisle 1, Rack A"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="location-default"
              checked={form.isDefault}
              onCheckedChange={(c) => setForm({ ...form, isDefault: !!c })}
            />
            <Label htmlFor="location-default" className="text-sm">
              Set as default location for this warehouse
            </Label>
          </div>
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !form.code}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create Location
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
