'use client';

import { useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

type ActiveFilter = {
  key: string;
  value: string;
  label: string;
  displayValue: string;
};

type ActiveFiltersProps = {
  activeFilters: ActiveFilter[];
  locale: string;
  className?: string;
};

export function ActiveFilters({ activeFilters, locale, className }: ActiveFiltersProps) {
  const t = useTranslations('product');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (removeKey: string, removeValue?: string) => {
      const newParams = new URLSearchParams(searchParams.toString());

      if (removeValue) {
        // Remove specific value from multi-select param (e.g., groups[]=slug1&groups[]=slug2)
        const values = newParams.getAll(removeKey);
        newParams.delete(removeKey);
        values.filter((v) => v !== removeValue).forEach((v) => newParams.append(removeKey, v));
      } else {
        // Remove entire param
        newParams.delete(removeKey);
      }

      // Reset page
      newParams.delete('page');
      return newParams.toString();
    },
    [searchParams]
  );

  const handleRemoveFilter = (key: string, value?: string) => {
    startTransition(() => {
      const qs = createQueryString(key, value);
      router.push(`/menu/product${qs ? `?${qs}` : ''}`);
    });
  };

  const handleClearAll = () => {
    startTransition(() => {
      router.push('/menu/product');
    });
  };

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">{t('activeFilters')}:</span>

        {activeFilters.map((filter, idx) => (
          <Badge
            key={`${filter.key}-${filter.value}-${idx}`}
            variant="secondary"
            className="gap-1.5 pl-3 pr-2 text-sm font-normal"
          >
            <span className="font-medium">{filter.label}:</span>
            <span>{filter.displayValue}</span>
            <button
              onClick={() => handleRemoveFilter(filter.key, filter.value)}
              disabled={isPending}
              className="ml-1 rounded-full hover:bg-muted-foreground/20"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          disabled={isPending}
          className="h-7 text-xs text-ce-primary hover:text-ce-primary hover:underline"
        >
          {t('clearAll')}
        </Button>
      </div>
    </div>
  );
}
