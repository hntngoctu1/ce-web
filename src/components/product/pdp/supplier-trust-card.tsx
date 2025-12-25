'use client';

import { BadgeCheck, Clock, Calendar, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type SupplierTrustCardProps = {
  brandName: string;
  isVerified?: boolean;
  responseTime?: string; // e.g. "< 2 hours", "Within 24 hours"
  yearsInBusiness?: number;
  className?: string;
};

export function SupplierTrustCard({
  brandName,
  isVerified = false,
  responseTime,
  yearsInBusiness,
  className,
}: SupplierTrustCardProps) {
  const t = useTranslations('productDetail');

  return (
    <div
      className={cn(
        'rounded-2xl border bg-gradient-to-br from-white to-ce-neutral-20/30 p-5 shadow-sm',
        className
      )}
    >
      {/* Supplier name + verified badge */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-ce-primary-900">{brandName}</h3>
            {isVerified && (
              <BadgeCheck
                className="h-5 w-5 flex-shrink-0 text-blue-600"
                aria-label={t('facts.verified')}
              />
            )}
          </div>
          {isVerified && (
            <div className="mt-1 text-xs font-medium text-blue-600">{t('facts.verified')}</div>
          )}
        </div>
      </div>

      {/* Trust metrics */}
      <div className="mt-4 space-y-3 border-t pt-4">
        {responseTime && (
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 flex-shrink-0 text-ce-primary/60" />
            <div>
              <div className="font-medium text-foreground">{t('facts.responseTime')}</div>
              <div className="text-xs text-muted-foreground">{responseTime}</div>
            </div>
          </div>
        )}

        {yearsInBusiness !== undefined && yearsInBusiness > 0 && (
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 flex-shrink-0 text-ce-primary/60" />
            <div>
              <div className="font-medium text-foreground">{t('facts.yearsInBusiness')}</div>
              <div className="text-xs text-muted-foreground">
                {yearsInBusiness}+ {t('facts.years')}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 text-sm">
          <MessageCircle className="h-4 w-4 flex-shrink-0 text-ce-primary/60" />
          <div>
            <div className="font-medium text-foreground">{t('facts.directSupport')}</div>
            <div className="text-xs text-muted-foreground">{t('facts.directSupportHint')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
