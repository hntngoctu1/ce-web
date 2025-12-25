'use client';

import type { ReactNode } from 'react';
import { useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type MobileBottomBarProps = {
  activeFilterCount: number;
  sort: string | undefined;
  view: 'grid' | 'list';
  childrenFilters: ReactNode;
  className?: string;
};

export function MobileBottomBar({
  activeFilterCount,
  sort,
  view,
  childrenFilters,
  className,
}: MobileBottomBarProps) {
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

  const setSort = (value: string) => {
    startTransition(() => {
      const qs = createQueryString({ sort: value === 'featured' ? null : value });
      router.push(`/menu/product${qs ? `?${qs}` : ''}`);
    });
  };

  const setView = (mode: 'grid' | 'list') => {
    startTransition(() => {
      const qs = createQueryString({ view: mode === 'grid' ? null : mode });
      router.push(`/menu/product${qs ? `?${qs}` : ''}`);
    });
  };

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 lg:hidden',
        className
      )}
    >
      <div className="ce-container flex h-16 items-center justify-between gap-2 py-2">
        {/* Filter */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="h-11 flex-1 justify-center gap-2"
              disabled={isPending}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t('filters')}
              {activeFilterCount > 0 ? (
                <span className="ml-1 rounded-full bg-ce-neutral-20 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[92vw] max-w-[420px] overflow-y-auto p-0">
            <SheetHeader className="border-b p-5">
              <SheetTitle className="text-lg">{t('filters')}</SheetTitle>
            </SheetHeader>
            <div className="p-5">{childrenFilters}</div>
          </SheetContent>
        </Sheet>

        {/* Sort */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="h-11 flex-1 justify-center gap-2"
              disabled={isPending}
            >
              <ArrowUpDown className="h-4 w-4" />
              {t('sortLabel')}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl p-0">
            <SheetHeader className="border-b p-5">
              <SheetTitle className="text-lg">{t('sortLabel')}</SheetTitle>
            </SheetHeader>
            <div className="p-5">
              <div className="space-y-2">
                {[
                  { value: 'featured', label: t('sortFeatured') },
                  { value: 'newest', label: t('sortNewest') },
                  { value: 'name-asc', label: t('sortNameAsc') },
                  { value: 'price-asc', label: t('sortPriceAsc') },
                  { value: 'price-desc', label: t('sortPriceDesc') },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSort(opt.value)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm',
                      (sort || 'featured') === opt.value
                        ? 'border-ce-primary bg-ce-neutral-20'
                        : 'bg-white'
                    )}
                    disabled={isPending}
                  >
                    <span className="text-foreground">{opt.label}</span>
                    <span
                      className={cn(
                        'h-4 w-4 rounded-full border',
                        (sort || 'featured') === opt.value
                          ? 'border-ce-primary bg-ce-primary'
                          : 'border-muted-foreground'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* View */}
        <div className="flex flex-1 items-center justify-center gap-2">
          <Button
            variant={view === 'grid' ? 'ce' : 'outline'}
            className="h-11 w-full gap-2"
            onClick={() => setView('grid')}
            disabled={isPending}
          >
            <LayoutGrid className="h-4 w-4" />
            {t('viewGrid')}
          </Button>
          <Button
            variant={view === 'list' ? 'ce' : 'outline'}
            className="h-11 w-full gap-2"
            onClick={() => setView('list')}
            disabled={isPending}
          >
            <List className="h-4 w-4" />
            {t('viewList')}
          </Button>
        </div>
      </div>
    </div>
  );
}
