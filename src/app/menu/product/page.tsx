import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { ProductCard } from '@/components/product/product-card';
import { FilterSidebar } from '@/components/product/plp/filter-sidebar';
import { SearchSortBar } from '@/components/product/plp/search-sort-bar';
import { ActiveFilters } from '@/components/product/plp/active-filters';
import { ProductListItem } from '@/components/product/plp/product-list-item';
import { QuickFilters } from '@/components/product/plp/quick-filters';
import { MobileBottomBar } from '@/components/product/plp/mobile-bottom-bar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Home, ChevronRight as ChevronRightIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Products - Creative Engineering',
  description:
    'Browse our comprehensive catalog of industrial products including tapes, adhesives, coatings, and specialized equipment.',
};

interface ProductPageProps {
  searchParams: Promise<{
    groups?: string | string[];
    industries?: string | string[];
    brands?: string | string[];
    priceMin?: string;
    priceMax?: string;
    inStock?: string;
    onSale?: string;
    featured?: string;
    q?: string;
    sort?: string;
    view?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 24;

async function getProducts(searchParams: any, locale: string) {
  const page = parseInt(searchParams.page || '1', 10);
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const isVi = (locale || '').toLowerCase().startsWith('vi');

  try {
    const where: any = { isActive: true };

    // Filter by groups (multi-select)
    const groupSlugs = Array.isArray(searchParams.groups)
      ? searchParams.groups
      : searchParams.groups
        ? [searchParams.groups]
        : [];
    if (groupSlugs.length > 0) {
      const groups = await prisma.productGroup.findMany({
        where: { slug: { in: groupSlugs } },
        select: { id: true },
      });
      if (groups.length > 0) {
        where.groupId = { in: groups.map((g) => g.id) };
      }
    }

    // Filter by industries (multi-select)
    const industrySlugs = Array.isArray(searchParams.industries)
      ? searchParams.industries
      : searchParams.industries
        ? [searchParams.industries]
        : [];
    if (industrySlugs.length > 0) {
      const industries = await prisma.industryCategory.findMany({
        where: { slug: { in: industrySlugs } },
        select: { id: true },
      });
      if (industries.length > 0) {
        where.industryId = { in: industries.map((i) => i.id) };
      }
    }

    // Filter by brands (multi-select)
    const brandSlugs = Array.isArray(searchParams.brands)
      ? searchParams.brands
      : searchParams.brands
        ? [searchParams.brands]
        : [];
    if (brandSlugs.length > 0) {
      const brands = await prisma.partner.findMany({
        where: {
          isBrand: true,
          OR: [{ id: { in: brandSlugs } }, { name: { in: brandSlugs } }],
        },
        select: { id: true },
      });
      if (brands.length > 0) {
        where.brandId = { in: brands.map((b) => b.id) };
      }
    }

    // Price range
    if (searchParams.priceMin || searchParams.priceMax) {
      where.price = {};
      if (searchParams.priceMin) where.price.gte = parseFloat(searchParams.priceMin);
      if (searchParams.priceMax) where.price.lte = parseFloat(searchParams.priceMax);
    }

    // In stock only
    if (searchParams.inStock === 'true') {
      where.stockQuantity = { gt: 0 };
    }

    // On sale only
    if (searchParams.onSale === 'true') {
      where.isOnSale = true;
    }

    // Featured only
    if (searchParams.featured === 'true') {
      where.isFeatured = true;
    }

    // Search query
    if (searchParams.q) {
      where.OR = [
        { nameEn: { contains: searchParams.q, mode: 'insensitive' } },
        { nameVi: { contains: searchParams.q, mode: 'insensitive' } },
        { shortDescEn: { contains: searchParams.q, mode: 'insensitive' } },
        { shortDescVi: { contains: searchParams.q, mode: 'insensitive' } },
      ];
    }

    // Sorting
    let orderBy: any = [{ isFeatured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }];
    if (searchParams.sort === 'price-asc') {
      orderBy = [{ price: 'asc' }];
    } else if (searchParams.sort === 'price-desc') {
      orderBy = [{ price: 'desc' }];
    } else if (searchParams.sort === 'name-asc') {
      orderBy = [{ [isVi ? 'nameVi' : 'nameEn']: 'asc' }];
    } else if (searchParams.sort === 'newest') {
      orderBy = [{ createdAt: 'desc' }];
    }

    // Counts for filters
    const whereForGroupCounts = { ...where };
    delete (whereForGroupCounts as any).groupId;
    const whereForIndustryCounts = { ...where };
    delete (whereForIndustryCounts as any).industryId;
    const whereForBrandCounts = { ...where };
    delete (whereForBrandCounts as any).brandId;

    const [
      products,
      totalCount,
      groups,
      industries,
      brands,
      priceStats,
      groupCounts,
      industryCounts,
      brandCounts,
    ] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
        },
        orderBy,
        skip,
        take: ITEMS_PER_PAGE,
      }),
      prisma.product.count({ where }),
      prisma.productGroup.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: { id: true, slug: true, nameEn: true, nameVi: true },
      }),
      prisma.industryCategory.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: { id: true, slug: true, nameEn: true, nameVi: true },
      }),
      prisma.partner.findMany({
        where: { isActive: true, isBrand: true },
        orderBy: { order: 'asc' },
        select: { id: true, name: true },
      }),
      prisma.product.aggregate({
        _min: { price: true },
        _max: { price: true },
        where: { isActive: true },
      }),
      prisma.product.groupBy({
        by: ['groupId'],
        where: whereForGroupCounts,
        _count: { _all: true },
      }),
      prisma.product.groupBy({
        by: ['industryId'],
        where: whereForIndustryCounts,
        _count: { _all: true },
      }),
      prisma.product.groupBy({
        by: ['brandId'],
        where: whereForBrandCounts,
        _count: { _all: true },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const groupCountMap = new Map<string, number>();
    groupCounts.forEach((g: any) => {
      if (g.groupId) groupCountMap.set(g.groupId, g._count._all);
    });
    const industryCountMap = new Map<string, number>();
    industryCounts.forEach((i: any) => {
      if (i.industryId) industryCountMap.set(i.industryId, i._count._all);
    });
    const brandCountMap = new Map<string, number>();
    brandCounts.forEach((b: any) => {
      if (b.brandId) brandCountMap.set(b.brandId, b._count._all);
    });

    return {
      products,
      totalCount,
      totalPages,
      currentPage: page,
      groups,
      industries,
      brands: brands.map((b) => ({
        id: b.id,
        slug: b.id,
        label: b.name,
        count: brandCountMap.get(b.id) || 0,
      })),
      priceRange: {
        min: Math.floor(priceStats._min.price || 0),
        max: Math.ceil(priceStats._max.price || 1000000),
      },
      counts: {
        groupCountMap: Object.fromEntries(groupCountMap),
        industryCountMap: Object.fromEntries(industryCountMap),
      },
    };
  } catch (error) {
    console.error('Database connection error:', error);
    return {
      products: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      groups: [],
      industries: [],
      brands: [],
      priceRange: { min: 0, max: 1000000 },
    };
  }
}

export default async function ProductListPage({ searchParams }: ProductPageProps) {
  const locale = await getLocale();
  const tProduct = await getTranslations('product');
  const tCommon = await getTranslations('common');
  const params = await searchParams;
  const isVi = (locale || '').toLowerCase().startsWith('vi');
  const {
    products,
    totalCount,
    totalPages,
    currentPage,
    groups,
    industries,
    brands,
    priceRange,
    counts,
  } = await getProducts(params, locale);

  const groupOptions = groups.map((g: any) => ({
    id: g.id,
    slug: g.slug,
    label: isVi ? g.nameVi : g.nameEn,
    count: counts?.groupCountMap?.[g.id] ?? 0,
  }));

  const industryOptions = industries.map((i: any) => ({
    id: i.id,
    slug: i.slug,
    label: isVi ? i.nameVi : i.nameEn,
    count: counts?.industryCountMap?.[i.id] ?? 0,
  }));

  const buildPageUrl = (page: number) => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'page' && value) {
        if (Array.isArray(value)) {
          value.forEach((v) => urlParams.append(key, v));
        } else {
          urlParams.set(key, value);
        }
      }
    });
    urlParams.set('page', page.toString());
    return `/menu/product?${urlParams.toString()}`;
  };

  // Build active filters for display
  const activeFilters: any[] = [];
  const groupSlugs = Array.isArray(params.groups)
    ? params.groups
    : params.groups
      ? [params.groups]
      : [];
  groupSlugs.forEach((slug) => {
    const group = groupOptions.find((g: any) => g.slug === slug);
    if (group) {
      activeFilters.push({
        key: 'groups',
        value: slug,
        label: tProduct('filterByGroup'),
        displayValue: group.label,
      });
    }
  });

  const industrySlugs = Array.isArray(params.industries)
    ? params.industries
    : params.industries
      ? [params.industries]
      : [];
  industrySlugs.forEach((slug) => {
    const industry = industryOptions.find((i: any) => i.slug === slug);
    if (industry) {
      activeFilters.push({
        key: 'industries',
        value: slug,
        label: tProduct('filterByIndustry'),
        displayValue: industry.label,
      });
    }
  });

  const brandSlugs = Array.isArray(params.brands)
    ? params.brands
    : params.brands
      ? [params.brands]
      : [];
  brandSlugs.forEach((slug) => {
    const brand = brands.find((b: any) => b.slug === slug || b.label === slug);
    activeFilters.push({
      key: 'brands',
      value: slug,
      label: tProduct('filterByBrand'),
      displayValue: brand?.label || slug,
    });
  });

  if (params.priceMin) {
    activeFilters.push({
      key: 'priceMin',
      value: params.priceMin,
      label: tProduct('priceMin'),
      displayValue: `≥ ${params.priceMin}`,
    });
  }
  if (params.priceMax) {
    activeFilters.push({
      key: 'priceMax',
      value: params.priceMax,
      label: tProduct('priceMax'),
      displayValue: `≤ ${params.priceMax}`,
    });
  }
  if (params.inStock === 'true') {
    activeFilters.push({
      key: 'inStock',
      value: 'true',
      label: tProduct('availability'),
      displayValue: tProduct('inStockOnly'),
    });
  }

  if (params.onSale === 'true') {
    activeFilters.push({
      key: 'onSale',
      value: 'true',
      label: tProduct('quickOnSale'),
      displayValue: tProduct('quickOnSale'),
    });
  }

  if (params.featured === 'true') {
    activeFilters.push({
      key: 'featured',
      value: 'true',
      label: tProduct('quickFeatured'),
      displayValue: tProduct('quickFeatured'),
    });
  }

  if (params.sort && params.sort !== 'featured') {
    const sortLabel =
      params.sort === 'newest'
        ? tProduct('sortNewest')
        : params.sort === 'name-asc'
          ? tProduct('sortNameAsc')
          : params.sort === 'price-asc'
            ? tProduct('sortPriceAsc')
            : params.sort === 'price-desc'
              ? tProduct('sortPriceDesc')
              : params.sort;
    activeFilters.push({
      key: 'sort',
      value: params.sort,
      label: tProduct('sortLabel'),
      displayValue: sortLabel,
    });
  }

  const activeFilterCount = activeFilters.length;
  const viewMode = params.view === 'list' ? 'list' : 'grid';
  const quickActive = {
    inStock: params.inStock === 'true',
    onSale: params.onSale === 'true',
    featured: params.featured === 'true',
    newest: params.sort === 'newest',
  };

  return (
    <>
      {/* Breadcrumb - minimal, right under header */}
      <div className="sticky top-[72px] z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 py-2.5 text-sm">
            <Link
              href="/"
              className="flex items-center text-gray-500 transition-colors hover:text-ce-primary"
            >
              <Home className="h-3.5 w-3.5" />
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5 text-gray-300" />
            <span className="font-medium text-gray-900">{tProduct('title')}</span>
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {totalCount}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <section className="min-h-screen bg-gray-50/50 pb-16 pt-4">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <div className="flex gap-5">
            {/* Sidebar Filter - narrower, sticky */}
            <aside className="hidden w-60 shrink-0 lg:block xl:w-64">
              <div className="sticky top-[120px] max-h-[calc(100vh-140px)] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <Suspense fallback={<div className="animate-pulse">{tCommon('loading')}</div>}>
                  <FilterSidebar
                    groups={groupOptions}
                    industries={industryOptions}
                    brands={brands}
                    priceRange={priceRange}
                    selectedFilters={{
                      groups: groupSlugs,
                      industries: industrySlugs,
                      brands: brandSlugs,
                      priceMin: params.priceMin ? parseFloat(params.priceMin) : undefined,
                      priceMax: params.priceMax ? parseFloat(params.priceMax) : undefined,
                      inStock: params.inStock === 'true',
                    }}
                    locale={locale}
                  />
                </Suspense>
              </div>
            </aside>

            {/* Main Content */}
            <div className="min-w-0 flex-1">
              {/* Search & Sort Bar - integrated with Quick Filters */}
              <div className="sticky top-[120px] z-20 mb-4 space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <SearchSortBar
                  searchQuery={params.q}
                  sortBy={(params.sort as any) || 'featured'}
                  viewMode={viewMode}
                  resultCount={totalCount}
                />
                <QuickFilters active={quickActive} />
              </div>

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <ActiveFilters activeFilters={activeFilters} locale={locale} />
                </div>
              )}

              {/* Products Grid */}
              {products.length > 0 ? (
                viewMode === 'list' ? (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <ProductListItem
                        key={product.id}
                        product={{
                          ...product,
                          price: Number(product.price),
                          salePrice: product.salePrice ? Number(product.salePrice) : null,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={{
                          ...product,
                          price: Number(product.price),
                          salePrice: product.salePrice ? Number(product.salePrice) : null,
                        }}
                        compact
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                  <p className="text-muted-foreground">{tProduct('noProducts')}</p>
                  <Button variant="ce-outline" className="mt-3" size="sm" asChild>
                    <Link href="/menu/product">{tProduct('viewAllProducts')}</Link>
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    asChild={currentPage > 1}
                  >
                    {currentPage > 1 ? (
                      <Link href={buildPageUrl(currentPage - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span>
                        <ChevronLeft className="h-4 w-4" />
                      </span>
                    )}
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
                    )
                    .map((page, index, array) => {
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
                      return (
                        <span key={page} className="flex items-center gap-1">
                          {showEllipsis && (
                            <span className="px-1 text-sm text-muted-foreground">…</span>
                          )}
                          <Button
                            variant={page === currentPage ? 'ce' : 'outline'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            asChild={page !== currentPage}
                          >
                            {page !== currentPage ? (
                              <Link href={buildPageUrl(page)}>{page}</Link>
                            ) : (
                              <span>{page}</span>
                            )}
                          </Button>
                        </span>
                      );
                    })}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    asChild={currentPage < totalPages}
                  >
                    {currentPage < totalPages ? (
                      <Link href={buildPageUrl(currentPage + 1)}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span>
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile bottom bar */}
      <MobileBottomBar
        activeFilterCount={activeFilterCount}
        sort={params.sort}
        view={viewMode}
        childrenFilters={
          <Suspense fallback={<div>{tCommon('loading')}</div>}>
            <FilterSidebar
              groups={groupOptions}
              industries={industryOptions}
              brands={brands}
              priceRange={priceRange}
              selectedFilters={{
                groups: groupSlugs,
                industries: industrySlugs,
                brands: brandSlugs,
                priceMin: params.priceMin ? parseFloat(params.priceMin) : undefined,
                priceMax: params.priceMax ? parseFloat(params.priceMax) : undefined,
                inStock: params.inStock === 'true',
              }}
              locale={locale}
            />
          </Suspense>
        }
      />
    </>
  );
}
