'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/utils';
import { toBCP47Locale } from '@/lib/i18n/locale';
import { cn } from '@/lib/utils';

type StickyMiniCtaBarProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    image?: string;
    price: number;
    salePrice?: number | null;
    isOnSale?: boolean;
  };
  chatHref?: string;
  anchorId?: string;
};

export function StickyMiniCtaBar({
  product,
  chatHref = '/contact',
  anchorId = 'purchase-panel-anchor',
}: StickyMiniCtaBarProps) {
  const locale = useLocale();
  const fmtLocale = toBCP47Locale(locale);
  const tProduct = useTranslations('product');
  const tCommon = useTranslations('common');

  const { addItem } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById(anchorId);
    if (!anchor) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, [anchorId]);

  const price = product.price || 0;
  const salePrice = product.salePrice ?? null;
  const effectivePrice =
    product.isOnSale && salePrice && salePrice > 0 && salePrice < price ? salePrice : price;
  const disabled = price <= 0;
  const isSvg = typeof product.image === 'string' && product.image.toLowerCase().endsWith('.svg');

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg transition-transform duration-300',
        isVisible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="ce-container flex items-center gap-4 py-3 md:gap-6 md:py-4">
        {/* Mini thumbnail + product info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {product.image && (
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border bg-white md:h-14 md:w-14">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-1"
                sizes="56px"
                unoptimized={isSvg}
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ce-primary-900 md:text-base">
              {product.name}
            </div>
            <div className="mt-0.5 text-lg font-heavy text-ce-primary md:text-xl">
              {price > 0 ? (
                <>
                  {formatPrice(effectivePrice, 'VND', fmtLocale).replace(/\s?₫$/, '')}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">₫</span>
                </>
              ) : (
                <span className="text-sm font-normal">{tCommon('contact')}</span>
              )}
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ce"
            size="lg"
            className="h-12 px-4 text-sm font-semibold shadow-md md:px-6 md:text-base"
            disabled={disabled}
            onClick={() =>
              addItem({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: effectivePrice,
                image: product.image,
              })
            }
          >
            <ShoppingCart className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">{tProduct('addToCart')}</span>
          </Button>

          <Button variant="outline" size="lg" className="h-12 px-3 md:px-4" asChild>
            <Link href={chatHref}>
              <MessageCircle className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
