import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import {
  Package,
  Star,
  Clock,
  CheckCircle,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  Truck,
  Gift,
  ArrowRight,
  Calendar,
  Wallet,
  BarChart3,
  ChevronRight,
  Sparkles,
  Award,
  Zap,
  User,
  Mail,
  MapPin,
} from 'lucide-react';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { toBCP47Locale } from '@/lib/i18n/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'My Dashboard - Creative Engineering',
};

async function getDashboardData(userId: string) {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [user, profile, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
    prisma.customerProfile.findUnique({
      where: { userId },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: { select: { id: true } } },
    }),
  ]);

  // Calculate stats
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Count by status
  const ordersByStatus = {
    pending: orders.filter(o => ['PENDING_CONFIRMATION', 'PENDING'].includes(o.orderStatus)).length,
    confirmed: orders.filter(o => ['CONFIRMED', 'PACKING'].includes(o.orderStatus)).length,
    shipped: orders.filter(o => o.orderStatus === 'SHIPPED').length,
    delivered: orders.filter(o => o.orderStatus === 'DELIVERED').length,
  };

  // Calculate monthly spending for last 6 months
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlySpending: { month: string; amount: number }[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const monthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= monthStart && orderDate <= monthEnd;
    });
    
    const amount = monthOrders.reduce((sum, o) => sum + Number(o.total), 0);
    monthlySpending.push({
      month: monthNames[date.getMonth()],
      amount,
    });
  }

  // Recent orders (top 5)
  const recentOrders = orders.slice(0, 5).map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    total: Number(order.total),
    status: order.orderStatus,
    itemCount: order.items.length,
  }));

  return {
    user,
    profile,
    stats: {
      totalOrders,
      totalSpent,
      pendingOrders: ordersByStatus.pending,
      deliveredOrders: ordersByStatus.delivered,
      avgOrderValue,
      loyaltyPoints: profile?.loyaltyPoints || 0,
    },
    recentOrders,
    monthlySpending,
    ordersByStatus,
  };
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  gradient: string;
}) {
  return (
    <div className={cn('group relative overflow-hidden rounded-2xl p-6 text-white', gradient)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/20" />
        <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/10" />
      </div>
      
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-white/60">{subtitle}</p>
          )}
        </div>
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/5" />
    </div>
  );
}

function OrderTimeline({ orders, locale }: { orders: Array<{
  id: string;
  orderNumber: string;
  createdAt: Date;
  total: number;
  status: string;
  itemCount: number;
}>; locale: string }) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/dashboard/orders/${order.id}`}
          className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50"
        >
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            order.status === 'DELIVERED' ? 'bg-green-100 text-green-600' :
            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-600' :
            order.status === 'CONFIRMED' || order.status === 'PACKING' ? 'bg-purple-100 text-purple-600' :
            'bg-amber-100 text-amber-600'
          )}>
            {order.status === 'DELIVERED' ? <CheckCircle className="h-5 w-5" /> :
             order.status === 'SHIPPED' ? <Truck className="h-5 w-5" /> :
             <Package className="h-5 w-5" />}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{order.orderNumber}</span>
              <Badge variant={
                order.status === 'DELIVERED' ? 'default' :
                order.status === 'SHIPPED' ? 'secondary' : 'outline'
              } className="text-xs">
                {order.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(order.createdAt).toLocaleDateString(locale)}
              </span>
              <span className="flex items-center gap-1">
                <ShoppingCart className="h-3.5 w-3.5" />
                {order.itemCount} items
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-bold text-gray-900">
              {order.total.toLocaleString('vi-VN')}₫
            </p>
            <ChevronRight className="ml-auto mt-1 h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      ))}
    </div>
  );
}

function SpendingChart({ data }: { data: Array<{ month: string; amount: number }> }) {
  const maxAmount = Math.max(...data.map(d => d.amount), 1);
  
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((item) => {
          const height = (item.amount / maxAmount) * 100;
          return (
            <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative w-full flex justify-center">
                <div
                  className="w-8 rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all hover:from-indigo-700 hover:to-indigo-500"
                  style={{ 
                    height: `${height}%`,
                    minHeight: item.amount > 0 ? '8px' : '4px',
                  }}
                />
              </div>
              <span className="text-xs font-medium text-gray-500">{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoyaltyCard({ points }: { points: number }) {
  const level = points >= 10000 ? 'Platinum' : points >= 5000 ? 'Gold' : points >= 1000 ? 'Silver' : 'Bronze';
  const nextLevel = points < 1000 ? 1000 : points < 5000 ? 5000 : points < 10000 ? 10000 : 20000;
  const progress = (points / nextLevel) * 100;
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-6 text-white">
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 opacity-20">
        <Sparkles className="h-32 w-32" />
      </div>
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/10" />
      
      <div className="relative">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-white/20 p-3">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/80">Member Level</p>
            <p className="text-xl font-bold">{level}</p>
          </div>
        </div>
        
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold">{points.toLocaleString()}</span>
          <span className="text-white/80">points</span>
        </div>
        
        <div className="mb-2">
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-white/80">Progress to next level</span>
            <span className="font-medium">{nextLevel.toLocaleString()} pts</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div 
              className="h-full rounded-full bg-white transition-all duration-1000"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
        
        <p className="text-sm text-white/80">
          {nextLevel - points > 0 
            ? `${(nextLevel - points).toLocaleString()} points to ${points < 1000 ? 'Silver' : points < 5000 ? 'Gold' : 'Platinum'}`
            : 'Maximum level reached!'}
        </p>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { icon: ShoppingCart, label: 'Browse Products', href: '/products', color: 'bg-blue-500' },
    { icon: Package, label: 'Track Orders', href: '/dashboard/orders', color: 'bg-purple-500' },
    { icon: Gift, label: 'Rewards', href: '/rewards', color: 'bg-pink-500' },
    { icon: CreditCard, label: 'My Profile', href: '/dashboard/profile', color: 'bg-green-500' },
  ];
  
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="group flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-md"
        >
          <div className={cn('rounded-xl p-3 text-white transition-transform group-hover:scale-110', action.color)}>
            <action.icon className="h-5 w-5" />
          </div>
          <span className="text-center text-sm font-medium text-gray-700">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const locale = await getLocale();
  const fmtLocale = toBCP47Locale(locale);
  const t = await getTranslations('dashboard');
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const data = await getDashboardData(session.user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('welcomeBack', { name: '' })} <span className="text-indigo-600">{data.user?.name || session.user.name}</span>! 👋
              </h1>
              <p className="mt-1 text-gray-500">
                Here&apos;s what&apos;s happening with your orders and rewards
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
                <Link href="/products">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Shop Now
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Spent"
            value={`${(data.stats.totalSpent / 1000000).toFixed(1)}M₫`}
            subtitle="Lifetime purchases"
            icon={Wallet}
            gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
          />
          <StatCard
            title="Total Orders"
            value={data.stats.totalOrders}
            subtitle={`${data.stats.deliveredOrders} delivered`}
            icon={Package}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Pending Orders"
            value={data.stats.pendingOrders}
            subtitle="Awaiting confirmation"
            icon={Clock}
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          />
          <StatCard
            title="Avg. Order Value"
            value={`${(data.stats.avgOrderValue / 1000).toFixed(0)}K₫`}
            subtitle="Per transaction"
            icon={BarChart3}
            gradient="bg-gradient-to-br from-pink-500 to-rose-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
          <QuickActions />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Orders & Spending */}
          <div className="space-y-6 lg:col-span-2">
            {/* Recent Orders */}
            <Card className="border-0 shadow-lg shadow-gray-200/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{t('recentOrders.title')}</CardTitle>
                  <p className="text-sm text-gray-500">{t('recentOrders.subtitle')}</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/orders" className="text-indigo-600 hover:text-indigo-700">
                    {t('recentOrders.viewAll')} <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {data.recentOrders.length > 0 ? (
                  <OrderTimeline orders={data.recentOrders} locale={fmtLocale} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 rounded-full bg-gray-100 p-4">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">{t('emptyOrders.title')}</h3>
                    <p className="mb-4 text-gray-500">Start shopping to see your orders here</p>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
                      <Link href="/products">{t('emptyOrders.cta')}</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Spending Overview */}
            <Card className="border-0 shadow-lg shadow-gray-200/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Spending Overview</CardTitle>
                    <p className="text-sm text-gray-500">Your monthly spending trends</p>
                  </div>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                    Last 6 months
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <SpendingChart data={data.monthlySpending} />
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-sm text-gray-500">Total this period</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.monthlySpending.reduce((sum, m) => sum + m.amount, 0).toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    <TrendingUp className="h-4 w-4" />
                    Active customer
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Loyalty & Status */}
          <div className="space-y-6">
            {/* Loyalty Card */}
            <LoyaltyCard points={data.stats.loyaltyPoints} />

            {/* Personal Info */}
            <Card className="border-0 shadow-lg shadow-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-indigo-600" />
                  {t('personalInfo.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{session.user.email}</span>
                </div>
                {data.profile?.address && (
                  <div className="flex items-start gap-3 text-gray-600">
                    <MapPin className="mt-0.5 h-4 w-4" />
                    <span className="text-sm">
                      {data.profile.address}
                      {data.profile.city && `, ${data.profile.city}`}
                    </span>
                  </div>
                )}
                {data.profile?.companyName && (
                  <div className="rounded-lg bg-gray-50 p-3 text-sm">
                    <span className="font-medium text-gray-900">{t('personalInfo.companyLabel')}</span>{' '}
                    <span className="text-gray-600">{data.profile.companyName}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Status Overview */}
            <Card className="border-0 shadow-lg shadow-gray-200/50">
              <CardHeader>
                <CardTitle className="text-lg">{t('orderStatus.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: t('orderStatus.steps.awaiting'), value: data.ordersByStatus.pending, color: 'bg-amber-500', icon: Clock },
                  { label: 'Confirmed', value: data.ordersByStatus.confirmed, color: 'bg-purple-500', icon: CheckCircle },
                  { label: t('orderStatus.steps.shipped'), value: data.ordersByStatus.shipped, color: 'bg-blue-500', icon: Truck },
                  { label: t('orderStatus.steps.received'), value: data.ordersByStatus.delivered, color: 'bg-green-500', icon: CheckCircle },
                ].map((status) => (
                  <div key={status.label} className="flex items-center gap-3">
                    <div className={cn('rounded-lg p-2 text-white', status.color)}>
                      <status.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{status.label}</span>
                        <span className="font-bold text-gray-900">{status.value}</span>
                      </div>
                      <Progress 
                        value={data.stats.totalOrders > 0 ? (status.value / data.stats.totalOrders) * 100 : 0} 
                        className="mt-1 h-1.5"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg shadow-gray-200/50">
              <CardContent className="p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Pro Tip</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Earn <span className="font-semibold text-indigo-600">2x loyalty points</span> on all orders this month! 
                  Don&apos;t miss out on exclusive member benefits.
                </p>
                <Button variant="link" className="mt-2 h-auto p-0 text-indigo-600" asChild>
                  <Link href="/rewards">
                    Learn more <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
