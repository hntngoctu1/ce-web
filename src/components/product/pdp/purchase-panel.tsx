'use client';

import Link from 'next/link';
import { ShoppingCart, MessageCircle, Check } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/utils';
import { toBCP47Locale } from '@/lib/i18n/locale';

type PurchasePanelProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    image?: string;
    price: number;
    salePrice?: number | null;
    isOnSale?: boolean;
    stockQuantity?: number | null;
  };
  className?: string;
  chatHref?: string;
};

export function PurchasePanel({ product, className, chatHref = '/contact' }: PurchasePanelProps) {
  const locale = useLocale();
  const fmtLocale = toBCP47Locale(locale);
  const tProduct = useTranslations('product');
  const tCommon = useTranslations('common');
  const tDetail = useTranslations('productDetail');

  const { addItem } = useCart();

  const price = product.price || 0;
  const salePrice = product.salePrice ?? null;
  const showSale = Boolean(product.isOnSale && salePrice && salePrice > 0 && salePrice < price);
  const inStock = (product.stockQuantity ?? 0) > 0;

  const primaryDisabled = price <= 0;

  return (
    <div className={className} id="purchase-panel-anchor">
      {/* More breathing room, subtle shadow */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        {/* Price block - cleaner layout */}
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-ce-primary/70">
              {tDetail('priceKicker')}
            </div>
            <div className="mt-2">
              {showSale ? (
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-[40px] font-heavy leading-none text-ce-accent-coral">
                    {formatPrice(salePrice as number, 'VND', fmtLocale)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(price, 'VND', fmtLocale)}
                  </span>
                  <Badge variant="sale" className="text-xs font-bold">
                    -{Math.round(((price - (salePrice as number)) / price) * 100)}%
                  </Badge>
                </div>
              ) : (
                <span className="text-[40px] font-heavy leading-none text-ce-primary">
                  {price > 0 ? (
                    <>
                      <span className="text-[40px]">
                        {formatPrice(price, 'VND', fmtLocale).replace(/\s?₫$/, '')}
                      </span>
                      <span className="ml-1 text-[24px] font-normal text-muted-foreground">₫</span>
                    </>
                  ) : (
                    tCommon('contact')
                  )}
                </span>
              )}
            </div>
          </div>

          {inStock ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
              <Check className="h-4 w-4" />
              {tDetail('inStock')}
            </div>
          ) : null}
        </div>

        {/* CTA buttons - more spacing */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            variant="ce"
            size="lg"
            className="h-12 w-full text-base font-semibold shadow-md transition-shadow hover:shadow-lg"
            disabled={primaryDisabled}
            onClick={() =>
              addItem({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: showSale ? (salePrice as number) : price,
                image: product.image,
              })
            }
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {tProduct('addToCart')}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full text-base font-semibold transition-colors hover:bg-ce-primary/5"
            asChild
          >
            <Link href={chatHref}>
              <MessageCircle className="mr-2 h-5 w-5" />
              {tCommon('chat')}
            </Link>
          </Button>
        </div>

        {/* Hint text - better spacing */}
        {primaryDisabled ? (
          <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
            {tDetail('priceOnRequestHint')}
          </p>
        ) : null}
      </div>
    </div>
  );
}
