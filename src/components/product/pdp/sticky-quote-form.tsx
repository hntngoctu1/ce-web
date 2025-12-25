'use client';

import { PhoneCall, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ProductInquiryCard } from '@/components/product/product-inquiry-card';
import { cn } from '@/lib/utils';

type StickyQuoteFormProps = {
  productName: string;
  productSlug: string;
  className?: string;
};

export function StickyQuoteForm({ productName, productSlug, className }: StickyQuoteFormProps) {
  const t = useTranslations('productDetail');

  return (
    <div className={cn('space-y-4', className)}>
      <ProductInquiryCard
        productName={productName}
        productSlug={productSlug}
        showDirectContact={false}
        submitVariant="secondary"
        submitSize="xl"
      />

      <div className="rounded-2xl border bg-white p-5 text-sm text-muted-foreground shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-ce-primary">
          {t('directContactTitle')}
        </div>
        <div className="mt-3 space-y-2">
          <a
            className="inline-flex items-center gap-2 text-ce-primary hover:underline"
            href="tel:+842812345678"
          >
            <PhoneCall className="h-4 w-4" />
            +84 28 1234 5678
          </a>
          <a
            className="inline-flex items-center gap-2 text-ce-primary hover:underline"
            href="mailto:sales@ce.com.vn"
          >
            <Mail className="h-4 w-4" />
            sales@ce.com.vn
          </a>
        </div>
      </div>
    </div>
  );
}
