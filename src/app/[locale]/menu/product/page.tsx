import type { Metadata } from 'next';
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
import { ChevronLeft, ChevronRight, Home, ChevronRight as ChevronRightIcon, Search } from 'lucide-react';
import { getProductListOptionsCached } from './_data';

function buildCanonicalQuery(params: any) {
  const urlParams = new URLSearchParams();
  const keys = [
    'q',
    'groups',
    'industries',
    'brands',
    'inStock',
    'onSale',
    'featured',
    'sort',
    'priceMin',
    'priceMax',
  ];
  for (const key of keys) {
    const v = params?.[key];
    if (!v) continue;
    if (Array.isArray(v)) v.forEach((x: any) => urlParams.append(key, String(x)));
    else urlParams.set(key, String(v));
  }
  return urlParams.toString();
}

export async function generateMetadata({ searchParams }: ProductPageProps): Promise<Metadata> {
  const tProduct = await getTranslations('product');
  const params = await searchParams;

  const tokens: string[] = [];
  if (params.q) tokens.push(`"${params.q}"`);
  if (params.onSale === 'true') tokens.push(tProduct('quickOnSale'));
  if (params.featured === 'true') tokens.push(tProduct('quickFeatured'));
  if (params.inStock === 'true') tokens.push(tProduct('inStockOnly'));

  const title = tokens.length
    ? `${tProduct('title')} – ${tokens.join(' · ')}`
    : `${tProduct('title')} - Creative Engineering`;
  const canonicalQs = buildCanonicalQuery(params);

  return {
    title,
    alternates: {
      canonical: canonicalQs ? `/menu/product?${canonicalQs}` : '/menu/product',
    },
  };
}

interface ProductPageProps {
  searchParams: Promise<{
    group?: string;
    groups?: string | string[];
    industries?: string | string[];
    brands?: string | string[];
    priceMin?: string;
    priceMax?: string;
    inStock?: string;
    onSale?: string;
    featured?: string;
    q?: string;
    page?: string;
    sort?: string;
    view?: string;
  }>;
}

const ITEMS_PER_PAGE = 24;

async function getProducts(searchParams: any, locale: string) {
  const page = parseInt(searchParams.page || '1', 10);
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const isVi = (locale || '').toLowerCase().startsWith('vi');

  try {
    const where: any = { isActive: true };

    const legacyGroup = searchParams.group;
    const groupSlugs = Array.isArray(searchParams.groups)
      ? searchParams.groups
      : searchParams.groups
        ? [searchParams.groups]
        : legacyGroup
          ? [legacyGroup]
          : [];
    if (groupSlugs.length > 0) {
      const groups = await prisma.productGroup.findMany({
        where: { slug: { in: groupSlugs } },
        select: { id: true },
      });
      if (groups.length > 0) where.groupId = { in: groups.map((g) => g.id) };
    }

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
      if (industries.length > 0) where.industryId = { in: industries.map((i) => i.id) };
    }

    const brandSlugs = Array.isArray(searchParams.brands)
      ? searchParams.brands
      : searchParams.brands
        ? [searchParams.brands]
        : [];
    if (brandSlugs.length > 0) {
      const brands = await prisma.partner.findMany({
        where: { isBrand: true, OR: [{ id: { in: brandSlugs } }, { name: { in: brandSlugs } }] },
        select: { id: true },
      });
      if (brands.length > 0) where.brandId = { in: brands.map((b) => b.id) };
    }

    if (searchParams.priceMin || searchParams.priceMax) {
      where.price = {};
      if (searchParams.priceMin) where.price.gte = parseFloat(searchParams.priceMin);
      if (searchParams.priceMax) where.price.lte = parseFloat(searchParams.priceMax);
    }

    if (searchParams.inStock === 'true') where.stockQuantity = { gt: 0 };
    if (searchParams.onSale === 'true') where.isOnSale = true;
    if (searchParams.featured === 'true') where.isFeatured = true;

    if (searchParams.q) {
      where.OR = [
        { nameEn: { contains: searchParams.q, mode: 'insensitive' } },
        { nameVi: { contains: searchParams.q, mode: 'insensitive' } },
        { shortDescEn: { contains: searchParams.q, mode: 'insensitive' } },
        { shortDescVi: { contains: searchParams.q, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = [{ isFeatured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }];
    if (searchParams.sort === 'price-asc') orderBy = [{ price: 'asc' }];
    else if (searchParams.sort === 'price-desc') orderBy = [{ price: 'desc' }];
    else if (searchParams.sort === 'name-asc') orderBy = [{ [isVi ? 'nameVi' : 'nameEn']: 'asc' }];
    else if (searchParams.sort === 'newest') orderBy = [{ createdAt: 'desc' }];

    const whereForGroupCounts = { ...where };
    delete (whereForGroupCounts as any).groupId;
    const whereForIndustryCounts = { ...where };
    delete (whereForIndustryCounts as any).industryId;
    const whereForBrandCounts = { ...where };
    delete (whereForBrandCounts as any).brandId;

    const options = await getProductListOptionsCached();

    const [products, totalCount, groupCounts, industryCounts, brandCounts] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
        },
        orderBy,
        skip,
        take: ITEMS_PER_PAGE,
      }),
      prisma.product.count({ where }),
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

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return {
      products,
      totalCount,
      totalPages,
      currentPage: page,
      groups: options.groups,
      industries: options.industries,
      brands: options.brands.map((b) => ({
        id: b.id,
        slug: b.id,
        label: b.name,
        count: brandCountMap.get(b.id) || 0,
      })),
      priceRange: options.priceRange,
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
      counts: { groupCountMap: {}, industryCountMap: {} },
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
          urlParams.set(key, value as string);
        }
      }
    });
    urlParams.set('page', page.toString());
    return `/menu/product?${urlParams.toString()}`;
  };

  const activeFilters: any[] = [];
  const legacyGroup = params.group;
  const groupSlugs = Array.isArray(params.groups)
    ? params.groups
    : params.groups
      ? [params.groups]
      : legacyGroup
        ? [legacyGroup]
        : [];
  groupSlugs.forEach((slug: string) => {
    const group = groupOptions.find((g: any) => g.slug === slug);
    if (group)
      activeFilters.push({
        key: 'groups',
        value: slug,
        label: tProduct('filterByGroup'),
        displayValue: group.label,
      });
  });

  const industrySlugs = Array.isArray(params.industries)
    ? params.industries
    : params.industries
      ? [params.industries]
      : [];
  industrySlugs.forEach((slug: string) => {
    const industry = industryOptions.find((i: any) => i.slug === slug);
    if (industry)
      activeFilters.push({
        key: 'industries',
        value: slug,
        label: tProduct('filterByIndustry'),
        displayValue: industry.label,
      });
  });

  const brandSlugs = Array.isArray(params.brands)
    ? params.brands
    : params.brands
      ? [params.brands]
      : [];
  brandSlugs.forEach((slug: string) => {
    const brand = brands.find((b: any) => b.slug === slug || b.label === slug);
    activeFilters.push({
      key: 'brands',
      value: slug,
      label: tProduct('filterByBrand'),
      displayValue: brand?.label || slug,
    });
  });

  if (params.priceMin)
    activeFilters.push({
      key: 'priceMin',
      value: params.priceMin,
      label: tProduct('priceMin'),
      displayValue: `≥ ${params.priceMin}`,
    });
  if (params.priceMax)
    activeFilters.push({
      key: 'priceMax',
      value: params.priceMax,
      label: tProduct('priceMax'),
      displayValue: `≤ ${params.priceMax}`,
    });
  if (params.inStock === 'true')
    activeFilters.push({
      key: 'inStock',
      value: 'true',
      label: tProduct('availability'),
      displayValue: tProduct('inStockOnly'),
    });
  if (params.onSale === 'true')
    activeFilters.push({
      key: 'onSale',
      value: 'true',
      label: tProduct('quickOnSale'),
      displayValue: tProduct('quickOnSale'),
    });
  if (params.featured === 'true')
    activeFilters.push({
      key: 'featured',
      value: 'true',
      label: tProduct('quickFeatured'),
      displayValue: tProduct('quickFeatured'),
    });

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
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: products.map((p: any, idx: number) => ({
              '@type': 'ListItem',
              position: idx + 1,
              name: isVi ? p.nameVi : p.nameEn,
              url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/product/${p.slug}`,
            })),
          }),
        }}
      />

      {/* Breadcrumb - minimal, aligned with header */}
      <div className="sticky top-[128px] z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm md:top-[144px]">
        <div className="ce-container">
          <nav className="flex items-center gap-2 py-3 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1 text-gray-500 transition-colors hover:text-ce-primary"
            >
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRightIcon className="h-4 w-4 text-gray-300" />
            <span className="font-semibold text-gray-900">{tProduct('title')}</span>
            <span className="ml-2 rounded-full bg-ce-primary/10 px-2.5 py-0.5 text-xs font-medium text-ce-primary">
              {totalCount}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20 pt-6">
        <div className="ce-container">
          <div className="flex gap-6 lg:gap-8">
            {/* Sidebar Filter - modern glass design */}
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-[180px] max-h-[calc(100vh-200px)] overflow-y-auto rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-lg backdrop-blur-sm md:top-[196px]">
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
              {/* Search & Sort Bar - modern glass design */}
              <div className="sticky top-[180px] z-20 mb-5 space-y-4 rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-lg backdrop-blur-sm md:top-[196px]">
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
                <div className="mb-5 rounded-2xl border border-ce-primary/20 bg-ce-primary/5 p-4">
                  <ActiveFilters activeFilters={activeFilters} locale={locale} />
                </div>
              )}

              {/* Products Grid - max 4 columns for better alignment */}
              {products.length > 0 ? (
                viewMode === 'list' ? (
                  <div className="space-y-4">
                    {products.map((product: any) => (
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
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product: any) => (
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
                <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-lg">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="mb-2 text-lg font-medium text-gray-900">{tProduct('noProducts')}</p>
                  <p className="mb-4 text-sm text-muted-foreground">Try adjusting your filters</p>
                  <Button variant="ce" className="mt-2" asChild>
                    <Link href="/menu/product">{tProduct('viewAllProducts')}</Link>
                  </Button>
                </div>
              )}

              {/* Pagination - modern design */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    asChild={currentPage > 1}
                    className="h-10 rounded-xl px-4"
                  >
                    {currentPage > 1 ? (
                      <Link href={buildPageUrl(currentPage - 1)} className="flex items-center gap-1">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Prev</span>
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Prev</span>
                      </span>
                    )}
                  </Button>

                  <div className="flex items-center gap-1">
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
                              <span className="px-2 text-sm text-muted-foreground">…</span>
                            )}
                            <Button
                              variant={page === currentPage ? 'ce' : 'ghost'}
                              size="sm"
                              className={`h-10 w-10 rounded-xl p-0 ${page === currentPage ? 'shadow-md' : 'hover:bg-gray-100'}`}
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
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    asChild={currentPage < totalPages}
                    className="h-10 rounded-xl px-4"
                  >
                    {currentPage < totalPages ? (
                      <Link href={buildPageUrl(currentPage + 1)} className="flex items-center gap-1">
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="hidden sm:inline">Next</span>
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
