'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCallback, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

interface ProductGroup {
  id: string;
  slug: string;
  nameEn: string;
  nameVi: string;
}

interface ProductFilterProps {
  groups: ProductGroup[];
  selectedGroup?: string;
  searchQuery?: string;
  locale?: string;
  className?: string;
}

export function ProductFilter({
  groups,
  selectedGroup,
  searchQuery = '',
  locale = 'en',
  className,
}: ProductFilterProps) {
  const tProduct = useTranslations('product');
  const tCommon = useTranslations('common');
  const isVi = (locale || '').toLowerCase().startsWith('vi');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchQuery);

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      return newParams.toString();
    },
    [searchParams]
  );

  const handleGroupChange = (groupSlug: string | null) => {
    startTransition(() => {
      const queryString = createQueryString({
        group: groupSlug,
        page: null, // Reset to page 1
      });
      router.push(`/menu/product${queryString ? `?${queryString}` : ''}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const queryString = createQueryString({
        q: search || null,
        page: null,
      });
      router.push(`/menu/product${queryString ? `?${queryString}` : ''}`);
    });
  };

  const clearFilters = () => {
    setSearch('');
    startTransition(() => {
      router.push('/menu/product');
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={tCommon('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      {/* Groups */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {tProduct('groupsTitle')}
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => handleGroupChange(null)}
            disabled={isPending}
            className={cn(
              'block w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
              !selectedGroup ? 'bg-ce-primary text-white' : 'text-foreground hover:bg-ce-neutral-20'
            )}
          >
            {tProduct('allProducts')}
          </button>

          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => handleGroupChange(group.slug)}
              disabled={isPending}
              className={cn(
                'block w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                selectedGroup === group.slug
                  ? 'bg-ce-primary text-white'
                  : 'text-foreground hover:bg-ce-neutral-20'
              )}
            >
              {isVi ? group.nameVi : group.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedGroup || searchQuery) && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
          disabled={isPending}
        >
          <X className="mr-2 h-4 w-4" />
          {tProduct('clearFilters')}
        </Button>
      )}

      {isPending && (
        <div className="flex justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-ce-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
