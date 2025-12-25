import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import { formatPrice, formatDate } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Eye, Search, RefreshCw } from 'lucide-react';
import { QuickAdjustModal } from '@/components/warehouse/quick-adjust-modal';

export const metadata: Metadata = {
  title: 'Products - Admin - Creative Engineering',
};

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    status?: string;
    sort?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

const SORT_MAP: Record<
  string,
  {
    label: string;
    orderBy: Record<string, 'asc' | 'desc'>;
  }
> = {
  createdDesc: { label: 'Newest', orderBy: { createdAt: 'desc' } },
  createdAsc: { label: 'Oldest', orderBy: { createdAt: 'asc' } },
  priceDesc: { label: 'Price: High → Low', orderBy: { price: 'desc' } },
  priceAsc: { label: 'Price: Low → High', orderBy: { price: 'asc' } },
  nameAsc: { label: 'Name: A → Z', orderBy: { nameEn: 'asc' } },
};

async function getProducts(searchParams: {
  q?: string;
  page?: string;
  status?: string;
  sort?: string;
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: Record<string, unknown> = {};

  if (searchParams.q) {
    where.OR = [
      { nameEn: { contains: searchParams.q, mode: 'insensitive' } },
      { nameVi: { contains: searchParams.q, mode: 'insensitive' } },
      { sku: { contains: searchParams.q, mode: 'insensitive' } },
    ];
  }

  if (searchParams.status) {
    switch (searchParams.status) {
      case 'active':
        where.isActive = true;
        break;
      case 'inactive':
        where.isActive = false;
        break;
      case 'featured':
        where.isFeatured = true;
        break;
      case 'sale':
        where.isOnSale = true;
        break;
      case 'outofstock':
        // Filter products with no available inventory
        where.inventoryItems = {
          every: {
            availableQty: { lte: 0 },
          },
        };
        break;
      default:
        break;
    }
  }

  const sortKey =
    searchParams.sort && SORT_MAP[searchParams.sort] ? searchParams.sort : 'createdDesc';
  const orderBy = SORT_MAP[sortKey].orderBy;

  // Get default warehouse for inventory lookup
  const defaultWarehouse = await prisma.warehouse.findFirst({ where: { isDefault: true } });

  const [products, total, activeCount, inactiveCount, featuredCount, onSaleCount, outOfStockCount] =
    await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          group: { select: { nameEn: true } },
          brand: { select: { name: true } },
          images: { take: 1 },
          // Include inventory from InventoryItem (single source of truth)
          inventoryItems: defaultWarehouse
            ? {
                where: { warehouseId: defaultWarehouse.id },
                select: {
                  id: true,
                  onHandQty: true,
                  reservedQty: true,
                  availableQty: true,
                  warehouseId: true,
                  warehouse: { select: { code: true } },
                },
                take: 1,
              }
            : undefined,
        },
        orderBy,
        skip,
        take: ITEMS_PER_PAGE,
      }),
      prisma.product.count({ where }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: false } }),
      prisma.product.count({ where: { isFeatured: true } }),
      prisma.product.count({ where: { isOnSale: true } }),
      // Count out of stock from InventoryItem (not Product.stockQuantity)
      prisma.inventoryItem.count({ where: { availableQty: { lte: 0 } } }),
    ]);

  return {
    products,
    total,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    currentPage: page,
    stats: {
      activeCount,
      inactiveCount,
      featuredCount,
      onSaleCount,
      outOfStockCount,
    },
    appliedSort: sortKey,
    defaultWarehouse,
  };
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const t = await getTranslations('admin');
  const params = await searchParams;
  const { products, total, totalPages, currentPage, stats, appliedSort, defaultWarehouse } =
    await getProducts(params);

  const statusOptions = [
    { value: '', label: 'All status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'featured', label: 'Featured' },
    { value: 'sale', label: 'Sale' },
    { value: 'outofstock', label: 'Out of stock' },
  ];

  const buildQuery = (nextPage: number) => {
    const qs = new URLSearchParams();
    qs.set('page', String(nextPage));
    if (params.q) qs.set('q', params.q);
    if (params.status) qs.set('status', params.status);
    if (params.sort) qs.set('sort', params.sort);
    return qs.toString();
  };

  const buildQueryWithOverrides = (
    overrides: Partial<{ page: number; status: string; sort: string; q: string }>
  ) => {
    const qs = new URLSearchParams();
    const page = overrides.page ?? params.page ?? '1';
    qs.set('page', String(page));
    const status = overrides.status ?? params.status ?? '';
    if (status) qs.set('status', status);
    const sort = overrides.sort ?? params.sort ?? 'createdDesc';
    if (sort) qs.set('sort', sort);
    const q = overrides.q ?? params.q ?? '';
    if (q) qs.set('q', q);
    return qs.toString();
  };

  const quickFilters = [
    { key: '', label: 'All', count: total },
    { key: 'active', label: 'Active', count: stats.activeCount },
    { key: 'inactive', label: 'Inactive', count: stats.inactiveCount },
    { key: 'featured', label: 'Featured', count: stats.featuredCount },
    { key: 'sale', label: 'Sale', count: stats.onSaleCount },
    { key: 'outofstock', label: 'Out of stock', count: stats.outOfStockCount },
  ];

  const exportQuery = buildQueryWithOverrides({});
  const exportUrl = `/api/admin/products/export?${exportQuery}`;

  return (
    <div>
      {/* Header + CTA */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('products.title')}</h1>
          <p className="text-muted-foreground">{t('products.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/menu/product" target="_blank">
              {t('products.viewAllProducts') ?? 'View store'}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={exportUrl} target="_blank" rel="noreferrer">
              Export CSV
            </Link>
          </Button>
          <Button variant="ce" asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('products.addProduct')}
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI bar */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active', value: stats.activeCount, tone: 'text-emerald-700 bg-emerald-50' },
          { label: 'Inactive', value: stats.inactiveCount, tone: 'text-slate-700 bg-slate-100' },
          { label: 'On sale', value: stats.onSaleCount, tone: 'text-amber-700 bg-amber-50' },
          { label: 'Out of stock', value: stats.outOfStockCount, tone: 'text-rose-700 bg-rose-50' },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-lg border bg-white px-4 py-3 shadow-sm ${card.tone}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <form className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto] md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              placeholder={t('products.searchPlaceholder')}
              defaultValue={params.q}
              className="pl-10"
            />
          </div>

          <select
            name="status"
            defaultValue={params.status || ''}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ce-primary/40"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            name="sort"
            defaultValue={params.sort || 'createdDesc'}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ce-primary/40"
          >
            {Object.entries(SORT_MAP).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2">
            <Button type="submit" variant="default">
              {t('common.search')}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/products">Reset</Link>
            </Button>
          </div>
        </form>
      </div>

      {/* Quick filters bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {quickFilters.map((f) => {
          const active = (params.status ?? '') === f.key || (!params.status && f.key === '');
          const qs = buildQueryWithOverrides({ status: f.key || undefined, page: 1 });
          return (
            <Link
              key={f.key || 'all'}
              href={`/admin/products?${qs}`}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors ${
                active
                  ? 'border-ce-primary bg-ce-primary/10 text-ce-primary'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-ce-primary/50 hover:text-ce-primary'
              }`}
            >
              <span>{f.label}</span>
              <span className="rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-700">
                {f.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[1024px]">
            <TableHeader>
              <TableRow>
                <TableHead>{t('products.table.product')}</TableHead>
                <TableHead>{t('products.table.sku')}</TableHead>
                <TableHead>{t('products.table.group')}</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>{t('products.table.price')}</TableHead>
                <TableHead>{t('products.table.status')}</TableHead>
                <TableHead>{t('products.table.created')}</TableHead>
                <TableHead className="text-right">{t('products.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-md bg-ce-neutral-20">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.nameEn}
                            width={40}
                            height={40}
                            className="h-full w-full rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm">
                            📦
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{product.nameEn}</p>
                        {product.brand && (
                          <p className="text-xs text-muted-foreground">{product.brand.name}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.sku || '-'}</TableCell>
                  <TableCell>{product.group?.nameEn || '-'}</TableCell>
                  <TableCell>
                    {(() => {
                      const inv = product.inventoryItems?.[0];
                      const onHand = inv ? Number(inv.onHandQty) : 0;
                      const available = inv ? Number(inv.availableQty) : 0;
                      const warehouseId = inv?.warehouseId || defaultWarehouse?.id || '';
                      const warehouseCode =
                        inv?.warehouse?.code || defaultWarehouse?.code || 'MAIN';

                      return (
                        <div className="flex items-center gap-2">
                          <Badge variant={available > 0 ? 'ce' : 'destructive'}>
                            {available > 0 ? `${available} available` : 'Out of stock'}
                          </Badge>
                          {warehouseId && (
                            <QuickAdjustModal
                              productId={product.id}
                              productName={product.nameEn}
                              productSku={product.sku}
                              warehouseId={warehouseId}
                              warehouseCode={warehouseCode}
                              currentOnHand={onHand}
                              trigger={
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                              }
                            />
                          )}
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {product.isOnSale && product.salePrice ? (
                      <div>
                        <span className="font-medium text-ce-accent-coral">
                          {formatPrice(Number(product.salePrice))}
                        </span>
                        <br />
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(Number(product.price))}
                        </span>
                      </div>
                    ) : (
                      <span>{formatPrice(Number(product.price))}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const inv = product.inventoryItems?.[0];
                      const available = inv ? Number(inv.availableQty) : 0;
                      return (
                        <div className="flex gap-1">
                          {product.isActive ? (
                            <Badge variant="ce">{t('products.status.active')}</Badge>
                          ) : (
                            <Badge variant="secondary">{t('products.status.inactive')}</Badge>
                          )}
                          {product.isFeatured && (
                            <Badge variant="featured">{t('products.status.featured')}</Badge>
                          )}
                          {product.isOnSale && (
                            <Badge variant="sale">{t('products.status.sale')}</Badge>
                          )}
                          {available <= 0 && <Badge variant="secondary">OOS</Badge>}
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(product.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/product/${product.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/products/${product.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-3 py-6">
                      <div className="text-2xl">📦</div>
                      <p className="text-sm text-muted-foreground">
                        No products found. Try resetting filters or add a new product.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" asChild>
                          <Link href="/admin/products">Reset filters</Link>
                        </Button>
                        <Button variant="ce" asChild>
                          <Link href="/admin/products/new">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('products.addProduct')}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} products
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/products?${buildQuery(currentPage - 1)}`}>Previous</Link>
              </Button>
            )}
            {currentPage < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/products?${buildQuery(currentPage + 1)}`}>Next</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
