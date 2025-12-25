import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Plus, AlertTriangle, PackageX, Search, Package, RefreshCw } from 'lucide-react';
import { QuickAdjustModal } from '@/components/warehouse/quick-adjust-modal';

interface InventoryPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    warehouse?: string;
  }>;
}

async function getInventory(params: { q?: string; status?: string; warehouse?: string }) {
  const where: Record<string, unknown> = {};

  if (params.q) {
    where.product = {
      OR: [
        { nameEn: { contains: params.q, mode: 'insensitive' } },
        { sku: { contains: params.q, mode: 'insensitive' } },
      ],
    };
  }

  if (params.status === 'out_of_stock') {
    where.availableQty = { lte: 0 };
  } else if (params.status === 'low_stock') {
    where.reorderPointQty = { gt: 0 };
    where.availableQty = { gt: 0 };
  }

  if (params.warehouse) {
    where.warehouseId = params.warehouse;
  }

  const [items, agg, warehouses, outCount, lowCount] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      include: {
        product: { select: { nameEn: true, sku: true } },
        warehouse: { select: { name: true, code: true } },
      },
      orderBy: { availableQty: 'asc' },
      take: 100,
    }),
    prisma.inventoryItem.aggregate({
      where,
      _count: true,
      _sum: { availableQty: true, onHandQty: true, reservedQty: true },
    }),
    prisma.warehouse.findMany({ orderBy: { isDefault: 'desc' } }),
    prisma.inventoryItem.count({ where: { availableQty: { lte: 0 } } }),
    prisma.inventoryItem.count({
      where: { reorderPointQty: { gt: 0 }, availableQty: { gt: 0 } },
    }),
  ]);

  return { items, agg, warehouses, outCount, lowCount };
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const params = await searchParams;
  const t = await getTranslations('admin.warehouse.inventoryPage');
  const { items, agg, warehouses, outCount, lowCount } = await getInventory(params);

  const statusFilters = [
    { value: '', label: t('allStatus'), count: null },
    { value: 'out_of_stock', label: t('outOfStock'), count: outCount, color: 'text-red-600' },
    { value: 'low_stock', label: t('lowStock'), count: lowCount, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/warehouse/documents/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('newDocument')}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link
              href={`/api/inventory/export?${new URLSearchParams(params as Record<string, string>).toString()}`}
              target="_blank"
            >
              <Download className="mr-2 h-4 w-4" />
              {t('exportCsv')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Alert Cards */}
      {(outCount > 0 || lowCount > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {outCount > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center gap-4 py-4">
                <PackageX className="h-8 w-8 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-600">{outCount}</div>
                  <div className="text-sm text-red-700">{t('itemsOutOfStock')}</div>
                </div>
                <Button variant="outline" size="sm" className="ml-auto" asChild>
                  <Link href="?status=out_of_stock">{t('viewAll')}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {lowCount > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex items-center gap-4 py-4">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
                <div>
                  <div className="text-2xl font-bold text-amber-600">{lowCount}</div>
                  <div className="text-sm text-amber-700">{t('itemsBelowReorder')}</div>
                </div>
                <Button variant="outline" size="sm" className="ml-auto" asChild>
                  <Link href="?status=low_stock">{t('viewAll')}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('records')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agg._count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('onHand')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(agg._sum.onHandQty || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('reserved')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {Number(agg._sum.reservedQty || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('available')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {Number(agg._sum.availableQty || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <form className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder={t('searchPlaceholder')}
                defaultValue={params.q}
                className="pl-10"
              />
            </div>
            <select
              name="status"
              defaultValue={params.status || ''}
              className="h-10 min-w-[150px] rounded-md border border-input bg-background px-3 text-sm"
            >
              {statusFilters.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label} {f.count !== null ? `(${f.count})` : ''}
                </option>
              ))}
            </select>
            <select
              name="warehouse"
              defaultValue={params.warehouse || ''}
              className="h-10 min-w-[150px] rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">{t('allWarehouses')}</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
            <Button type="submit">{t('filter')}</Button>
            <Button type="button" variant="ghost" asChild>
              <Link href="/admin/warehouse/inventory">{t('reset')}</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('inventoryItems')} ({agg._count})
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-3 font-medium">{t('product')}</th>
                <th className="px-3 py-3 font-medium">{t('sku')}</th>
                <th className="px-3 py-3 font-medium">{t('warehouse')}</th>
                <th className="px-3 py-3 text-right font-medium">{t('onHand')}</th>
                <th className="px-3 py-3 text-right font-medium">{t('reserved')}</th>
                <th className="px-3 py-3 text-right font-medium">{t('available')}</th>
                <th className="px-3 py-3 text-right font-medium">{t('reorderPt')}</th>
                <th className="px-3 py-3 font-medium">{t('status')}</th>
                <th className="px-3 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const available = Number(item.availableQty);
                const onHand = Number(item.onHandQty);
                const reserved = Number(item.reservedQty);
                const reorderPt = Number(item.reorderPointQty || 0);
                const oos = available <= 0;
                const low = !oos && reorderPt > 0 && available <= reorderPt;

                return (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-3">
                      <div className="font-medium">{item.product.nameEn}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">{item.product.sku || '-'}</td>
                    <td className="px-3 py-3">
                      <Badge variant="outline">{item.warehouse.code}</Badge>
                    </td>
                    <td className="px-3 py-3 text-right">{onHand.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right text-amber-600">
                      {reserved.toLocaleString()}
                    </td>
                    <td
                      className={`px-3 py-3 text-right font-semibold ${oos ? 'text-red-600' : low ? 'text-amber-600' : 'text-emerald-600'}`}
                    >
                      {available.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right text-muted-foreground">
                      {reorderPt > 0 ? reorderPt : '-'}
                    </td>
                    <td className="px-3 py-3">
                      {oos ? (
                        <Badge variant="destructive">{t('outOfStock')}</Badge>
                      ) : low ? (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                          {t('lowStock')}
                        </Badge>
                      ) : (
                        <Badge variant="ce">{t('inStock')}</Badge>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <QuickAdjustModal
                        productId={item.productId}
                        productName={item.product.nameEn}
                        productSku={item.product.sku}
                        warehouseId={item.warehouseId}
                        warehouseCode={item.warehouse.code}
                        currentOnHand={onHand}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="mr-1 h-4 w-4" />
                            {t('adjust')}
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-12 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      {params.q || params.status || params.warehouse
                        ? t('noItemsFilter')
                        : t('noItemsYet')}
                    </p>
                    <div className="mt-4 flex justify-center gap-2">
                      {(params.q || params.status || params.warehouse) && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/admin/warehouse/inventory">{t('clearFilters')}</Link>
                        </Button>
                      )}
                      <Button size="sm" asChild>
                        <Link href="/admin/warehouse/documents/new">{t('createDocument')}</Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
