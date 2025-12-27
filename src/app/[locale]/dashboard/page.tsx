import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import {
  Package,
  Clock,
  CheckCircle,
  TrendingUp,
  ShoppingBag,
  Truck,
  ArrowRight,
  Calendar,
  Wallet,
  BarChart3,
  ChevronRight,
  Award,
  User,
  Mail,
  MapPin,
  Settings,
  CreditCard,
  Crown,
  Gem,
  Star,
} from 'lucide-react';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { toBCP47Locale } from '@/lib/i18n/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'My Dashboard - Creative Engineering',
};

async function getDashboardData(userId: string) {
  const now = new Date();

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

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  const ordersByStatus = {
    pending: orders.filter(o => ['PENDING_CONFIRMATION', 'PENDING'].includes(o.orderStatus)).length,
    confirmed: orders.filter(o => ['CONFIRMED', 'PACKING'].includes(o.orderStatus)).length,
    shipped: orders.filter(o => o.orderStatus === 'SHIPPED').length,
    delivered: orders.filter(o => o.orderStatus === 'DELIVERED').length,
  };

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
    monthlySpending.push({ month: monthNames[date.getMonth()], amount });
  }

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

export default async function DashboardPage() {
  const locale = await getLocale();
  const fmtLocale = toBCP47Locale(locale);
  const t = await getTranslations('dashboard');
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const data = await getDashboardData(session.user.id);
  const points = data.stats.loyaltyPoints;
  const memberLevel = points >= 10000 ? 'Platinum' : points >= 5000 ? 'Gold' : points >= 1000 ? 'Silver' : 'Bronze';
  const maxAmount = Math.max(...data.monthlySpending.map(d => d.amount), 1);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Elegant Header */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-neutral-400">Welcome back</p>
              <h1 className="mt-1 text-3xl font-light tracking-tight text-neutral-900">
                {data.user?.name || session.user.name}
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Member since {new Date(data.user?.createdAt || Date.now()).toLocaleDateString(fmtLocale, { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                asChild
              >
                <Link href="/dashboard/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button 
                size="sm"
                className="bg-neutral-900 text-white hover:bg-neutral-800"
                asChild
              >
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Membership Card - Premium Design */}
        <div className="mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-400 shadow-lg">
                {memberLevel === 'Platinum' ? <Gem className="h-10 w-10 text-neutral-800" /> :
                 memberLevel === 'Gold' ? <Crown className="h-10 w-10 text-neutral-800" /> :
                 memberLevel === 'Silver' ? <Award className="h-10 w-10 text-neutral-800" /> :
                 <Star className="h-10 w-10 text-neutral-800" />}
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-neutral-400">Membership</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-wide">{memberLevel} Member</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  {points.toLocaleString()} loyalty points earned
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-light">{data.stats.totalOrders}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-neutral-400">Orders</p>
              </div>
              <div className="h-12 w-px bg-neutral-700" />
              <div className="text-center">
                <p className="text-3xl font-light">{(data.stats.totalSpent / 1000000).toFixed(1)}M</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-neutral-400">Total Spent</p>
              </div>
              <div className="h-12 w-px bg-neutral-700" />
              <div className="text-center">
                <p className="text-3xl font-light">{data.stats.deliveredOrders}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-neutral-400">Completed</p>
              </div>
            </div>
          </div>
          
          {/* Progress to next level */}
          <div className="mt-8">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Progress to {memberLevel === 'Bronze' ? 'Silver' : memberLevel === 'Silver' ? 'Gold' : 'Platinum'}</span>
              <span className="font-medium">{points.toLocaleString()} / {memberLevel === 'Bronze' ? '1,000' : memberLevel === 'Silver' ? '5,000' : '10,000'}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-700">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-1000"
                style={{ 
                  width: `${Math.min(
                    (points / (memberLevel === 'Bronze' ? 1000 : memberLevel === 'Silver' ? 5000 : 10000)) * 100,
                    100
                  )}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid - Minimalist */}
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { 
              label: 'Pending Orders', 
              value: data.stats.pendingOrders, 
              icon: Clock,
              sublabel: 'Awaiting action'
            },
            { 
              label: 'In Transit', 
              value: data.ordersByStatus.shipped, 
              icon: Truck,
              sublabel: 'On the way'
            },
            { 
              label: 'Delivered', 
              value: data.stats.deliveredOrders, 
              icon: CheckCircle,
              sublabel: 'Successfully completed'
            },
            { 
              label: 'Average Order', 
              value: `${(data.stats.avgOrderValue / 1000).toFixed(0)}K₫`, 
              icon: BarChart3,
              sublabel: 'Per transaction'
            },
          ].map((stat) => (
            <div 
              key={stat.label}
              className="group rounded-xl border border-neutral-100 bg-white p-6 transition-all duration-300 hover:border-neutral-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-light tracking-tight text-neutral-900">{stat.value}</p>
                  <p className="mt-1 text-xs text-neutral-400">{stat.sublabel}</p>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3 transition-colors group-hover:bg-neutral-100">
                  <stat.icon className="h-5 w-5 text-neutral-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Recent Orders - Clean Design */}
            <Card className="overflow-hidden border-neutral-100 shadow-sm">
              <CardHeader className="border-b border-neutral-50 bg-white px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium text-neutral-900">{t('recentOrders.title')}</CardTitle>
                    <p className="mt-1 text-sm text-neutral-500">{t('recentOrders.subtitle')}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-900" asChild>
                    <Link href="/dashboard/orders">
                      {t('recentOrders.viewAll')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {data.recentOrders.length > 0 ? (
                  <div className="divide-y divide-neutral-50">
                    {data.recentOrders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/dashboard/orders/${order.id}`}
                        className="group flex items-center gap-5 px-6 py-5 transition-colors hover:bg-neutral-50"
                      >
                        <div className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-full',
                          order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                          order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600' :
                          order.status === 'CONFIRMED' || order.status === 'PACKING' ? 'bg-violet-50 text-violet-600' :
                          'bg-amber-50 text-amber-600'
                        )}>
                          {order.status === 'DELIVERED' ? <CheckCircle className="h-5 w-5" /> :
                           order.status === 'SHIPPED' ? <Truck className="h-5 w-5" /> :
                           <Package className="h-5 w-5" />}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-neutral-900">{order.orderNumber}</span>
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                'text-xs font-normal',
                                order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' :
                                order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700' :
                                order.status === 'CONFIRMED' || order.status === 'PACKING' ? 'bg-violet-50 text-violet-700' :
                                'bg-amber-50 text-amber-700'
                              )}
                            >
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-sm text-neutral-400">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(order.createdAt).toLocaleDateString(fmtLocale)}
                            </span>
                            <span>{order.itemCount} items</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-medium text-neutral-900">
                            {order.total.toLocaleString('vi-VN')}₫
                          </p>
                          <ChevronRight className="ml-auto mt-1 h-4 w-4 text-neutral-300 transition-transform group-hover:translate-x-1 group-hover:text-neutral-500" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-neutral-100 p-4">
                      <Package className="h-8 w-8 text-neutral-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-neutral-900">{t('emptyOrders.title')}</h3>
                    <p className="mt-2 text-sm text-neutral-500">Start shopping to see your orders here</p>
                    <Button className="mt-6 bg-neutral-900 hover:bg-neutral-800" asChild>
                      <Link href="/products">{t('emptyOrders.cta')}</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Spending Chart - Elegant */}
            <Card className="overflow-hidden border-neutral-100 shadow-sm">
              <CardHeader className="border-b border-neutral-50 bg-white px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium text-neutral-900">Spending Overview</CardTitle>
                    <p className="mt-1 text-sm text-neutral-500">Your purchase history over the last 6 months</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
                    <TrendingUp className="h-3.5 w-3.5" />
                    6 Months
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-end justify-between gap-3 h-52">
                  {data.monthlySpending.map((item) => {
                    const height = (item.amount / maxAmount) * 100;
                    return (
                      <div key={item.month} className="flex flex-1 flex-col items-center gap-3">
                        <div className="relative w-full flex justify-center h-40">
                          <div
                            className="w-full max-w-[40px] rounded-t-lg bg-neutral-900 transition-all duration-500 hover:bg-neutral-700"
                            style={{ 
                              height: `${height}%`,
                              minHeight: item.amount > 0 ? '4px' : '2px',
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-neutral-400">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-6">
                  <div>
                    <p className="text-sm text-neutral-500">Total spent this period</p>
                    <p className="mt-1 text-2xl font-light text-neutral-900">
                      {data.monthlySpending.reduce((sum, m) => sum + m.amount, 0).toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="text-neutral-600" asChild>
                    <Link href="/dashboard/orders">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="overflow-hidden border-neutral-100 shadow-sm">
              <CardHeader className="border-b border-neutral-50 bg-white px-6 py-5">
                <CardTitle className="flex items-center gap-2 text-lg font-medium text-neutral-900">
                  <User className="h-5 w-5 text-neutral-400" />
                  {t('personalInfo.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
                      <Mail className="h-4 w-4 text-neutral-500" />
                    </div>
                    <span className="text-sm text-neutral-600">{session.user.email}</span>
                  </div>
                  {data.profile?.address && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
                        <MapPin className="h-4 w-4 text-neutral-500" />
                      </div>
                      <span className="text-sm text-neutral-600">
                        {data.profile.address}
                        {data.profile.city && `, ${data.profile.city}`}
                      </span>
                    </div>
                  )}
                  {data.profile?.companyName && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
                        <CreditCard className="h-4 w-4 text-neutral-500" />
                      </div>
                      <span className="text-sm text-neutral-600">{data.profile.companyName}</span>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="mt-6 w-full text-neutral-600" asChild>
                  <Link href="/dashboard/profile">{t('personalInfo.editProfile')}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="overflow-hidden border-neutral-100 shadow-sm">
              <CardHeader className="border-b border-neutral-50 bg-white px-6 py-5">
                <CardTitle className="text-lg font-medium text-neutral-900">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-neutral-50">
                  {[
                    { label: 'Browse Products', href: '/products', icon: ShoppingBag },
                    { label: 'Track Orders', href: '/dashboard/orders', icon: Package },
                    { label: 'Account Settings', href: '/dashboard/profile', icon: Settings },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-neutral-50"
                    >
                      <div className="rounded-lg bg-neutral-100 p-2.5">
                        <link.icon className="h-4 w-4 text-neutral-500" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-neutral-700">{link.label}</span>
                      <ChevronRight className="h-4 w-4 text-neutral-300" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Status Summary */}
            <Card className="overflow-hidden border-neutral-100 shadow-sm">
              <CardHeader className="border-b border-neutral-50 bg-white px-6 py-5">
                <CardTitle className="text-lg font-medium text-neutral-900">{t('orderStatus.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { label: t('orderStatus.steps.awaiting'), value: data.ordersByStatus.pending, color: 'bg-amber-500' },
                    { label: 'Processing', value: data.ordersByStatus.confirmed, color: 'bg-violet-500' },
                    { label: t('orderStatus.steps.shipped'), value: data.ordersByStatus.shipped, color: 'bg-blue-500' },
                    { label: t('orderStatus.steps.received'), value: data.ordersByStatus.delivered, color: 'bg-emerald-500' },
                  ].map((status) => (
                    <div key={status.label} className="flex items-center gap-4">
                      <div className={cn('h-2 w-2 rounded-full', status.color)} />
                      <span className="flex-1 text-sm text-neutral-600">{status.label}</span>
                      <span className="text-sm font-medium text-neutral-900">{status.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
