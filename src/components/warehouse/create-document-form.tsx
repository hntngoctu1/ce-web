'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Warehouse = {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
  locations: { id: string; code: string; name: string }[];
};

type Product = {
  id: string;
  sku: string | null;
  nameEn: string;
};

type LineItem = {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  qty: number;
  sourceLocationId?: string;
  targetLocationId?: string;
};

type CreateDocumentFormProps = {
  warehouses: Warehouse[];
  products: Product[];
};

const DOCUMENT_TYPES = [
  { value: 'GRN', label: 'Goods Receipt (GRN)', description: 'Receive items into warehouse' },
  { value: 'ISSUE', label: 'Issue', description: 'Remove items from warehouse' },
  { value: 'ADJUSTMENT', label: 'Adjustment', description: 'Adjust inventory count' },
  { value: 'TRANSFER', label: 'Transfer', description: 'Move items between warehouses' },
];

export function CreateDocumentForm({ warehouses, products }: CreateDocumentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [postAfterSave, setPostAfterSave] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultWarehouse = warehouses.find((w) => w.isDefault) || warehouses[0];

  const [formData, setFormData] = useState({
    type: 'GRN',
    warehouseId: defaultWarehouse?.id || '',
    targetWarehouseId: '',
    note: '',
  });

  const [lines, setLines] = useState<LineItem[]>([]);
  const [productSearch, setProductSearch] = useState('');

  const selectedWarehouse = warehouses.find((w) => w.id === formData.warehouseId);
  const targetWarehouse = warehouses.find((w) => w.id === formData.targetWarehouseId);

  const filteredProducts = products.filter(
    (p) =>
      p.nameEn.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  function addLine(product: Product) {
    const exists = lines.find((l) => l.productId === product.id);
    if (exists) {
      setLines(lines.map((l) => (l.productId === product.id ? { ...l, qty: l.qty + 1 } : l)));
    } else {
      setLines([
        ...lines,
        {
          id: crypto.randomUUID(),
          productId: product.id,
          productName: product.nameEn,
          productSku: product.sku || '',
          qty: 1,
        },
      ]);
    }
    setProductSearch('');
  }

  function updateLineQty(id: string, qty: number) {
    setLines(lines.map((l) => (l.id === id ? { ...l, qty: Math.max(0, qty) } : l)));
  }

  function removeLine(id: string) {
    setLines(lines.filter((l) => l.id !== id));
  }

  async function handleSubmit(shouldPost: boolean) {
    if (!formData.warehouseId) {
      setError('Please select a warehouse');
      return;
    }

    if (formData.type === 'TRANSFER' && !formData.targetWarehouseId) {
      setError('Transfer requires a target warehouse');
      return;
    }

    if (lines.length === 0) {
      setError('Please add at least one item');
      return;
    }

    if (lines.some((l) => l.qty <= 0)) {
      setError('All quantities must be greater than 0');
      return;
    }

    setLoading(true);
    setError(null);
    setPostAfterSave(shouldPost);

    try {
      // Create document
      const res = await fetch('/api/warehouse/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          warehouseId: formData.warehouseId,
          targetWarehouseId: formData.type === 'TRANSFER' ? formData.targetWarehouseId : undefined,
          note: formData.note || undefined,
          lines: lines.map((l) => ({
            productId: l.productId,
            qty: l.qty,
            sourceLocationId: l.sourceLocationId,
            targetLocationId: l.targetLocationId,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create document');
      }

      const doc = await res.json();

      // If shouldPost, post the document
      if (shouldPost) {
        const postRes = await fetch(`/api/warehouse/docs/${doc.id}/post`, {
          method: 'POST',
        });

        if (!postRes.ok) {
          const postData = await postRes.json();
          // Navigate to document but show warning
          router.push(
            `/admin/warehouse/documents/${doc.id}?postError=${encodeURIComponent(postData.error || 'Post failed')}`
          );
          return;
        }
      }

      router.push(`/admin/warehouse/documents/${doc.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Document Type */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Document Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(v) => setFormData({ ...formData, type: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <div>
                    <div className="font-medium">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="warehouse">
            {formData.type === 'TRANSFER' ? 'From Warehouse *' : 'Warehouse *'}
          </Label>
          <Select
            value={formData.warehouseId}
            onValueChange={(v) => setFormData({ ...formData, warehouseId: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.code} - {w.name} {w.isDefault && '(Default)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Target Warehouse for Transfer */}
      {formData.type === 'TRANSFER' && (
        <div className="space-y-2">
          <Label htmlFor="targetWarehouse">To Warehouse *</Label>
          <Select
            value={formData.targetWarehouseId}
            onValueChange={(v) => setFormData({ ...formData, targetWarehouseId: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select target warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouses
                .filter((w) => w.id !== formData.warehouseId)
                .map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          placeholder="Optional notes for this document..."
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          rows={2}
        />
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Line Items ({lines.length})</Label>
        </div>

        {/* Product Search */}
        <div className="relative">
          <Input
            placeholder="Search products by name or SKU..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
          {productSearch && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-auto rounded-md border bg-background shadow-lg">
              {filteredProducts.length > 0 ? (
                filteredProducts.slice(0, 10).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => addLine(p)}
                  >
                    <span>{p.nameEn}</span>
                    <span className="font-mono text-xs text-muted-foreground">{p.sku || '-'}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-muted-foreground">No products found</div>
              )}
            </div>
          )}
        </div>

        {/* Lines Table */}
        {lines.length > 0 && (
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Product</th>
                  <th className="px-4 py-2 text-left font-medium">SKU</th>
                  <th className="w-32 px-4 py-2 text-right font-medium">Qty</th>
                  <th className="w-16 px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className="border-b last:border-0">
                    <td className="px-4 py-2">{line.productName}</td>
                    <td className="px-4 py-2 font-mono text-xs">{line.productSku || '-'}</td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min="1"
                        value={line.qty}
                        onChange={(e) => updateLineQty(line.id, parseInt(e.target.value) || 0)}
                        className="h-8 w-24 text-right"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLine(line.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {lines.length === 0 && (
          <div className="rounded-lg border border-dashed bg-muted/30 py-8 text-center text-muted-foreground">
            <Plus className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>Search and add products above</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {/* Actions */}
      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild disabled={loading}>
          <a href="/admin/warehouse/documents">Cancel</a>
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleSubmit(false)}
          disabled={loading || lines.length === 0}
        >
          {loading && !postAfterSave ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save as Draft
        </Button>
        <Button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={loading || lines.length === 0}
        >
          {loading && postAfterSave ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Save & Post
        </Button>
      </div>

      {/* Confirm Post Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Post Document Now?</AlertDialogTitle>
            <AlertDialogDescription>
              This will apply stock movements and update inventory immediately. Make sure all
              details are correct.
              <div className="mt-4 rounded-md bg-muted p-3 text-sm">
                <div>
                  <strong>Type:</strong>{' '}
                  {DOCUMENT_TYPES.find((t) => t.value === formData.type)?.label}
                </div>
                <div>
                  <strong>Warehouse:</strong> {selectedWarehouse?.code}
                </div>
                {targetWarehouse && (
                  <div>
                    <strong>Target:</strong> {targetWarehouse?.code}
                  </div>
                )}
                <div>
                  <strong>Items:</strong> {lines.length} product(s),{' '}
                  {lines.reduce((sum, l) => sum + l.qty, 0)} total qty
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSubmit(true)} disabled={loading}>
              {loading ? 'Processing...' : 'Yes, Post Document'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
