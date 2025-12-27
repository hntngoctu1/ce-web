'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Star,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  CreditCard,
  Truck,
  Gift,
  ArrowRight,
  Calendar,
  Wallet,
  BarChart3,
  Eye,
  ChevronRight,
  Sparkles,
  Award,
  Target,
  Zap,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface DashboardData {
  user: {
    name: string;
    email: string;
    memberSince: string;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    deliveredOrders: number;
    avgOrderValue: number;
    loyaltyPoints: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    createdAt: string;
    total: number;
    status: string;
    itemCount: number;
  }>;
  monthlySpending: Array<{
    month: string;
    amount: number;
  }>;
  ordersByStatus: {
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
  };
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  gradient,
  delay = 0,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  gradient: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl p-6 text-white transition-all duration-500',
        gradient,
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
    >
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
          {trend && (
            <div className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
              trend === 'up' ? 'bg-green-400/20' : 'bg-red-400/20'
            )}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trendValue}
            </div>
          )}
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

function OrderTimeline({ orders }: { orders: DashboardData['recentOrders'] }) {
  return (
    <div className="space-y-4">
      {orders.map((order, i) => (
        <Link
          key={order.id}
          href={`/dashboard/orders/${order.id}`}
          className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            order.status === 'DELIVERED' ? 'bg-green-100 text-green-600' :
            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-600' :
            order.status === 'CONFIRMED' ? 'bg-purple-100 text-purple-600' :
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
                {order.status}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
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

function SpendingChart({ data }: { data: DashboardData['monthlySpending'] }) {
  const maxAmount = Math.max(...data.map(d => d.amount), 1);
  
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((item, i) => {
          const height = (item.amount / maxAmount) * 100;
          return (
            <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative w-full flex justify-center">
                <div
                  className="w-8 rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all duration-700 ease-out hover:from-indigo-700 hover:to-indigo-500"
                  style={{ 
                    height: `${height}%`,
                    minHeight: item.amount > 0 ? '8px' : '0',
                    animationDelay: `${i * 100}ms`
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

function LoyaltyCard({ points, level }: { points: number; level: string }) {
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
    { icon: CreditCard, label: 'Payment Methods', href: '/dashboard/profile', color: 'bg-green-500' },
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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login?callbackUrl=/dashboard');
    }
  }, [status]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchData();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded-lg bg-gray-200" />
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-36 rounded-2xl bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default data if API fails
  const data: DashboardData = dashboardData || {
    user: {
      name: session?.user?.name || 'Customer',
      email: session?.user?.email || '',
      memberSince: new Date().toISOString(),
    },
    stats: {
      totalOrders: 0,
      totalSpent: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      avgOrderValue: 0,
      loyaltyPoints: 0,
    },
    recentOrders: [],
    monthlySpending: [
      { month: 'Jan', amount: 0 },
      { month: 'Feb', amount: 0 },
      { month: 'Mar', amount: 0 },
      { month: 'Apr', amount: 0 },
      { month: 'May', amount: 0 },
      { month: 'Jun', amount: 0 },
    ],
    ordersByStatus: { pending: 0, confirmed: 0, shipped: 0, delivered: 0 },
  };

  const getLoyaltyLevel = (points: number) => {
    if (points >= 10000) return 'Platinum';
    if (points >= 5000) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, <span className="text-indigo-600">{data.user.name}</span>! 👋
              </h1>
              <p className="mt-1 text-gray-500">
                Here&apos;s what&apos;s happening with your orders and rewards
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/dashboard/profile">
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
            delay={0}
          />
          <StatCard
            title="Total Orders"
            value={data.stats.totalOrders}
            subtitle={`${data.stats.deliveredOrders} delivered`}
            icon={Package}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            delay={100}
          />
          <StatCard
            title="Pending Orders"
            value={data.stats.pendingOrders}
            subtitle="Awaiting confirmation"
            icon={Clock}
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            delay={200}
          />
          <StatCard
            title="Avg. Order Value"
            value={`${(data.stats.avgOrderValue / 1000).toFixed(0)}K₫`}
            subtitle="Per transaction"
            icon={BarChart3}
            gradient="bg-gradient-to-br from-pink-500 to-rose-600"
            delay={300}
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
                  <CardTitle className="text-xl">Recent Orders</CardTitle>
                  <p className="text-sm text-gray-500">Your latest transactions</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/orders" className="text-indigo-600 hover:text-indigo-700">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {data.recentOrders.length > 0 ? (
                  <OrderTimeline orders={data.recentOrders} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 rounded-full bg-gray-100 p-4">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">No orders yet</h3>
                    <p className="mb-4 text-gray-500">Start shopping to see your orders here</p>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
                      <Link href="/products">Browse Products</Link>
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
            <LoyaltyCard 
              points={data.stats.loyaltyPoints} 
              level={getLoyaltyLevel(data.stats.loyaltyPoints)}
            />

            {/* Order Status Overview */}
            <Card className="border-0 shadow-lg shadow-gray-200/50">
              <CardHeader>
                <CardTitle className="text-lg">Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Pending', value: data.ordersByStatus.pending, color: 'bg-amber-500', icon: Clock },
                  { label: 'Confirmed', value: data.ordersByStatus.confirmed, color: 'bg-purple-500', icon: CheckCircle },
                  { label: 'Shipped', value: data.ordersByStatus.shipped, color: 'bg-blue-500', icon: Truck },
                  { label: 'Delivered', value: data.ordersByStatus.delivered, color: 'bg-green-500', icon: CheckCircle },
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
