import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  Users,
  MessageSquare,
  ShoppingCart,
  BarChart3,
  Receipt,
  CalendarClock,
  Settings,
  LogOut,
  Boxes,
  ClipboardList,
  Building2,
} from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('admin');
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6 md:h-20">
            <Logo />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3">
            {/* Dashboard */}
            <div className="space-y-0.5">
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                {t('sidebar.dashboard')}
              </Link>
            </div>

            {/* Sales & Orders */}
            <div className="mt-5">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {t('warehouse.sectionSales')}
              </p>
              <div className="space-y-0.5">
                {[
                  { href: '/admin/orders', label: t('sidebar.orders'), icon: ShoppingCart },
                  { href: '/admin/revenue', label: t('sidebar.revenue'), icon: BarChart3 },
                  { href: '/admin/receivables', label: t('sidebar.receivables'), icon: Receipt },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Products & Inventory */}
            <div className="mt-5">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {t('warehouse.sectionProductsInventory')}
              </p>
              <div className="space-y-0.5">
                {[
                  { href: '/admin/products', label: t('sidebar.products'), icon: Package },
                  {
                    href: '/admin/product-groups',
                    label: t('sidebar.productGroups'),
                    icon: FolderTree,
                  },
                  {
                    href: '/admin/warehouse/inventory',
                    label: t('warehouse.inventory'),
                    icon: Boxes,
                  },
                  {
                    href: '/admin/warehouse/documents',
                    label: t('warehouse.documents'),
                    icon: ClipboardList,
                  },
                  {
                    href: '/admin/warehouse/warehouses',
                    label: t('warehouse.warehouses'),
                    icon: Building2,
                  },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Reports & Planning */}
            <div className="mt-5">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {t('warehouse.sectionReports')}
              </p>
              <div className="space-y-0.5">
                {[
                  {
                    href: '/admin/warehouse',
                    label: t('warehouse.warehouseOverview'),
                    icon: BarChart3,
                  },
                  { href: '/admin/reports', label: t('sidebar.reports'), icon: BarChart3 },
                  { href: '/admin/planning', label: t('sidebar.planning'), icon: CalendarClock },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Content & CRM */}
            <div className="mt-5">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {t('warehouse.sectionContentCrm')}
              </p>
              <div className="space-y-0.5">
                {[
                  { href: '/admin/blog', label: t('sidebar.blogPosts'), icon: FileText },
                  { href: '/admin/users', label: t('sidebar.users'), icon: Users },
                  { href: '/admin/contacts', label: t('sidebar.contacts'), icon: MessageSquare },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="mt-5">
              <Link
                href="/admin/settings"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Settings className="h-4 w-4" />
                {t('sidebar.settings')}
              </Link>
            </div>
          </nav>

          <Separator />

          {/* User Section - Compact */}
          <div className="p-3">
            <div className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ce-primary text-xs font-bold text-white">
                {session.user.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{session.user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
