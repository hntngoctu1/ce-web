import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/shared/database';
import { cn, formatPrice } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

// Helper functions
function getDateRange(period: 'today' | 'week' | 'month' | 'year') {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return { start, end: now };
}

async function getAnalytics() {
  const today = getDateRange('today');
  const yesterday = {
    start: new Date(today.start.getTime() - 24 * 60 * 60 * 1000),
    end: new Date(today.start.getTime()),
  };
  const thisMonth = getDateRange('month');
  const thisYear = getDateRange('year');

  // Revenue stats
  const [todayRevenue, yesterdayRevenue, monthRevenue, yearRevenue] = await Promise.all([
    prisma.order.aggregate({
      where: {
        createdAt: { gte: today.start },
        orderStatus: { in: ['CONFIRMED', 'PACKING', 'SHIPPED', 'DELIVERED'] },
      },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: yesterday.start, lt: yesterday.end },
        orderStatus: { in: ['CONFIRMED', 'PACKING', 'SHIPPED', 'DELIVERED'] },
      },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: thisMonth.start },
        orderStatus: { in: ['CONFIRMED', 'PACKING', 'SHIPPED', 'DELIVERED'] },
      },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: thisYear.start },
        orderStatus: { in: ['CONFIRMED', 'PACKING', 'SHIPPED', 'DELIVERED'] },
      },
      _sum: { total: true },
      _count: true,
    }),
  ]);

  // Order stats
  const ordersByStatus = await prisma.order.groupBy({
    by: ['orderStatus'],
    _count: true,
  });

  // Customer stats
  const [totalCustomers, newCustomersToday, newCustomersMonth] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({
      where: { role: 'CUSTOMER', createdAt: { gte: today.start } },
    }),
    prisma.user.count({
      where: { role: 'CUSTOMER', createdAt: { gte: thisMonth.start } },
    }),
  ]);

  // Product stats
  const [totalProducts, lowStockProducts, outOfStockProducts] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.inventoryItem.count({
      where: {
        availableQty: { gt: 0, lte: 10 },
      },
    }),
    prisma.inventoryItem.count({
      where: { availableQty: { lte: 0 } },
    }),
  ]);

  // Top products
  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      order: {
        createdAt: { gte: thisMonth.start },
        orderStatus: { in: ['CONFIRMED', 'PACKING', 'SHIPPED', 'DELIVERED'] },
      },
    },
    _sum: { quantity: true, totalPrice: true },
    _count: true,
    orderBy: { _sum: { totalPrice: 'desc' } },
    take: 5,
  });

  // Get product details
  const topProductIds = topProducts.map((p) => p.productId).filter(Boolean) as string[];
  const productDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, nameVi: true, nameEn: true },
  });

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      total: true,
      orderStatus: true,
      createdAt: true,
    },
  });

  // Sales by day (last 7 days)
  const salesByDay = await Promise.all(
    Array.from({ length: 7 }, async (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const result = await prisma.order.aggregate({
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
          orderStatus: { in: ['CONFIRMED', 'PACKING', 'SHIPPED', 'DELIVERED'] },
        },
        _sum: { total: true },
        _count: true,
      });

      return {
        date: dayStart.toISOString().split('T')[0],
        day: dayStart.toLocaleDateString('vi-VN', { weekday: 'short' }),
        revenue: Number(result._sum.total || 0),
        orders: result._count,
      };
    })
  );

  return {
    revenue: {
      today: Number(todayRevenue._sum.total || 0),
      yesterday: Number(yesterdayRevenue._sum.total || 0),
      month: Number(monthRevenue._sum.total || 0),
      year: Number(yearRevenue._sum.total || 0),
    },
    orders: {
      today: todayRevenue._count,
      yesterday: yesterdayRevenue._count,
      month: monthRevenue._count,
      byStatus: ordersByStatus.reduce((acc, s) => {
        acc[s.orderStatus] = s._count;
        return acc;
      }, {} as Record<string, number>),
    },
    customers: {
      total: totalCustomers,
      newToday: newCustomersToday,
      newMonth: newCustomersMonth,
    },
    products: {
      total: totalProducts,
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts,
    },
    topProducts: topProducts.map((p) => {
      const product = productDetails.find((pd) => pd.id === p.productId);
      return {
        id: p.productId,
        name: product?.nameVi || product?.nameEn || 'N/A',
        sold: p._sum.quantity || 0,
        revenue: Number(p._sum.totalPrice || 0),
      };
    }),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.customerName,
      total: Number(o.total),
      status: o.orderStatus,
      createdAt: o.createdAt.toISOString(),
    })),
    salesByDay: salesByDay.reverse(),
  };
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  format = 'number',
}: {
  title: string;
  value: number;
  change?: number;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'currency';
}) {
  const displayValue = format === 'currency' 
    ? formatPrice(value, 'VND', 'vi-VN')
    : value.toLocaleString('vi-VN');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <Icon className="h-5 w-5 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        {change !== undefined && (
          <div className={cn(
            'mt-1 flex items-center text-sm',
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
          )}>
            {trend === 'up' ? (
              <ArrowUpRight className="mr-1 h-4 w-4" />
            ) : trend === 'down' ? (
              <ArrowDownRight className="mr-1 h-4 w-4" />
            ) : null}
            <span>{change > 0 ? '+' : ''}{change.toFixed(1)}%</span>
            <span className="ml-1 text-gray-400">so với hôm qua</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    PENDING_CONFIRMATION: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-700' },
    PACKING: { bg: 'bg-purple-100', text: 'text-purple-700' },
    SHIPPED: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    DELIVERED: { bg: 'bg-green-100', text: 'text-green-700' },
    CANCELED: { bg: 'bg-red-100', text: 'text-red-700' },
    FAILED: { bg: 'bg-gray-100', text: 'text-gray-700' },
  };

  const { bg, text } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };

  return (
    <span className={cn('rounded-full px-2 py-1 text-xs font-medium', bg, text)}>
      {status}
    </span>
  );
}

export default async function AnalyticsDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role as string)) {
    redirect('/login');
  }

  const data = await getAnalytics();

  // Calculate change percentages
  const revenueChange = data.revenue.yesterday > 0
    ? ((data.revenue.today - data.revenue.yesterday) / data.revenue.yesterday) * 100
    : data.revenue.today > 0 ? 100 : 0;

  const ordersChange = data.orders.yesterday > 0
    ? ((data.orders.today - data.orders.yesterday) / data.orders.yesterday) * 100
    : data.orders.today > 0 ? 100 : 0;

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Tổng quan hoạt động kinh doanh
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Doanh thu hôm nay"
          value={data.revenue.today}
          change={revenueChange}
          icon={DollarSign}
          trend={revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'neutral'}
          format="currency"
        />
        <StatCard
          title="Đơn hàng hôm nay"
          value={data.orders.today}
          change={ordersChange}
          icon={ShoppingCart}
          trend={ordersChange > 0 ? 'up' : ordersChange < 0 ? 'down' : 'neutral'}
        />
        <StatCard
          title="Khách hàng mới"
          value={data.customers.newToday}
          icon={Users}
        />
        <StatCard
          title="Sản phẩm sắp hết"
          value={data.products.lowStock}
          icon={Package}
        />
      </div>

      {/* Charts & Tables */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Doanh thu 7 ngày qua</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <div className="flex h-full items-end gap-2">
                {data.salesByDay.map((day, i) => {
                  const maxRevenue = Math.max(...data.salesByDay.map((d) => d.revenue));
                  const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center gap-2">
                      <div className="w-full rounded-t-md bg-ce-primary/10 transition-all hover:bg-ce-primary/20"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      >
                        <div
                          className="w-full rounded-t-md bg-ce-primary"
                          style={{ height: '100%' }}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-900">
                          {formatPrice(day.revenue, 'VND', 'vi-VN')}
                        </div>
                        <div className="text-xs text-gray-500">{day.day}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.orders.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm bán chạy (30 ngày)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.length === 0 ? (
                <p className="text-center text-gray-500">Chưa có dữ liệu</p>
              ) : (
                data.topProducts.map((product, i) => (
                  <div key={product.id || i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ce-primary/10 text-sm font-bold text-ce-primary">
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.sold} đã bán
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatPrice(product.revenue, 'VND', 'vi-VN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentOrders.length === 0 ? (
                <p className="text-center text-gray-500">Chưa có đơn hàng</p>
              ) : (
                data.recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">{order.customer}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatPrice(order.total, 'VND', 'vi-VN')}
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Doanh thu tháng này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(data.revenue.month, 'VND', 'vi-VN')}
            </div>
            <div className="text-sm text-gray-500">
              {data.orders.month} đơn hàng
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Tổng khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.customers.total}</div>
            <div className="text-sm text-gray-500">
              +{data.customers.newMonth} tháng này
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Cảnh báo tồn kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {data.products.lowStock}
                </div>
                <div className="text-sm text-gray-500">Sắp hết</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {data.products.outOfStock}
                </div>
                <div className="text-sm text-gray-500">Hết hàng</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

