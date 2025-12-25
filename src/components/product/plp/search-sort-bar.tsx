'use client';

import { useEffect, useRef, useState, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Grid3x3, List, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'newest';

type SearchSortBarProps = {
  searchQuery?: string;
  sortBy?: SortOption;
  viewMode?: ViewMode;
  resultCount: number;
  className?: string;
};

export function SearchSortBar({
  searchQuery = '',
  sortBy = 'featured',
  viewMode = 'grid',
  resultCount,
  className,
}: SearchSortBarProps) {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchQuery);
  const firstRenderRef = useRef(true);

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      newParams.delete('page');
      return newParams.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const qs = createQueryString({ q: search || null });
      router.push(`/menu/product${qs ? `?${qs}` : ''}`);
    });
  };

  const handleSortChange = (value: string) => {
    startTransition(() => {
      const qs = createQueryString({ sort: value === 'featured' ? null : value });
      router.push(`/menu/product${qs ? `?${qs}` : ''}`);
    });
  };

  const handleViewChange = (mode: ViewMode) => {
    startTransition(() => {
      const qs = createQueryString({ view: mode === 'grid' ? null : mode });
      router.push(`/menu/product${qs ? `?${qs}` : ''}`);
    });
  };

  // Debounced search
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    const trimmed = search.trim();
    if (trimmed.length === 1) return;

    const handle = setTimeout(() => {
      startTransition(() => {
        const qs = createQueryString({ q: trimmed ? trimmed : null });
        router.push(`/menu/product${qs ? `?${qs}` : ''}`);
      });
    }, 350);

    return () => clearTimeout(handle);
  }, [createQueryString, router, search, startTransition]);

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {/* Search bar - compact */}
      <form onSubmit={handleSearch} className="min-w-[200px] flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder={tCommon('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 border-gray-200 bg-gray-50 pl-8 pr-3 text-sm focus:bg-white"
            disabled={isPending}
          />
        </div>
      </form>

      {/* Result count */}
      <div className="hidden items-center text-sm text-gray-500 sm:flex">
        <span className="font-semibold text-gray-900">{resultCount.toLocaleString()}</span>
        <span className="ml-1">{t('productsFound')}</span>
      </div>

      {/* Sort dropdown - compact */}
      <Select value={sortBy} onValueChange={handleSortChange} disabled={isPending}>
        <SelectTrigger className="h-9 w-[140px] border-gray-200 bg-white text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="featured">{t('sortFeatured')}</SelectItem>
          <SelectItem value="newest">{t('sortNewest')}</SelectItem>
          <SelectItem value="name-asc">{t('sortNameAsc')}</SelectItem>
          <SelectItem value="price-asc">{t('sortPriceAsc')}</SelectItem>
          <SelectItem value="price-desc">{t('sortPriceDesc')}</SelectItem>
        </SelectContent>
      </Select>

      {/* View mode toggle */}
      <div className="hidden items-center rounded-md border border-gray-200 bg-white p-0.5 sm:flex">
        <button
          type="button"
          onClick={() => handleViewChange('grid')}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded transition-colors',
            viewMode === 'grid'
              ? 'bg-ce-primary text-white'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          )}
          disabled={isPending}
        >
          <Grid3x3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleViewChange('list')}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded transition-colors',
            viewMode === 'list'
              ? 'bg-ce-primary text-white'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          )}
          disabled={isPending}
        >
          <List className="h-4 w-4" />
        </button>
      </div>

      {/* Loading indicator */}
      {isPending && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-ce-primary border-t-transparent" />
      )}
    </div>
  );
}
