import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Crown,
  UserPlus,
  UserMinus,
  ShoppingBag,
  DollarSign,
  Calendar,
  ArrowLeft,
} from 'lucide-react';

import { auth } from '@/lib/auth';
import { prisma } from '@/shared/database';
import { formatPrice, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

// RFM Segmentation
type RFMSegment =
  | 'Champions'
  | 'Loyal'
  | 'Potential'
  | 'New'
  | 'Promising'
  | 'NeedAttention'
  | 'AboutToSleep'
  | 'AtRisk'
  | 'CantLose'
  | 'Hibernating'
  | 'Lost';

function getRFMSegment(r: number, f: number, m: number): RFMSegment {
  // R, F, M are scores from 1-5 (5 is best)
  if (r >= 4 && f >= 4 && m >= 4) return 'Champions';
  if (r >= 3 && f >= 4 && m >= 3) return 'Loyal';
  if (r >= 4 && f <= 2 && m >= 3) return 'Potential';
  if (r >= 4 && f <= 1) return 'New';
  if (r >= 3 && f >= 2 && m <= 2) return 'Promising';
  if (r >= 2 && r <= 3 && f >= 2 && f <= 3) return 'NeedAttention';
  if (r <= 2 && f >= 2 && f <= 3) return 'AboutToSleep';
  if (r <= 2 && f >= 4) return 'AtRisk';
  if (r <= 1 && f >= 4 && m >= 4) return 'CantLose';
  if (r <= 2 && f <= 2) return 'Hibernating';
  return 'Lost';
}

const SEGMENT_CONFIG: Record<RFMSegment, { color: string; icon: any; description: string }> = {
  Champions: { color: 'bg-green-500', icon: Crown, description: 'Khách hàng tốt nhất, mua nhiều, gần đây' },
  Loyal: { color: 'bg-emerald-500', icon: Users, description: 'Khách trung thành, mua thường xuyên' },
  Potential: { color: 'bg-blue-500', icon: TrendingUp, description: 'Tiềm năng trở thành trung thành' },
  New: { color: 'bg-cyan-500', icon: UserPlus, description: 'Khách hàng mới, cần chăm sóc' },
  Promising: { color: 'bg-teal-500', icon: TrendingUp, description: 'Hứa hẹn, cần khuyến khích' },
  NeedAttention: { color: 'bg-yellow-500', icon: Users, description: 'Cần quan tâm, có thể mất' },
  AboutToSleep: { color: 'bg-orange-500', icon: UserMinus, description: 'Sắp ngủ đông, cần tái kích hoạt' },
  AtRisk: { color: 'bg-red-400', icon: TrendingDown, description: 'Có nguy cơ mất, từng mua nhiều' },
  CantLose: { color: 'bg-red-600', icon: Crown, description: 'Không thể mất, khách VIP cũ' },
  Hibernating: { color: 'bg-gray-400', icon: UserMinus, description: 'Đang ngủ đông, ít hoạt động' },
  Lost: { color: 'bg-gray-600', icon: UserMinus, description: 'Đã mất, không mua lâu' },
};

async function getCustomerAnalytics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  // Get all customers with their order data
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    include: {
      orders: {
        where: {
          orderStatus: { in: ['CONFIRMED', 'PACKING', 'SHIPPED', 'DELIVERED'] },
        },
        select: {
          id: true,
          total: true,
          createdAt: true,
        },
      },
      customerProfile: {
        select: {
          loyaltyPoints: true,
          customerType: true,
        },
      },
    },
  });

  // Calculate RFM for each customer
  const rfmData = customers.map((customer) => {
    const orders = customer.orders;
    
    if (orders.length === 0) {
      return {
        id: customer.id,
        name: customer.name || customer.email,
        email: customer.email,
        totalOrders: 0,
        totalSpent: 0,
        avgOrderValue: 0,
        lastOrderDate: null,
        daysSinceLastOrder: null,
        recency: 1,
        frequency: 1,
        monetary: 1,
        segment: 'New' as RFMSegment,
        loyaltyPoints: customer.customerProfile?.loyaltyPoints || 0,
      };
    }

    const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const lastOrder = orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    const daysSinceLastOrder = Math.floor(
      (now.getTime() - lastOrder.createdAt.getTime()) / (24 * 60 * 60 * 1000)
    );

    // Calculate R, F, M scores (1-5)
    const recency = daysSinceLastOrder <= 7 ? 5 : daysSinceLastOrder <= 30 ? 4 : daysSinceLastOrder <= 90 ? 3 : daysSinceLastOrder <= 180 ? 2 : 1;
    const frequency = orders.length >= 10 ? 5 : orders.length >= 5 ? 4 : orders.length >= 3 ? 3 : orders.length >= 2 ? 2 : 1;
    const monetary = totalSpent >= 50000000 ? 5 : totalSpent >= 20000000 ? 4 : totalSpent >= 5000000 ? 3 : totalSpent >= 1000000 ? 2 : 1;

    return {
      id: customer.id,
      name: customer.name || customer.email,
      email: customer.email,
      totalOrders: orders.length,
      totalSpent,
      avgOrderValue: totalSpent / orders.length,
      lastOrderDate: lastOrder.createdAt,
      daysSinceLastOrder,
      recency,
      frequency,
      monetary,
      segment: getRFMSegment(recency, frequency, monetary),
      loyaltyPoints: customer.customerProfile?.loyaltyPoints || 0,
    };
  });

  // Segment counts
  const segmentCounts = rfmData.reduce((acc, c) => {
    acc[c.segment] = (acc[c.segment] || 0) + 1;
    return acc;
  }, {} as Record<RFMSegment, number>);

  // Cohort analysis (simplified - by registration month)
  const cohorts = await prisma.user.groupBy({
    by: ['createdAt'],
    where: {
      role: 'CUSTOMER',
      createdAt: { gte: oneYearAgo },
    },
    _count: true,
  });

  // Monthly cohort data
  const monthlyCohorts: { month: string; newCustomers: number; retained: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const newCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    });

    const retained = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: { gte: monthStart, lte: monthEnd },
        orders: {
          some: {
            createdAt: { gt: monthEnd },
          },
        },
      },
    });

    monthlyCohorts.unshift({
      month: monthStart.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' }),
      newCustomers,
      retained,
    });
  }

  // Top customers
  const topCustomers = rfmData
    .filter((c) => c.totalOrders > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  // Summary stats
  const totalCustomers = customers.length;
  const activeCustomers = rfmData.filter((c) => c.daysSinceLastOrder !== null && c.daysSinceLastOrder <= 90).length;
  const newCustomers30d = await prisma.user.count({
    where: {
      role: 'CUSTOMER',
      createdAt: { gte: thirtyDaysAgo },
    },
  });
  const totalRevenue = rfmData.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  return {
    summary: {
      totalCustomers,
      activeCustomers,
      newCustomers30d,
      churnRate: totalCustomers > 0 ? ((totalCustomers - activeCustomers) / totalCustomers) * 100 : 0,
      avgLifetimeValue,
      totalRevenue,
    },
    segmentCounts,
    topCustomers,
    monthlyCohorts,
    rfmData: rfmData.slice(0, 50), // Limit for performance
  };
}

export default async function CustomerAnalyticsPage() {
  const session = await auth();
  
  if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role as string)) {
    redirect('/login');
  }

  const data = await getCustomerAnalytics();

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
        <h1 className="text-3xl font-bold text-gray-900">Customer Analytics</h1>
        <p className="mt-1 text-gray-500">
          Phân tích khách hàng theo mô hình RFM
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tổng khách hàng</CardTitle>
            <Users className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalCustomers.toLocaleString()}</div>
            <p className="text-sm text-gray-500">
              +{data.summary.newCustomers30d} tháng này
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Khách hoạt động</CardTitle>
            <ShoppingBag className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.summary.activeCustomers.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">
              {((data.summary.activeCustomers / data.summary.totalCustomers) * 100).toFixed(1)}% tổng số
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tỷ lệ rời bỏ</CardTitle>
            <TrendingDown className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.summary.churnRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-500">
              Không mua 90 ngày
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Giá trị trọn đời</CardTitle>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(data.summary.avgLifetimeValue, 'VND', 'vi-VN')}
            </div>
            <p className="text-sm text-gray-500">
              Trung bình/khách
            </p>
          </CardContent>
        </Card>
      </div>

      {/* RFM Segments */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Phân khúc RFM</h2>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Object.entries(SEGMENT_CONFIG).map(([segment, config]) => {
            const count = data.segmentCounts[segment as RFMSegment] || 0;
            const Icon = config.icon;
            
            return (
              <Card key={segment} className="relative overflow-hidden">
                <div className={cn('absolute left-0 top-0 h-full w-1', config.color)} />
                <CardContent className="py-4 pl-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{segment}</span>
                    </div>
                    <span className="text-xl font-bold">{count}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{config.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Top Customers & Cohort */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Top 10 Khách hàng VIP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topCustomers.map((customer, i) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                      i === 0 ? 'bg-amber-100 text-amber-700' :
                      i === 1 ? 'bg-gray-200 text-gray-700' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    )}>
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-500">
                        {customer.totalOrders} đơn • {customer.loyaltyPoints} điểm
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatPrice(customer.totalSpent, 'VND', 'vi-VN')}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {customer.segment}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cohort Retention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Cohort Retention (12 tháng)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.monthlyCohorts.slice(-6).map((cohort) => {
                const retentionRate = cohort.newCustomers > 0
                  ? (cohort.retained / cohort.newCustomers) * 100
                  : 0;
                
                return (
                  <div key={cohort.month} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{cohort.month}</span>
                      <span className="text-gray-500">
                        {cohort.retained}/{cohort.newCustomers} ({retentionRate.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${retentionRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RFM Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Chi tiết khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Khách hàng</th>
                  <th className="pb-3 font-medium">Đơn hàng</th>
                  <th className="pb-3 font-medium">Tổng chi</th>
                  <th className="pb-3 font-medium">Lần cuối</th>
                  <th className="pb-3 font-medium">R-F-M</th>
                  <th className="pb-3 font-medium">Phân khúc</th>
                </tr>
              </thead>
              <tbody>
                {data.rfmData.filter(c => c.totalOrders > 0).slice(0, 20).map((customer) => {
                  const segmentConfig = SEGMENT_CONFIG[customer.segment];
                  
                  return (
                    <tr key={customer.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-gray-500">{customer.email}</div>
                      </td>
                      <td className="py-3">{customer.totalOrders}</td>
                      <td className="py-3">
                        {formatPrice(customer.totalSpent, 'VND', 'vi-VN')}
                      </td>
                      <td className="py-3">
                        {customer.daysSinceLastOrder !== null
                          ? `${customer.daysSinceLastOrder} ngày trước`
                          : '-'}
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-xs">
                          {customer.recency}-{customer.frequency}-{customer.monetary}
                        </span>
                      </td>
                      <td className="py-3">
                        <Badge className={cn('text-white', segmentConfig.color)}>
                          {customer.segment}
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

