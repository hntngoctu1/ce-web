import Link from 'next/link';
import { ArrowLeft, Truck, BadgeCheck, Headphones, Shield } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product/product-card';
import { ProductGallery } from '@/components/product/product-gallery';
import { getProductImageFallback } from '@/lib/placeholders';
import { ProductTabs } from '@/components/product/pdp/product-tabs';
import { StickyQuoteForm } from '@/components/product/pdp/sticky-quote-form';
import { StickyMiniCtaBar } from '@/components/product/pdp/sticky-mini-cta-bar';
import { PdpPurchaseSection } from '@/components/product/pdp/pdp-purchase-section';
import { SupplierTrustCard } from '@/components/product/pdp/supplier-trust-card';
import { ProductReviewsSection } from '@/components/product/pdp/product-reviews-section';

type ProductDetailLayoutProps = {
  locale: string;
  product: any;
  relatedProducts: any[];
};

export async function ProductDetailLayout({
  locale,
  product,
  relatedProducts,
}: ProductDetailLayoutProps) {
  const tCommon = await getTranslations('common');
  const tDetail = await getTranslations('productDetail');

  const isVi = locale.toLowerCase().startsWith('vi');
  const name = isVi ? product.nameVi : product.nameEn;
  const shortDesc = isVi ? product.shortDescVi : product.shortDescEn;
  const description = isVi ? product.descriptionVi : product.descriptionEn;
  const groupName = product.group ? (isVi ? product.group.nameVi : product.group.nameEn) : null;

  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const heroImage = product.images?.[0]?.url || getProductImageFallback(product.slug);

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 px-2 text-slate-500 hover:text-ce-primary"
            >
              <Link href="/menu/product">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                {tCommon('back')}
              </Link>
            </Button>
            <span className="text-slate-300">|</span>
            <nav className="flex items-center gap-1.5 text-slate-500">
              <Link href="/" className="transition-colors hover:text-ce-primary">
                {tCommon('home')}
              </Link>
              <span className="text-slate-300">/</span>
              <Link href="/menu/product" className="transition-colors hover:text-ce-primary">
                {tCommon('products')}
              </Link>
              {groupName && (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="font-medium text-slate-900">{groupName}</span>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(400px,0.9fr)] lg:items-start">
          {/* Left: gallery + breathing space */}
          <div className="space-y-4">
            <div className="lg:sticky lg:top-24">
              <ProductGallery
                images={product.images || []}
                fallbackImage={heroImage}
                alt={name}
                videoUrl={product.videoUrl}
              />
            </div>
          </div>

          {/* Right: sticky stack = info + supplier + quote */}
          <div className="space-y-4 lg:sticky lg:top-20">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-5 sm:p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {product.brand?.name && (
                    <Badge
                      variant="outline"
                      className="border-slate-300 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700"
                    >
                      {product.brand.name}
                    </Badge>
                  )}
                  {product.isFeatured && (
                    <Badge className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                      ⭐ FEATURED
                    </Badge>
                  )}
                  {product.isOnSale && (
                    <Badge className="border-0 bg-gradient-to-r from-rose-500 to-pink-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                      🔥 SALE
                    </Badge>
                  )}
                </div>

                <h1 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
                  {name}
                </h1>

                {product.sku && (
                  <p className="mt-1.5 text-sm text-slate-500">
                    SKU: <span className="font-mono font-medium text-slate-700">{product.sku}</span>
                  </p>
                )}

                {shortDesc && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{shortDesc}</p>
                )}

                <div className="my-5 border-t border-slate-100" />

                <PdpPurchaseSection
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name,
                    image: heroImage,
                    price,
                    salePrice,
                    isOnSale: Boolean(product.isOnSale),
                    stockQuantity: product.stockQuantity ?? 0,
                  }}
                />
              </div>

              <div className="rounded-b-2xl border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { icon: Truck, label: tDetail('trust.fastDelivery'), color: 'text-blue-600' },
                    {
                      icon: BadgeCheck,
                      label: tDetail('trust.genuine'),
                      color: 'text-emerald-600',
                    },
                    {
                      icon: Headphones,
                      label: tDetail('trust.technicalSupport'),
                      color: 'text-violet-600',
                    },
                    { icon: Shield, label: tDetail('trust.warranty'), color: 'text-amber-600' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-xs sm:text-sm">
                      <item.icon className={`h-4 w-4 flex-shrink-0 ${item.color}`} />
                      <span className="truncate font-medium text-slate-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Quick Specs
              </h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {product.sku && (
                  <>
                    <dt className="text-slate-500">SKU</dt>
                    <dd className="text-right font-medium text-slate-900">{product.sku}</dd>
                  </>
                )}
                {product.brand?.name && (
                  <>
                    <dt className="text-slate-500">Brand</dt>
                    <dd className="text-right font-medium text-slate-900">{product.brand.name}</dd>
                  </>
                )}
                {groupName && (
                  <>
                    <dt className="text-slate-500">Category</dt>
                    <dd className="text-right font-medium text-slate-900">{groupName}</dd>
                  </>
                )}
                <dt className="text-slate-500">Availability</dt>
                <dd
                  className={`text-right font-semibold ${
                    product.stockQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {product.stockQuantity > 0 ? tDetail('inStock') : tDetail('outOfStock')}
                </dd>
              </dl>
            </div>

            {/* Supplier + Quote inline for balance */}
            <div className="space-y-4">
              {product.brand?.name && (
                <SupplierTrustCard
                  brandName={product.brand.name}
                  isVerified={true}
                  responseTime="< 24 hours"
                  yearsInBusiness={new Date().getFullYear() - 1999}
                />
              )}
              <div id="quote" className="scroll-mt-32">
                <StickyQuoteForm productName={name} productSlug={product.slug} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <ProductTabs
            overview={description || tDetail('noDescription')}
            specs={(product.specs || []).map((s: any) => ({
              id: s.id,
              key: isVi ? s.keyVi : s.keyEn,
              value: isVi ? s.valueVi : s.valueEn,
            }))}
          />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-8">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-ce-primary">
              {tDetail('relatedKicker')}
            </p>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
              {tCommon('reviews') || 'Reviews'}
            </h2>
          </div>
          <ProductReviewsSection productId={product.id} productName={name} />
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts?.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-ce-primary">
                  {tDetail('relatedKicker')}
                </p>
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
                  {tDetail('relatedTitle')}
                </h2>
              </div>
              <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/menu/product">{tDetail('browseMore')}</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((rp: any) => (
                <ProductCard
                  key={rp.id}
                  product={{
                    ...rp,
                    price: Number(rp.price),
                    salePrice: rp.salePrice ? Number(rp.salePrice) : null,
                  }}
                />
              ))}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Button variant="outline" size="sm" asChild>
                <Link href="/menu/product">{tDetail('browseMore')}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mini CTA Bar */}
      <StickyMiniCtaBar
        product={{
          id: product.id,
          slug: product.slug,
          name,
          image: heroImage,
          price,
          salePrice,
          isOnSale: Boolean(product.isOnSale),
        }}
      />
    </div>
  );
}
