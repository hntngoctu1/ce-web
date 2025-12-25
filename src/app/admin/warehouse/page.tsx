import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  Package,
  ClipboardList,
  Building2,
  TrendingUp,
  Activity,
  AlertTriangle,
  PackageX,
  Plus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db';

async function getOverview() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get 7 days of movement data
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [invAgg, lowStockItems, outOfStock, movesToday, recentMovements] = await Promise.all([
    prisma.inventoryItem.aggregate({
      _sum: { onHandQty: true, reservedQty: true, availableQty: true },
      _count: true,
    }),
    // Get items with reorder point set, then filter in JS
    prisma.inventoryItem.findMany({
      where: {
        OR: [{ availableQty: { lte: 0 } }, { reorderPointQty: { gt: 0 } }],
      },
      include: {
        product: { select: { nameEn: true, sku: true } },
        warehouse: { select: { code: true } },
      },
      orderBy: { availableQty: 'asc' },
      take: 50,
    }),
    prisma.inventoryItem.count({
      where: { availableQty: { lte: 0 } },
    }),
    prisma.stockMovement.count({
      where: { createdAt: { gte: today } },
    }),
    prisma.stockMovement.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, movementType: true, qtyChangeOnHand: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // Calculate low stock count from fetched items
  const lowStock = lowStockItems.filter(
    (item) =>
      Number(item.availableQty) > 0 &&
      Number(item.reorderPointQty) > 0 &&
      Number(item.availableQty) <= Number(item.reorderPointQty)
  ).length;

  // Aggregate movements by day
  const movementsByDay: Record<string, { inbound: number; outbound: number }> = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo);
    date.setDate(date.getDate() + i);
    const key = date.toISOString().split('T')[0];
    movementsByDay[key] = { inbound: 0, outbound: 0 };
  }

  for (const mv of recentMovements) {
    const key = mv.createdAt.toISOString().split('T')[0];
    if (movementsByDay[key]) {
      const qty = Math.abs(Number(mv.qtyChangeOnHand));
      if (
        ['GRN', 'RESTOCK', 'ADJUSTMENT'].includes(mv.movementType) &&
        Number(mv.qtyChangeOnHand) > 0
      ) {
        movementsByDay[key].inbound += qty;
      } else if (
        ['ISSUE', 'DEDUCT', 'TRANSFER'].includes(mv.movementType) ||
        Number(mv.qtyChangeOnHand) < 0
      ) {
        movementsByDay[key].outbound += qty;
      }
    }
  }

  const chartData = Object.entries(movementsByDay).map(([date, data]) => ({
    date: new Date(date).toLocaleDateString('en', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
    ...data,
  }));

  return {
    totalItems: invAgg._count || 0,
    onHand: Number(invAgg._sum.onHandQty || 0),
    reserved: Number(invAgg._sum.reservedQty || 0),
    available: Number(invAgg._sum.availableQty || 0),
    lowStock,
    outOfStock,
    movesToday,
    chartData,
    lowStockItems: lowStockItems.slice(0, 10).map((item) => ({
      productName: item.product?.nameEn || 'Unknown',
      sku: item.product?.sku || '-',
      warehouse: item.warehouse?.code || 'MAIN',
      available: Number(item.availableQty),
      reorderPoint: Number(item.reorderPointQty || 0),
    })),
  };
}

export default async function WarehouseOverviewPage() {
  const overview = await getOverview();
  const t = await getTranslations('admin.warehouse.overviewPage');
  const tInv = await getTranslations('admin.warehouse.inventoryPage');

  const maxMovement = Math.max(
    ...overview.chartData.map((d) => Math.max(d.inbound, d.outbound)),
    1
  );

  const cards = [
    {
      title: tInv('title'),
      desc: t('inventoryDesc'),
      href: '/admin/warehouse/inventory',
      icon: Package,
    },
    {
      title: t('documentsCount') || 'Documents',
      desc: t('documentsDesc'),
      href: '/admin/warehouse/documents',
      icon: ClipboardList,
    },
    {
      title: t('warehouses') || 'Warehouses',
      desc: t('warehousesDesc'),
      href: '/admin/warehouse/warehouses',
      icon: Building2,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/warehouse/documents/new">
              <Plus className="mr-2 h-4 w-4" />
              {tInv('newDocument')}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/warehouse/inventory">{t('viewInventory')}</Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('skusTracked')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{tInv('onHand')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {overview.onHand.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{tInv('reserved')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {overview.reserved.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{tInv('available')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {overview.available.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              {t('today')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {overview.movesToday} {t('movements')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className={overview.outOfStock > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <PackageX
                className={`h-4 w-4 ${overview.outOfStock > 0 ? 'text-red-600' : 'text-muted-foreground'}`}
              />
              {t('outOfStock')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${overview.outOfStock > 0 ? 'text-red-600' : 'text-slate-400'}`}
            >
              {overview.outOfStock}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t('itemsZeroAvailable')}</p>
          </CardContent>
        </Card>
        <Card className={overview.lowStock > 0 ? 'border-amber-200 bg-amber-50' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle
                className={`h-4 w-4 ${overview.lowStock > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}
              />
              {t('lowStock')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${overview.lowStock > 0 ? 'text-amber-600' : 'text-slate-400'}`}
            >
              {overview.lowStock}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t('itemsBelowReorder')}</p>
          </CardContent>
        </Card>
      </div>

      {/* 7-day Movement Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-ce-primary" />
            {t('stockMovements7Days')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {overview.chartData.map((day, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-24 truncate text-xs text-muted-foreground">{day.date}</div>
                <div className="flex flex-1 items-center gap-2">
                  <div className="flex flex-1 items-center gap-1">
                    <div
                      className="h-4 rounded-sm bg-emerald-500 transition-all"
                      style={{
                        width: `${(day.inbound / maxMovement) * 100}%`,
                        minWidth: day.inbound > 0 ? '4px' : '0',
                      }}
                    />
                    <span className="w-10 text-xs text-emerald-700">+{day.inbound}</span>
                  </div>
                  <div className="flex flex-1 items-center gap-1">
                    <div
                      className="h-4 rounded-sm bg-blue-500 transition-all"
                      style={{
                        width: `${(day.outbound / maxMovement) * 100}%`,
                        minWidth: day.outbound > 0 ? '4px' : '0',
                      }}
                    />
                    <span className="w-10 text-xs text-blue-700">-{day.outbound}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-emerald-500" /> {t('inbound')}
            </span>
            <span className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-blue-500" /> {t('outbound')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Items Table */}
      {overview.lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t('criticalStockLevels')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium">{tInv('product')}</th>
                    <th className="py-2 text-left font-medium">{tInv('sku')}</th>
                    <th className="py-2 text-left font-medium">{tInv('warehouse')}</th>
                    <th className="py-2 text-right font-medium">{tInv('available')}</th>
                    <th className="py-2 text-right font-medium">{t('reorderPoint')}</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {overview.lowStockItems.map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 font-medium">{item.productName}</td>
                      <td className="py-2 font-mono text-xs">{item.sku}</td>
                      <td className="py-2">{item.warehouse}</td>
                      <td
                        className={`py-2 text-right font-bold ${item.available <= 0 ? 'text-red-600' : 'text-amber-600'}`}
                      >
                        {item.available}
                      </td>
                      <td className="py-2 text-right text-muted-foreground">{item.reorderPoint}</td>
                      <td className="py-2 text-right">
                        <Badge variant={item.available <= 0 ? 'destructive' : 'secondary'}>
                          {item.available <= 0 ? t('oos') : t('low')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/warehouse/documents/new">{t('createGrn')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-full bg-ce-primary/10 p-2 text-ce-primary">
                <card.icon className="h-5 w-5" />
              </div>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{card.desc}</p>
              <Button variant="ghost" asChild className="px-0 text-ce-primary">
                <Link href={card.href}>{t('open')}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
