'use client';

import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

type ProductHeaderProps = {
  name: string;
  sku?: string | null;
  shortDesc?: string | null;
  brand?: { name: string } | null;
  isOnSale?: boolean;
  isFeatured?: boolean;
  className?: string;
};

export function ProductHeader({
  name,
  sku,
  shortDesc,
  brand,
  isOnSale,
  isFeatured,
  className,
}: ProductHeaderProps) {
  const tProduct = useTranslations('product');
  const tDetail = useTranslations('productDetail');

  return (
    <div className={className}>
      {/* Badges row - more breathing room */}
      {(isOnSale || isFeatured || brand) && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {isOnSale && (
            <Badge variant="sale" className="text-xs font-bold uppercase tracking-wide">
              {tProduct('onSale')}
            </Badge>
          )}
          {isFeatured && (
            <Badge variant="featured" className="text-xs font-bold uppercase tracking-wide">
              {tProduct('featured')}
            </Badge>
          )}
          {brand?.name && (
            <Badge variant="outline" className="text-xs font-medium">
              {brand.name}
            </Badge>
          )}
        </div>
      )}

      {/* Product name - increase size, better line-height */}
      <h1 className="text-[28px] font-heavy leading-tight text-ce-primary-900 md:text-[34px] md:leading-tight">
        {name}
      </h1>

      {/* SKU - subtle, more spacing */}
      {sku && (
        <div className="mt-3 text-[13px] text-muted-foreground">
          {tDetail('skuLabel')}: <span className="font-medium text-foreground/80">{sku}</span>
        </div>
      )}

      {/* Short description - better line-height, more spacing */}
      {shortDesc && (
        <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">{shortDesc}</p>
      )}
    </div>
  );
}
