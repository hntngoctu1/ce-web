'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { getProductImageFallback } from '@/lib/placeholders';
import { cn } from '@/lib/utils';

type ProductListItemProps = {
  product: {
    id: string;
    slug: string;
    nameEn: string;
    nameVi: string;
    shortDescEn: string | null;
    shortDescVi: string | null;
    price: number | string;
    salePrice: number | string | null;
    isOnSale: boolean;
    isFeatured: boolean;
    images: { url: string; alt: string | null }[];
  };
  className?: string;
};

export function ProductListItem({ product, className }: ProductListItemProps) {
  const locale = useLocale();
  const tProduct = useTranslations('product');
  const tCommon = useTranslations('common');
  const isVi = (locale || '').toLowerCase().startsWith('vi');

  const name = isVi ? product.nameVi : product.nameEn;
  const shortDesc = isVi ? product.shortDescVi : product.shortDescEn;
  const primaryImage = product.images?.[0];
  const fallbackImage = getProductImageFallback(product.slug);
  const imageSrc = primaryImage?.url || fallbackImage;
  const isSvg = typeof imageSrc === 'string' && imageSrc.toLowerCase().endsWith('.svg');

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const salePrice = product.salePrice
    ? typeof product.salePrice === 'string'
      ? parseFloat(product.salePrice)
      : product.salePrice
    : null;

  return (
    <div
      className={cn(
        'group rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5',
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Link
          href={`/product/${product.slug}`}
          className="relative aspect-square w-full overflow-hidden rounded-xl bg-ce-neutral-20 sm:h-28 sm:w-28 sm:flex-shrink-0"
        >
          <Image
            src={imageSrc}
            alt={primaryImage?.alt || name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 112px"
            unoptimized={isSvg}
          />
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.isOnSale ? <Badge variant="sale">{tProduct('onSale')}</Badge> : null}
            {product.isFeatured ? <Badge variant="featured">{tProduct('featured')}</Badge> : null}
          </div>
        </Link>

        <div className="flex-1">
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-base font-bold leading-snug text-foreground group-hover:text-ce-primary sm:text-lg">
              {name}
            </h3>
          </Link>
          {shortDesc ? (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {shortDesc}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-baseline gap-2">
              {product.isOnSale && salePrice ? (
                <>
                  <span className="text-lg font-bold text-ce-accent-coral">
                    {formatPrice(salePrice)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(price)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-ce-primary">
                  {price > 0 ? formatPrice(price) : tCommon('contact')}
                </span>
              )}
            </div>

            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                name,
                price: Number(salePrice || price),
                image: primaryImage?.url,
              }}
              variant="ce"
              size="sm"
              className="h-10 px-4"
            >
              {tProduct('addToCart')}
            </AddToCartButton>
          </div>
        </div>
      </div>
    </div>
  );
}
