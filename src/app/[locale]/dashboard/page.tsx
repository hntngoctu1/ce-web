import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { toBCP47Locale } from '@/lib/i18n/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, MapPin, Mail, Package, Star, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Dashboard - Creative Engineering',
};

async function getCustomerData(userId: string) {
  const [profile, orders] = await Promise.all([
    prisma.customerProfile.findUnique({
      where: { userId },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        items: true,
      },
    }),
  ]);

  return { profile, orders };
}

export default async function DashboardPage() {
  const locale = await getLocale();
  const fmtLocale = toBCP47Locale(locale);
  const t = await getTranslations('dashboard');
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  // Debug: Log session user ID
  console.log('[Dashboard] Session user ID:', session.user.id);
  console.log('[Dashboard] Session user email:', session.user.email);

  const { profile, orders } = await getCustomerData(session.user.id);
  
  // Debug: Log query results
  console.log('[Dashboard] Orders found:', orders.length);
  console.log('[Dashboard] Profile found:', !!profile);
  const loyaltyPoints = profile?.loyaltyPoints || 0;
  const pointsToNext = Math.max(1000 - loyaltyPoints, 0);

  // Count orders by orderStatus (the correct field)
  const pendingStatuses = ['PENDING_CONFIRMATION', 'CONFIRMED', 'PACKING'];
  const orderSteps = [
    {
      key: 'awaiting',
      icon: Clock,
      label: t('orderStatus.steps.awaiting'),
      count: orders.filter((o) => pendingStatuses.includes(o.orderStatus)).length,
    },
    {
      key: 'shipped',
      icon: Package,
      label: t('orderStatus.steps.shipped'),
      count: orders.filter((o) => o.orderStatus === 'SHIPPED').length,
    },
    {
      key: 'received',
      icon: CheckCircle,
      label: t('orderStatus.steps.received'),
      count: orders.filter((o) => o.orderStatus === 'DELIVERED').length,
    },
    { key: 'evaluate', icon: Star, label: t('orderStatus.steps.evaluate'), count: 0 },
  ];

  const loyaltyProgress = profile?.loyaltyPoints
    ? Math.min((profile.loyaltyPoints / 1000) * 100, 100)
    : 0;

  return (
    <div className="ce-section">
      <div className="ce-container">
        <div className="mb-8">
          <h1 className="text-3xl font-heavy">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('welcomeBack', { name: session.user.name || '' })}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>{t('orderStatus.title')}</CardTitle>
                <CardDescription>{t('orderStatus.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {orderSteps.map((step) => (
                    <div
                      key={step.key}
                      className="flex flex-col items-center rounded-lg bg-ce-neutral-20 p-4 text-center"
                    >
                      <step.icon className="mb-2 h-6 w-6 text-ce-primary" />
                      <span className="text-2xl font-bold">{step.count}</span>
                      <span className="text-xs text-muted-foreground">{step.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('recentOrders.title')}</CardTitle>
                    <CardDescription>{t('recentOrders.subtitle')}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/orders">{t('recentOrders.viewAll')}</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString(fmtLocale)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{Number(order.total).toLocaleString()} VND</p>
                          <Badge
                            variant={
                              order.orderStatus === 'DELIVERED'
                                ? 'ce'
                                : order.orderStatus === 'SHIPPED'
                                  ? 'featured'
                                  : order.orderStatus === 'CANCELED'
                                    ? 'destructive'
                                    : 'secondary'
                            }
                          >
                            {order.orderStatus.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">{t('emptyOrders.title')}</p>
                    <Button variant="ce" className="mt-4" asChild>
                      <Link href="/menu/product">{t('emptyOrders.cta')}</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('personalInfo.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{session.user.email}</span>
                </div>
                {profile?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {profile.address}
                      {profile.city && `, ${profile.city}`}
                    </span>
                  </div>
                )}
                {profile?.companyName && (
                  <div className="text-sm">
                    <span className="font-medium">{t('personalInfo.companyLabel')}</span>{' '}
                    {profile.companyName}
                  </div>
                )}
                <Separator />
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/profile">{t('personalInfo.editProfile')}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Loyalty Points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-ce-accent-gold" />
                  {t('loyalty.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="relative mx-auto mb-4 h-32 w-32">
                    <svg className="h-full w-full -rotate-90 transform">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-ce-neutral-20"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${loyaltyProgress * 3.52} 352`}
                        className="text-ce-accent-gold"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">{loyaltyPoints}</span>
                      <span className="text-xs text-muted-foreground">
                        {t('loyalty.pointsUnit')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('loyalty.toNextLevel', { points: pointsToNext })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
