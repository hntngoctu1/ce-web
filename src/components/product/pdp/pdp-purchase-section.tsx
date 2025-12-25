'use client';

import Link from 'next/link';
import { ShoppingCart, MessageCircle, Check, AlertCircle, Minus, Plus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/utils';
import { toBCP47Locale } from '@/lib/i18n/locale';
import { cn } from '@/lib/utils';

type PdpPurchaseSectionProps = {
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
  chatHref?: string;
};

export function PdpPurchaseSection({ product, chatHref = '/contact' }: PdpPurchaseSectionProps) {
  const locale = useLocale();
  const fmtLocale = toBCP47Locale(locale);
  const tProduct = useTranslations('product');
  const tCommon = useTranslations('common');
  const tDetail = useTranslations('productDetail');

  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const price = product.price || 0;
  const salePrice = product.salePrice ?? null;
  const showSale = Boolean(product.isOnSale && salePrice && salePrice > 0 && salePrice < price);
  const effectivePrice = showSale ? (salePrice as number) : price;
  const inStock = (product.stockQuantity ?? 0) > 0;
  const hasPrice = price > 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: effectivePrice,
        image: product.image,
      });
    }
  };

  return (
    <div id="purchase-panel-anchor">
      {/* Price */}
      <div className="mb-4">
        {hasPrice ? (
          <div className="flex flex-wrap items-baseline gap-2">
            {showSale ? (
              <>
                <span className="text-3xl font-black tracking-tight text-rose-600 sm:text-4xl">
                  {formatPrice(salePrice as number, 'VND', fmtLocale)}
                </span>
                <span className="text-base text-slate-400 line-through">
                  {formatPrice(price, 'VND', fmtLocale)}
                </span>
                <span className="ml-1 inline-flex items-center rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                  -{Math.round(((price - (salePrice as number)) / price) * 100)}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {formatPrice(price, 'VND', fmtLocale)}
              </span>
            )}
          </div>
        ) : (
          <div className="text-xl font-bold text-ce-primary">{tCommon('contact')} for pricing</div>
        )}
      </div>

      {/* Stock Status */}
      <div className="mb-4">
        {inStock ? (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">{tDetail('inStock')}</span>
            {product.stockQuantity && product.stockQuantity <= 10 && (
              <span className="text-xs text-emerald-600">({product.stockQuantity} left)</span>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
            <span className="text-xs font-semibold text-rose-700">{tDetail('outOfStock')}</span>
          </div>
        )}
      </div>

      {/* Quantity + CTA */}
      {hasPrice && (
        <div className="space-y-3">
          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Quantity:</span>
            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="rounded-l-lg p-2 transition-colors hover:bg-slate-50 disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4 text-slate-600" />
              </button>
              <span className="w-10 border-x border-slate-200 text-center font-semibold text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="rounded-r-lg p-2 transition-colors hover:bg-slate-50"
              >
                <Plus className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              size="lg"
              className={cn(
                'h-12 flex-1 text-sm font-bold shadow-md transition-all',
                'bg-ce-primary text-white hover:bg-ce-primary/90',
                'hover:-translate-y-0.5 hover:shadow-lg',
                !inStock && 'cursor-not-allowed opacity-50'
              )}
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {tProduct('addToCart')}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-12 border-2 px-4 text-sm font-semibold hover:bg-slate-50"
              asChild
            >
              <Link href={chatHref}>
                <MessageCircle className="mr-1.5 h-4 w-4" />
                {tCommon('chat')}
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* No price - Contact CTA */}
      {!hasPrice && (
        <div className="flex gap-2">
          <Button
            size="lg"
            className="h-12 flex-1 bg-ce-primary text-sm font-bold hover:bg-ce-primary/90"
            asChild
          >
            <Link href="#quote">
              <MessageCircle className="mr-2 h-4 w-4" />
              Request Quote
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 border-2 px-4 text-sm font-semibold"
            asChild
          >
            <Link href={chatHref}>{tCommon('chat')}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
