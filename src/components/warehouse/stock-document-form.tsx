'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Save, Send, Loader2, Package, AlertCircle } from 'lucide-react';

type DocType = 'GRN' | 'ISSUE' | 'ADJUSTMENT' | 'TRANSFER';

type Product = {
  id: string;
  nameEn: string;
  sku: string | null;
};

type Warehouse = {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
};

type LineItem = {
  productId: string;
  productName: string;
  sku: string;
  qty: number;
};

export function StockDocumentForm({ docType }: { docType: DocType }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const [warehouseId, setWarehouseId] = useState('');
  const [targetWarehouseId, setTargetWarehouseId] = useState('');
  const [note, setNote] = useState('');
  const [lines, setLines] = useState<LineItem[]>([]);

  useEffect(() => {
    fetchWarehouses();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (productSearch.length > 0) {
      const q = productSearch.toLowerCase();
      setFilteredProducts(
        products
          .filter(
            (p) => p.nameEn.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q))
          )
          .slice(0, 10)
      );
    } else {
      setFilteredProducts([]);
    }
  }, [productSearch, products]);

  async function fetchWarehouses() {
    try {
      const res = await fetch('/api/warehouses');
      if (res.ok) {
        const data = await res.json();
        setWarehouses(data.warehouses || []);
        const defaultWh = data.warehouses?.find((w: Warehouse) => w.isDefault);
        if (defaultWh) setWarehouseId(defaultWh.id);
      }
    } catch (e) {
      console.error('Failed to fetch warehouses', e);
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products?limit=500');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error('Failed to fetch products', e);
    } finally {
      setLoading(false);
    }
  }

  function addLine(product: Product) {
    if (lines.some((l) => l.productId === product.id)) {
      setError('Product already added');
      return;
    }
    setLines([
      ...lines,
      {
        productId: product.id,
        productName: product.nameEn,
        sku: product.sku || '',
        qty: 1,
      },
    ]);
    setProductSearch('');
    setFilteredProducts([]);
    setError(null);
  }

  function updateLineQty(index: number, qty: number) {
    const updated = [...lines];
    updated[index].qty = Math.max(1, qty);
    setLines(updated);
  }

  function removeLine(index: number) {
    setLines(lines.filter((_, i) => i !== index));
  }

  async function handleSubmit(postImmediately: boolean) {
    setError(null);
    setSuccess(null);

    if (!warehouseId) {
      setError('Please select a warehouse');
      return;
    }

    if (docType === 'TRANSFER' && (!targetWarehouseId || targetWarehouseId === warehouseId)) {
      setError('Please select a different target warehouse for transfer');
      return;
    }

    if (lines.length === 0) {
      setError('Please add at least one product');
      return;
    }

    setSaving(true);

    try {
      // Create draft document
      const createRes = await fetch('/api/warehouse/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: docType,
          warehouseId,
          targetWarehouseId: docType === 'TRANSFER' ? targetWarehouseId : undefined,
          note,
          lines: lines.map((l) => ({
            productId: l.productId,
            qty: l.qty,
          })),
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error || 'Failed to create document');
      }

      const { document } = await createRes.json();

      if (postImmediately) {
        // Post the document
        const postRes = await fetch(`/api/warehouse/docs/${document.id}/post`, {
          method: 'POST',
        });

        if (!postRes.ok) {
          const err = await postRes.json();
          throw new Error(err.error || 'Failed to post document');
        }

        setSuccess(`Document ${document.code} created and posted successfully!`);
      } else {
        setSuccess(`Draft document ${document.code} created successfully!`);
      }

      // Reset form
      setLines([]);
      setNote('');
      setTargetWarehouseId('');

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/warehouse/documents');
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  }

  const typeLabels: Record<DocType, { label: string; color: string; desc: string }> = {
    GRN: {
      label: 'Goods Receipt',
      color: 'bg-emerald-100 text-emerald-800',
      desc: 'Receive items into inventory',
    },
    ISSUE: {
      label: 'Issue / Delivery',
      color: 'bg-blue-100 text-blue-800',
      desc: 'Issue items from inventory',
    },
    ADJUSTMENT: {
      label: 'Adjustment',
      color: 'bg-amber-100 text-amber-800',
      desc: 'Adjust inventory quantities (+/-)',
    },
    TRANSFER: {
      label: 'Transfer',
      color: 'bg-purple-100 text-purple-800',
      desc: 'Transfer between warehouses',
    },
  };

  const typeInfo = typeLabels[docType];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
              <CardTitle className="mt-2">Create Stock Document</CardTitle>
              <p className="text-sm text-muted-foreground">{typeInfo.desc}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Warehouse Selection */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Source Warehouse *</Label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select warehouse...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name} {w.isDefault && '(Default)'}
                  </option>
                ))}
              </select>
            </div>

            {docType === 'TRANSFER' && (
              <div className="space-y-2">
                <Label>Target Warehouse *</Label>
                <select
                  value={targetWarehouseId}
                  onChange={(e) => setTargetWarehouseId(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select target warehouse...</option>
                  {warehouses
                    .filter((w) => w.id !== warehouseId)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label>Note</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note for this document..."
            />
          </div>

          {/* Product Search */}
          <div className="space-y-2">
            <Label>Add Products</Label>
            <div className="relative">
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search by name or SKU..."
                disabled={loading}
              />
              {filteredProducts.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addLine(p)}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-slate-50"
                    >
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{p.nameEn}</p>
                        <p className="text-xs text-muted-foreground">{p.sku || 'No SKU'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          {lines.length > 0 && (
            <div className="space-y-2">
              <Label>Items ({lines.length})</Label>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Product</th>
                      <th className="px-4 py-2 text-left font-medium">SKU</th>
                      <th className="w-32 px-4 py-2 text-left font-medium">Qty</th>
                      <th className="w-12 px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, i) => (
                      <tr key={line.productId} className="border-t">
                        <td className="px-4 py-2">{line.productName}</td>
                        <td className="px-4 py-2 font-mono text-xs">{line.sku || '-'}</td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            min={docType === 'ADJUSTMENT' ? undefined : 1}
                            value={line.qty}
                            onChange={(e) => updateLineQty(i, parseInt(e.target.value) || 0)}
                            className="h-8 w-24"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLine(i)}
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/warehouse/documents')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={saving || lines.length === 0}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save as Draft
            </Button>
            <Button onClick={() => handleSubmit(true)} disabled={saving || lines.length === 0}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Post Document
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
