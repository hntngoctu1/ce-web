import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, FileText, Users, MessageSquare, TrendingUp, ShoppingCart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Creative Engineering',
};

async function getDashboardStats() {
  const [totalProducts, totalPosts, totalUsers, totalContacts, recentProducts, unreadContacts] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.blogPost.count({ where: { isPublished: true } }),
      prisma.user.count(),
      prisma.contactMessage.count(),
      prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, nameEn: true, slug: true, createdAt: true },
      }),
      prisma.contactMessage.count({ where: { isRead: false } }),
    ]);

  return {
    totalProducts,
    totalPosts,
    totalUsers,
    totalContacts,
    recentProducts,
    unreadContacts,
  };
}

export default async function AdminDashboardPage() {
  const t = await getTranslations('admin');
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: t('dashboard.stats.products'),
      value: stats.totalProducts,
      icon: Package,
      href: '/admin/products',
      color: 'text-ce-primary',
      bgColor: 'bg-ce-primary/10',
    },
    {
      title: t('dashboard.stats.posts'),
      value: stats.totalPosts,
      icon: FileText,
      href: '/admin/blog',
      color: 'text-ce-accent-teal',
      bgColor: 'bg-ce-accent-teal/10',
    },
    {
      title: t('dashboard.stats.users'),
      value: stats.totalUsers,
      icon: Users,
      href: '/admin/users',
      color: 'text-ce-accent-gold',
      bgColor: 'bg-ce-accent-gold/10',
    },
    {
      title: t('dashboard.stats.contacts'),
      value: stats.totalContacts,
      icon: MessageSquare,
      href: '/admin/contacts',
      color: 'text-ce-accent-coral',
      bgColor: 'bg-ce-accent-coral/10',
      badge:
        stats.unreadContacts > 0
          ? t('dashboard.stats.newBadge', { count: String(stats.unreadContacts) })
          : undefined,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heavy">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-md p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{stat.value}</span>
                  {stat.badge && (
                    <span className="rounded-full bg-destructive px-2 py-0.5 text-xs text-white">
                      {stat.badge}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions.title')}</CardTitle>
            <CardDescription>{t('dashboard.quickActions.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent"
            >
              <Package className="h-5 w-5 text-ce-primary" />
              <div>
                <p className="font-medium">{t('dashboard.quickActions.addProduct')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.quickActions.addProductDesc')}
                </p>
              </div>
            </Link>
            <Link
              href="/admin/blog/new"
              className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent"
            >
              <FileText className="h-5 w-5 text-ce-accent-teal" />
              <div>
                <p className="font-medium">{t('dashboard.quickActions.writePost')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.quickActions.writePostDesc')}
                </p>
              </div>
            </Link>
            <Link
              href="/admin/contacts"
              className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent"
            >
              <MessageSquare className="h-5 w-5 text-ce-accent-coral" />
              <div>
                <p className="font-medium">{t('dashboard.quickActions.viewMessages')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.quickActions.viewMessagesDesc', {
                    count: String(stats.unreadContacts),
                  })}
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentProducts.title')}</CardTitle>
            <CardDescription>{t('dashboard.recentProducts.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent"
                >
                  <span className="font-medium">{product.nameEn}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
              {stats.recentProducts.length === 0 && (
                <p className="text-center text-muted-foreground">
                  {t('dashboard.recentProducts.empty')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
