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
        'group flex flex-col overflow-hidden border-gray-200/80 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-md',
        compact ? 'h-full rounded-lg' : 'h-full',
        className
      )}
    >
      {/* Image */}
      <Link
        href={`/product/${product.slug}`}
        className={cn(
          'relative block shrink-0 overflow-hidden bg-gray-50',
          compact ? 'aspect-[4/3]' : 'aspect-square'
        )}
      >
        <Image
          src={imageSrc}
          alt={primaryImage?.alt || name}
          fill
          className="object-contain p-2 transition-transform duration-200 group-hover:scale-105"
          sizes={
            compact
              ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw'
              : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
          }
          unoptimized={isSvg}
        />

        {/* Badges */}
        <div
          className={cn(
            'absolute left-1.5 top-1.5 flex flex-col gap-0.5',
            compact && 'left-1 top-1'
          )}
        >
          {product.isFeatured && (
            <Badge variant="featured" className={cn(compact && 'px-1.5 py-0 text-[10px]')}>
              {compact ? '★' : tProduct('featured')}
            </Badge>
          )}
          {product.isOnSale && (
            <Badge variant="sale" className={cn(compact && 'px-1.5 py-0 text-[10px]')}>
              {compact ? 'Sale' : tProduct('onSale')}
            </Badge>
          )}
        </div>
      </Link>

      {/* Content - flex-1 to fill remaining space */}
      <CardContent className={cn('flex flex-1 flex-col p-3', compact && 'p-2')}>
        <Link href={`/product/${product.slug}`} className="flex-1">
          <h3
            className={cn(
              'line-clamp-2 font-semibold text-gray-900 transition-colors group-hover:text-ce-primary',
              compact ? 'min-h-[2.5rem] text-sm leading-tight' : 'min-h-[3rem] text-base'
            )}
          >
            {name}
          </h3>
        </Link>

        {/* Price - always at bottom of content */}
        <div className={cn('mt-2 flex items-baseline gap-1.5', compact && 'flex-wrap')}>
          {product.isOnSale && salePrice ? (
            <>
              <span className={cn('font-bold text-red-600', compact ? 'text-sm' : 'text-lg')}>
                {formatPrice(salePrice)}
              </span>
              <span className={cn('text-gray-400 line-through', compact ? 'text-xs' : 'text-sm')}>
                {formatPrice(price)}
              </span>
            </>
          ) : (
            <span className={cn('font-bold text-ce-primary', compact ? 'text-sm' : 'text-lg')}>
              {price > 0 ? formatPrice(price) : tCommon('contact')}
            </span>
          )}
        </div>
      </CardContent>

      {/* Footer - always at bottom */}
      <CardFooter className={cn('mt-auto p-3 pt-0', compact && 'p-2 pt-0')}>
        <AddToCartButton
          product={{
            id: product.id,
            slug: product.slug,
            name: name,
            price: Number(salePrice || price),
            image: primaryImage?.url,
          }}
          variant="ce"
          size={compact ? 'sm' : 'sm'}
          className={cn('w-full', compact && 'h-8 text-xs')}
        >
          {tProduct('buyNow')}
        </AddToCartButton>
      </CardFooter>
    </Card>
  );
}
