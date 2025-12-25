'use client';

import { useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BadgePercent, Sparkles, PackageCheck, Clock3, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type QuickFiltersProps = {
  className?: string;
  active: {
    inStock: boolean;
    onSale: boolean;
    featured: boolean;
    newest: boolean;
  };
};

export function QuickFilters({ className, active }: QuickFiltersProps) {
  const t = useTranslations('product');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) newParams.delete(key);
        else newParams.set(key, value);
      });
      newParams.delete('page');
      return newParams.toString();
    },
    [searchParams]
  );

  const toggle = (key: 'inStock' | 'onSale' | 'featured' | 'newest') => {
    startTransition(() => {
      // newest is implemented as sort=newest (no separate filter)
      const qs =
        key === 'newest'
          ? createQueryString({ sort: active.newest ? null : 'newest' })
          : createQueryString({ [key]: active[key] ? null : 'true' });
      router.push(`/menu/product${qs ? `?${qs}` : ''}`);
    });
  };

  const clearQuick = () => {
    startTransition(() => {
      const qs = createQueryString({
        inStock: null,
        onSale: null,
        featured: null,
        ...(active.newest ? { sort: null } : {}),
      });
      router.push(`/menu/product${qs ? `?${qs}` : ''}`);
    });
  };

  const anyActive = active.inStock || active.onSale || active.featured || active.newest;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="mr-1 hidden text-sm font-medium text-muted-foreground sm:inline">
        {t('quickFilters')}:
      </span>

      <Button
        type="button"
        variant={active.onSale ? 'ce' : 'outline'}
        size="sm"
        className="h-9 gap-2 rounded-full"
        onClick={() => toggle('onSale')}
        disabled={isPending}
      >
        <BadgePercent className="h-4 w-4" />
        {t('quickOnSale')}
      </Button>

      <Button
        type="button"
        variant={active.featured ? 'ce' : 'outline'}
        size="sm"
        className="h-9 gap-2 rounded-full"
        onClick={() => toggle('featured')}
        disabled={isPending}
      >
        <Sparkles className="h-4 w-4" />
        {t('quickFeatured')}
      </Button>

      <Button
        type="button"
        variant={active.inStock ? 'ce' : 'outline'}
        size="sm"
        className="h-9 gap-2 rounded-full"
        onClick={() => toggle('inStock')}
        disabled={isPending}
      >
        <PackageCheck className="h-4 w-4" />
        {t('quickInStock')}
      </Button>

      <Button
        type="button"
        variant={active.newest ? 'ce' : 'outline'}
        size="sm"
        className="h-9 gap-2 rounded-full"
        onClick={() => toggle('newest')}
        disabled={isPending}
      >
        <Clock3 className="h-4 w-4" />
        {t('quickNewest')}
      </Button>

      {anyActive ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 gap-2 rounded-full text-muted-foreground"
          onClick={clearQuick}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
          {t('clearQuick')}
        </Button>
      ) : null}
    </div>
  );
}
