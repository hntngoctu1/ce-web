'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Building2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

export default function NewWarehousePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [locations, setLocations] = useState<{ code: string; name: string }[]>([]);

  function addLocation() {
    setLocations([...locations, { code: '', name: '' }]);
  }

  function updateLocation(index: number, field: 'code' | 'name', value: string) {
    const updated = [...locations];
    updated[index][field] = value;
    setLocations(updated);
  }

  function removeLocation(index: number) {
    setLocations(locations.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!code.trim() || !name.trim()) {
      setError('Code and name are required');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          address: address.trim() || null,
          isDefault,
          locations: locations
            .filter((l) => l.code.trim())
            .map((l) => ({
              code: l.code.trim().toUpperCase(),
              name: l.name.trim() || l.code.trim().toUpperCase(),
            })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create warehouse');
      }

      router.push('/admin/warehouse/warehouses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/warehouse/warehouses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Warehouses
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-ce-primary/10 p-2 text-ce-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>New Warehouse</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create a new warehouse with optional bin locations
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g., MAIN, WH01"
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground">Unique identifier, auto-uppercased</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Main Warehouse"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 123 Industrial Park, District 7, HCMC"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(checked === true)}
              />
              <Label htmlFor="isDefault" className="font-normal">
                Set as default warehouse
              </Label>
            </div>

            {/* Locations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Bin Locations (optional)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLocation}>
                  <Plus className="mr-2 h-3 w-3" />
                  Add Location
                </Button>
              </div>

              {locations.length > 0 && (
                <div className="space-y-2 rounded-lg border p-3">
                  {locations.map((loc, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={loc.code}
                        onChange={(e) => updateLocation(i, 'code', e.target.value.toUpperCase())}
                        placeholder="Code (e.g., A-01)"
                        className="w-28"
                      />
                      <Input
                        value={loc.name}
                        onChange={(e) => updateLocation(i, 'name', e.target.value)}
                        placeholder="Name (optional)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLocation(i)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {locations.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No locations added. Inventory will be tracked at warehouse level only.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Create Warehouse
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
