'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { getProductImageFallback } from '@/lib/placeholders';
import { useLocale, useTranslations } from 'next-intl';

interface ProductCardProps {
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
  compact?: boolean;
}

export function ProductCard({ product, className, compact = false }: ProductCardProps) {
  const locale = useLocale();
  const tProduct = useTranslations('product');
  const tCommon = useTranslations('common');
  const isVi = (locale || '').toLowerCase().startsWith('vi');

  const name = isVi ? product.nameVi : product.nameEn;
  const primaryImage = product.images[0];
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
    <Card
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border-0 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        compact ? 'h-full' : 'h-full',
        className
      )}
    >
      {/* Image */}
      <Link
        href={`/product/${product.slug}`}
        className={cn(
          'relative block shrink-0 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100',
          compact ? 'aspect-square' : 'aspect-square'
        )}
      >
        <Image
          src={imageSrc}
          alt={primaryImage?.alt || name}
          fill
          className="object-contain p-4 transition-all duration-300 group-hover:scale-110"
          sizes={
            compact
              ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw'
              : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
          }
          unoptimized={isSvg}
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isFeatured && (
            <Badge variant="featured" className="rounded-full px-2.5 py-1 text-xs font-semibold shadow-md">
              ★ {tProduct('featured')}
            </Badge>
          )}
          {product.isOnSale && (
            <Badge variant="sale" className="rounded-full px-2.5 py-1 text-xs font-semibold shadow-md">
              {tProduct('onSale')}
            </Badge>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-ce-primary/0 transition-all duration-300 group-hover:bg-ce-primary/5" />
      </Link>

      {/* Content - flex-1 to fill remaining space */}
      <CardContent className="flex flex-1 flex-col p-4">
        <Link href={`/product/${product.slug}`} className="flex-1">
          <h3
            className={cn(
              'line-clamp-2 font-semibold text-gray-900 transition-colors group-hover:text-ce-primary',
              compact ? 'min-h-[2.75rem] text-sm leading-snug' : 'min-h-[3rem] text-base'
            )}
          >
            {name}
          </h3>
        </Link>

        {/* Price - always at bottom of content */}
        <div className="mt-3 flex items-baseline gap-2">
          {product.isOnSale && salePrice ? (
            <>
              <span className="text-lg font-bold text-red-600">
                {formatPrice(salePrice)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-ce-primary">
              {price > 0 ? formatPrice(price) : tCommon('contact')}
            </span>
          )}
        </div>
      </CardContent>

      {/* Footer - always at bottom */}
      <CardFooter className="mt-auto p-4 pt-0">
        <AddToCartButton
          product={{
            id: product.id,
            slug: product.slug,
            name: name,
            price: Number(salePrice || price),
            image: primaryImage?.url,
          }}
          variant="ce"
          size="default"
          className="w-full rounded-xl font-medium shadow-md transition-all hover:shadow-lg"
        >
          {tProduct('buyNow')}
        </AddToCartButton>
      </CardFooter>
    </Card>
  );
}
