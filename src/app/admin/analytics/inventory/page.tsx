import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Clock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/shared/database';
import { formatPrice, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const dynamic = 'force-dynamic';

type TurnoverCategory = 'fast' | 'normal' | 'slow' | 'deadStock';

const TURNOVER_CONFIG: Record<TurnoverCategory, { label: string; color: string; bgColor: string }> = {
  fast: { label: 'Bán nhanh', color: 'text-green-600', bgColor: 'bg-green-100' },
  normal: { label: 'Bình thường', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  slow: { label: 'Bán chậm', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  deadStock: { label: 'Tồn kho chết', color: 'text-red-600', bgColor: 'bg-red-100' },
};

async function getInventoryAnalytics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Get all products with inventory
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      inventoryItems: {
        include: {
          warehouse: { select: { name: true } },
        },
      },
      orderItems: {
        where: {
          order: {
            createdAt: { gte: ninetyDaysAgo },
            orderStatus: { in: ['CONFIRMED', 'PACKING', 'SHIPPED', 'DELIVERED'] },
          },
        },
        select: {
          quantity: true,
          createdAt: true,
        },
      },
    },
  });

  // Calculate inventory metrics for each product
  const inventoryData = products.map((product) => {
    const totalStock = product.inventoryItems.reduce(
      (sum, i) => sum + Number(i.availableQty),
      0
    );
    const reservedStock = product.inventoryItems.reduce(
      (sum, i) => sum + Number(i.reservedQty),
      0
    );
    const onHandStock = product.inventoryItems.reduce(
      (sum, i) => sum + Number(i.onHandQty),
      0
    );

    // Sales in last 30 days
    const salesLast30 = product.orderItems
      .filter((oi) => new Date(oi.createdAt) >= thirtyDaysAgo)
      .reduce((sum, oi) => sum + oi.quantity, 0);

    // Sales in last 90 days
    const salesLast90 = product.orderItems.reduce((sum, oi) => sum + oi.quantity, 0);

    // Average daily sales
    const avgDailySales = salesLast30 / 30;

    // Days until stockout
    const daysUntilStockout = avgDailySales > 0
      ? Math.floor(totalStock / avgDailySales)
      : totalStock > 0 ? 999 : 0;

    // Turnover rate (how many times stock is sold per month)
    const turnoverRate = onHandStock > 0 ? salesLast30 / onHandStock : 0;

    // Category
    let turnoverCategory: TurnoverCategory;
    if (turnoverRate >= 2) turnoverCategory = 'fast';
    else if (turnoverRate >= 0.5) turnoverCategory = 'normal';
    else if (turnoverRate >= 0.1) turnoverCategory = 'slow';
    else turnoverCategory = 'deadStock';

    // Reorder recommendation
    const reorderPoint = product.inventoryItems[0]?.reorderPointQty
      ? Number(product.inventoryItems[0].reorderPointQty)
      : avgDailySales * 14; // 2 weeks safety stock
    const needsReorder = totalStock <= reorderPoint;

    // Recommended order quantity
    const reorderQty = product.inventoryItems[0]?.reorderQty
      ? Number(product.inventoryItems[0].reorderQty)
      : Math.ceil(avgDailySales * 30); // 1 month supply

    return {
      id: product.id,
      name: product.nameVi || product.nameEn,
      sku: product.sku,
      price: Number(product.price),
      totalStock,
      reservedStock,
      onHandStock,
      salesLast30,
      salesLast90,
      avgDailySales,
      daysUntilStockout,
      turnoverRate,
      turnoverCategory,
      needsReorder,
      reorderPoint,
      reorderQty,
      stockValue: totalStock * Number(product.price),
    };
  });

  // Summary stats
  const totalProducts = inventoryData.length;
  const inStock = inventoryData.filter((p) => p.totalStock > 0).length;
  const lowStock = inventoryData.filter((p) => p.totalStock > 0 && p.needsReorder).length;
  const outOfStock = inventoryData.filter((p) => p.totalStock <= 0).length;
  const totalStockValue = inventoryData.reduce((sum, p) => sum + p.stockValue, 0);

  // Turnover distribution
  const turnoverCounts = inventoryData.reduce((acc, p) => {
    acc[p.turnoverCategory] = (acc[p.turnoverCategory] || 0) + 1;
    return acc;
  }, {} as Record<TurnoverCategory, number>);

  // Products needing attention
  const needsReorderProducts = inventoryData
    .filter((p) => p.needsReorder && p.totalStock > 0)
    .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout)
    .slice(0, 10);

  const outOfStockProducts = inventoryData
    .filter((p) => p.totalStock <= 0)
    .slice(0, 10);

  const deadStockProducts = inventoryData
    .filter((p) => p.turnoverCategory === 'deadStock' && p.totalStock > 0)
    .sort((a, b) => b.stockValue - a.stockValue)
    .slice(0, 10);

  // Top selling products
  const topSelling = [...inventoryData]
    .sort((a, b) => b.salesLast30 - a.salesLast30)
    .slice(0, 10);

  // Warehouse utilization
  const warehouses = await prisma.warehouse.findMany({
    include: {
      inventoryItems: {
        select: {
          onHandQty: true,
          product: { select: { price: true } },
        },
      },
    },
  });

  const warehouseStats = warehouses.map((wh) => ({
    id: wh.id,
    name: wh.name,
    itemCount: wh.inventoryItems.length,
    totalQty: wh.inventoryItems.reduce((sum, i) => sum + Number(i.onHandQty), 0),
    totalValue: wh.inventoryItems.reduce(
      (sum, i) => sum + Number(i.onHandQty) * Number(i.product.price),
      0
    ),
  }));

  return {
    summary: {
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
      totalStockValue,
    },
    turnoverCounts,
    needsReorderProducts,
    outOfStockProducts,
    deadStockProducts,
    topSelling,
    warehouseStats,
    allProducts: inventoryData.slice(0, 50),
  };
}

export default async function InventoryAnalyticsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role as string)) {
    redirect('/login');
  }

  const data = await getInventoryAnalytics();

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/analytics"
          className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Quay lại Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Analytics</h1>
        <p className="mt-1 text-gray-500">
          Phân tích tồn kho và dự báo nhu cầu
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tổng sản phẩm</CardTitle>
            <Package className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Còn hàng</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.summary.inStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Sắp hết</CardTitle>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data.summary.lowStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Hết hàng</CardTitle>
            <XCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.summary.outOfStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Giá trị tồn kho</CardTitle>
            <Package className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(data.summary.totalStockValue, 'VND', 'vi-VN')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Turnover Distribution */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Phân loại vòng quay hàng hóa</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {(Object.entries(TURNOVER_CONFIG) as [TurnoverCategory, typeof TURNOVER_CONFIG['fast']][]).map(
            ([category, config]) => {
              const count = data.turnoverCounts[category] || 0;
              const percentage = data.summary.totalProducts > 0
                ? (count / data.summary.totalProducts) * 100
                : 0;

              return (
                <Card key={category}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn('h-3 w-3 rounded-full', config.bgColor)} />
                        <span className="font-medium">{config.label}</span>
                      </div>
                      <span className="text-xl font-bold">{count}</span>
                    </div>
                    <Progress value={percentage} className="mt-2 h-2" />
                    <p className="mt-1 text-right text-sm text-gray-500">
                      {percentage.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>
      </div>

      {/* Alerts Section */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        {/* Needs Reorder */}
        <Card>
          <CardHeader className="border-b bg-yellow-50">
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              Cần đặt hàng ({data.needsReorderProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-y-auto py-4">
            {data.needsReorderProducts.length === 0 ? (
              <p className="text-center text-gray-500">Không có sản phẩm cần đặt</p>
            ) : (
              <div className="space-y-3">
                {data.needsReorderProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <div className="font-medium line-clamp-1">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        Còn {product.totalStock} • Hết trong {product.daysUntilStockout} ngày
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      Đặt {product.reorderQty}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Out of Stock */}
        <Card>
          <CardHeader className="border-b bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Hết hàng ({data.outOfStockProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-y-auto py-4">
            {data.outOfStockProducts.length === 0 ? (
              <p className="text-center text-gray-500">Tất cả sản phẩm còn hàng</p>
            ) : (
              <div className="space-y-3">
                {data.outOfStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <div className="font-medium line-clamp-1">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        Bán 30 ngày: {product.salesLast30}
                      </div>
                    </div>
                    <Badge variant="destructive" className="shrink-0">
                      Hết hàng
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dead Stock */}
        <Card>
          <CardHeader className="border-b bg-gray-100">
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <RotateCcw className="h-5 w-5" />
              Tồn kho chết ({data.deadStockProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-y-auto py-4">
            {data.deadStockProducts.length === 0 ? (
              <p className="text-center text-gray-500">Không có hàng tồn kho chết</p>
            ) : (
              <div className="space-y-3">
                {data.deadStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <div className="font-medium line-clamp-1">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        Tồn: {product.totalStock} • {formatPrice(product.stockValue, 'VND')}
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {product.salesLast90} bán/90d
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Selling & Warehouse */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Selling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Bán chạy nhất (30 ngày)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topSelling.map((product, i) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                      i < 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    )}>
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-medium line-clamp-1">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        Tồn: {product.totalStock} | Vòng quay: {product.turnoverRate.toFixed(2)}x
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {product.salesLast30} đã bán
                    </div>
                    <div className="text-sm text-gray-500">
                      ~{product.avgDailySales.toFixed(1)}/ngày
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Warehouse Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              Thống kê kho hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.warehouseStats.map((wh) => (
                <div key={wh.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold">{wh.name}</span>
                    <Badge variant="outline">{wh.itemCount} SKUs</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Tổng số lượng:</span>
                      <span className="ml-2 font-medium">{wh.totalQty.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Giá trị:</span>
                      <span className="ml-2 font-medium">
                        {formatPrice(wh.totalValue, 'VND', 'vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Products Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Chi tiết tồn kho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Sản phẩm</th>
                  <th className="pb-3 font-medium">SKU</th>
                  <th className="pb-3 font-medium text-right">Tồn kho</th>
                  <th className="pb-3 font-medium text-right">Bán/30d</th>
                  <th className="pb-3 font-medium text-right">Vòng quay</th>
                  <th className="pb-3 font-medium text-right">Hết trong</th>
                  <th className="pb-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {data.allProducts.map((product) => {
                  const turnoverConfig = TURNOVER_CONFIG[product.turnoverCategory];
                  
                  return (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="max-w-[200px] font-medium line-clamp-1">
                          {product.name}
                        </div>
                      </td>
                      <td className="py-3 font-mono text-xs text-gray-500">
                        {product.sku || '-'}
                      </td>
                      <td className="py-3 text-right">
                        {product.totalStock > 0 ? (
                          <span className={cn(
                            product.needsReorder && 'text-yellow-600 font-semibold'
                          )}>
                            {product.totalStock}
                          </span>
                        ) : (
                          <span className="font-semibold text-red-600">0</span>
                        )}
                      </td>
                      <td className="py-3 text-right">{product.salesLast30}</td>
                      <td className="py-3 text-right">
                        {product.turnoverRate.toFixed(2)}x
                      </td>
                      <td className="py-3 text-right">
                        {product.daysUntilStockout >= 999 ? '∞' : `${product.daysUntilStockout}d`}
                      </td>
                      <td className="py-3">
                        <Badge className={cn('text-white', turnoverConfig.bgColor, turnoverConfig.color)}>
                          {turnoverConfig.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

