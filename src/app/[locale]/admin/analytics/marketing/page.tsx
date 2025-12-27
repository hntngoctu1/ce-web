import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Mail,
  Tag,
  Users,
  DollarSign,
  MousePointer,
  Eye,
  ShoppingCart,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

import { auth } from '@/lib/auth';
import { prisma } from '@/shared/database';
import { formatPrice, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const dynamic = 'force-dynamic';

async function getMarketingAnalytics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Coupon Analytics
  const coupons = await prisma.coupon.findMany({
    include: {
      usages: {
        where: { usedAt: { gte: thirtyDaysAgo } },
        include: {
          order: { select: { total: true } },
        },
      },
    },
  });

  const couponStats = coupons.map((coupon) => {
    const usages = coupon.usages;
    const totalRevenue = usages.reduce(
      (sum, u) => sum + (u.order ? Number(u.order.total) : 0),
      0
    );
    const totalDiscount = usages.reduce(
      (sum, u) => sum + Number(u.discountAmount),
      0
    );

    return {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      usageCount: usages.length,
      totalRevenue,
      totalDiscount,
      avgOrderValue: usages.length > 0 ? totalRevenue / usages.length : 0,
      roi: totalDiscount > 0 ? ((totalRevenue - totalDiscount) / totalDiscount) * 100 : 0,
      status: coupon.status,
    };
  });

  // Flash Sale Analytics
  const flashSales = await prisma.flashSale.findMany({
    where: { startsAt: { gte: thirtyDaysAgo } },
    include: {
      items: {
        include: {
          product: { select: { nameVi: true, nameEn: true, price: true } },
        },
      },
    },
  });

  const flashSaleStats = flashSales.map((sale) => {
    const totalSold = sale.items.reduce((sum, i) => sum + i.soldCount, 0);
    const totalRevenue = sale.items.reduce(
      (sum, i) => sum + i.soldCount * Number(i.salePrice),
      0
    );
    const totalDiscount = sale.items.reduce(
      (sum, i) => sum + i.soldCount * (Number(i.product.price) - Number(i.salePrice)),
      0
    );

    return {
      id: sale.id,
      name: sale.name,
      startsAt: sale.startsAt,
      endsAt: sale.endsAt,
      isActive: now >= sale.startsAt && now <= sale.endsAt && sale.isActive,
      itemCount: sale.items.length,
      totalSold,
      totalRevenue,
      totalDiscount,
      conversionRate: sale.items.length > 0
        ? (sale.items.filter((i) => i.soldCount > 0).length / sale.items.length) * 100
        : 0,
    };
  });

  // Traffic Sources (simulated - in production, integrate with GA4/analytics)
  const trafficSources = [
    { source: 'Organic Search', visitors: 4520, orders: 156, revenue: 245000000, conversionRate: 3.45 },
    { source: 'Direct', visitors: 2830, orders: 98, revenue: 178000000, conversionRate: 3.46 },
    { source: 'Social Media', visitors: 1890, orders: 45, revenue: 67500000, conversionRate: 2.38 },
    { source: 'Email', visitors: 890, orders: 67, revenue: 123000000, conversionRate: 7.53 },
    { source: 'Referral', visitors: 560, orders: 23, revenue: 34500000, conversionRate: 4.11 },
    { source: 'Paid Search', visitors: 450, orders: 34, revenue: 56000000, conversionRate: 7.56 },
  ];

  // Calculate totals
  const totalVisitors = trafficSources.reduce((sum, s) => sum + s.visitors, 0);
  const totalOrders = trafficSources.reduce((sum, s) => sum + s.orders, 0);
  const totalRevenue = trafficSources.reduce((sum, s) => sum + s.revenue, 0);

  // Review Analytics
  const reviewStats = await prisma.review.aggregate({
    where: { createdAt: { gte: thirtyDaysAgo }, status: 'APPROVED' },
    _count: true,
    _avg: { overallRating: true },
  });

  const reviewsWithMedia = await prisma.review.count({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      status: 'APPROVED',
      media: { some: {} },
    },
  });

  // Contact/Lead Analytics
  const contactStats = await prisma.contactMessage.aggregate({
    where: { createdAt: { gte: thirtyDaysAgo } },
    _count: true,
  });

  const repliedContacts = await prisma.contactMessage.count({
    where: { createdAt: { gte: thirtyDaysAgo }, isReplied: true },
  });

  // Blog Analytics
  const blogStats = await prisma.blogPost.aggregate({
    where: { isPublished: true },
    _sum: { viewCount: true },
    _count: true,
  });

  const topPosts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { viewCount: 'desc' },
    take: 5,
    select: {
      id: true,
      slug: true,
      titleVi: true,
      titleEn: true,
      viewCount: true,
      publishedAt: true,
    },
  });

  return {
    traffic: {
      sources: trafficSources,
      totalVisitors,
      totalOrders,
      totalRevenue,
      avgConversionRate: totalVisitors > 0 ? (totalOrders / totalVisitors) * 100 : 0,
    },
    coupons: {
      stats: couponStats.sort((a, b) => b.usageCount - a.usageCount).slice(0, 10),
      totalUsages: couponStats.reduce((sum, c) => sum + c.usageCount, 0),
      totalDiscount: couponStats.reduce((sum, c) => sum + c.totalDiscount, 0),
      totalRevenue: couponStats.reduce((sum, c) => sum + c.totalRevenue, 0),
    },
    flashSales: {
      stats: flashSaleStats,
      activeSales: flashSaleStats.filter((s) => s.isActive).length,
      totalSold: flashSaleStats.reduce((sum, s) => sum + s.totalSold, 0),
      totalRevenue: flashSaleStats.reduce((sum, s) => sum + s.totalRevenue, 0),
    },
    reviews: {
      count: reviewStats._count,
      avgRating: reviewStats._avg.overallRating || 0,
      withMedia: reviewsWithMedia,
      mediaRate: reviewStats._count > 0 ? (reviewsWithMedia / reviewStats._count) * 100 : 0,
    },
    contacts: {
      total: contactStats._count,
      replied: repliedContacts,
      responseRate: contactStats._count > 0 ? (repliedContacts / contactStats._count) * 100 : 0,
    },
    blog: {
      totalPosts: blogStats._count,
      totalViews: blogStats._sum.viewCount || 0,
      topPosts,
    },
  };
}

export default async function MarketingAnalyticsPage() {
  const session = await auth();
  
  if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role as string)) {
    redirect('/login');
  }

  const data = await getMarketingAnalytics();

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
        <h1 className="text-3xl font-bold text-gray-900">Marketing Analytics</h1>
        <p className="mt-1 text-gray-500">
          Phân tích hiệu quả marketing và chiến dịch
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tổng lượt truy cập</CardTitle>
            <Eye className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.traffic.totalVisitors.toLocaleString()}</div>
            <p className="text-sm text-gray-500">30 ngày qua</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tỷ lệ chuyển đổi</CardTitle>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.traffic.avgConversionRate.toFixed(2)}%
            </div>
            <p className="text-sm text-gray-500">{data.traffic.totalOrders} đơn hàng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Mã giảm giá</CardTitle>
            <Tag className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.coupons.totalUsages}</div>
            <p className="text-sm text-gray-500">
              Giảm {formatPrice(data.coupons.totalDiscount, 'VND')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Đánh giá mới</CardTitle>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.reviews.count}</div>
            <p className="text-sm text-gray-500">
              Avg: {data.reviews.avgRating.toFixed(1)} ⭐
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5 text-blue-500" />
            Nguồn traffic (30 ngày)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.traffic.sources.map((source) => {
              const percentage = (source.visitors / data.traffic.totalVisitors) * 100;
              
              return (
                <div key={source.source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{source.source}</span>
                      <Badge variant="outline" className="text-xs">
                        {source.conversionRate.toFixed(2)}% CVR
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{source.visitors.toLocaleString()}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        → {source.orders} đơn
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={percentage} className="h-2 flex-1" />
                    <span className="w-16 text-right text-sm text-gray-500">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Coupon & Flash Sales */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Coupon Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-purple-500" />
              Top Mã giảm giá
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.coupons.stats.length === 0 ? (
                <p className="text-center text-gray-500">Chưa có dữ liệu</p>
              ) : (
                data.coupons.stats.map((coupon) => (
                  <div key={coupon.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-sm">
                          {coupon.code}
                        </code>
                        <Badge variant={coupon.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {coupon.status}
                        </Badge>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {coupon.usageCount} lượt • ROI: {coupon.roi.toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatPrice(coupon.totalRevenue, 'VND')}
                      </div>
                      <div className="text-sm text-gray-500">
                        -{formatPrice(coupon.totalDiscount, 'VND')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Flash Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Flash Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.flashSales.stats.length === 0 ? (
                <p className="text-center text-gray-500">Chưa có flash sale</p>
              ) : (
                data.flashSales.stats.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sale.name}</span>
                        {sale.isActive && (
                          <Badge className="bg-green-500">Live</Badge>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {sale.itemCount} SP • {sale.totalSold} đã bán
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatPrice(sale.totalRevenue, 'VND')}
                      </div>
                      <div className="text-sm text-gray-500">
                        CVR: {sale.conversionRate.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-amber-500" />
              Đánh giá
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng đánh giá</span>
                <span className="font-semibold">{data.reviews.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Điểm trung bình</span>
                <span className="font-semibold">{data.reviews.avgRating.toFixed(1)} ⭐</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Có hình ảnh</span>
                <span className="font-semibold">
                  {data.reviews.withMedia} ({data.reviews.mediaRate.toFixed(0)}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact/Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Liên hệ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng liên hệ</span>
                <span className="font-semibold">{data.contacts.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Đã phản hồi</span>
                <span className="font-semibold">{data.contacts.replied}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tỷ lệ phản hồi</span>
                <span className={cn(
                  'font-semibold',
                  data.contacts.responseRate >= 80 ? 'text-green-600' : 'text-yellow-600'
                )}>
                  {data.contacts.responseRate.toFixed(0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blog */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-indigo-500" />
              Blog
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng bài viết</span>
                <span className="font-semibold">{data.blog.totalPosts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng lượt xem</span>
                <span className="font-semibold">{data.blog.totalViews.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Avg views/post</span>
                <span className="font-semibold">
                  {data.blog.totalPosts > 0
                    ? Math.round(data.blog.totalViews / data.blog.totalPosts)
                    : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Blog Posts */}
      {data.blog.topPosts.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Top bài viết</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.blog.topPosts.map((post, i) => (
                <div key={post.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                      i < 3 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    )}>
                      {i + 1}
                    </span>
                    <div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="font-medium hover:text-ce-primary"
                      >
                        {post.titleVi || post.titleEn}
                      </Link>
                      <div className="text-sm text-gray-500">
                        {post.publishedAt?.toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {post.viewCount.toLocaleString()} views
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

