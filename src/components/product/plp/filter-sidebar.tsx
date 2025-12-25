'use client';

import { useMemo, useState, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, X, Sparkles, Tag, Building2, DollarSign, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

type FilterOption = {
  id: string;
  slug: string;
  label: string;
  count?: number;
};

type FilterSidebarProps = {
  groups: FilterOption[];
  industries: FilterOption[];
  brands: FilterOption[];
  priceRange: { min: number; max: number };
  selectedFilters: {
    groups: string[];
    industries: string[];
    brands: string[];
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
  };
  locale: string;
};

export function FilterSidebar({
  groups,
  industries,
  brands,
  priceRange,
  selectedFilters,
  locale,
}: FilterSidebarProps) {
  const t = useTranslations('product');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [expandedSections, setExpandedSections] = useState({
    groups: true,
    industries: true,
    brands: true,
    price: false,
    availability: false,
  });

  const [showAll, setShowAll] = useState({
    groups: false,
    industries: false,
    brands: false,
  });

  const [localPriceRange, setLocalPriceRange] = useState([
    selectedFilters.priceMin || priceRange.min,
    selectedFilters.priceMax || priceRange.max,
  ]);

  const clampPrice = useCallback(
    (val: number) => Math.min(priceRange.max, Math.max(priceRange.min, val)),
    [priceRange.max, priceRange.min]
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleShowAll = (section: keyof typeof showAll) => {
    setShowAll((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const createQueryString = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        newParams.delete(key);
        if (value === null || (Array.isArray(value) && value.length === 0)) {
          // Remove
        } else if (Array.isArray(value)) {
          value.forEach((v) => newParams.append(key, v));
        } else {
          newParams.set(key, value);
        }
      });

      newParams.delete('page');
      return newParams.toString();
    },
    [searchParams]
  );

  const handleMultiSelect = (filterKey: string, optionSlug: string, checked: boolean) => {
    const current = (selectedFilters[filterKey as keyof typeof selectedFilters] as string[]) || [];
    const updated = checked ? [...current, optionSlug] : current.filter((s) => s !== optionSlug);

    startTransition(() => {
      const qs = createQueryString({ [filterKey]: updated.length ? updated : null });
      router.push(`/menu/product${qs ? `?${qs}` : ''}`);
    });
  };

  const handlePriceChange = () => {
    startTransition(() => {
      const qs = createQueryString({
        priceMin: localPriceRange[0] !== priceRange.min ? localPriceRange[0].toString() : null,
        priceMax: localPriceRange[1] !== priceRange.max ? localPriceRange[1].toString() : null,
      });
      router.push(`/menu/product${qs ? `?${qs}` : ''}`);
    });
  };

  const handleMinInput = (value: string) => {
    const num = Number(value || 0);
    const nextMin = clampPrice(num);
    setLocalPriceRange(([_, max]) => [Math.min(nextMin, max), max]);
  };

  const handleMaxInput = (value: string) => {
    const num = Number(value || 0);
    const nextMax = clampPrice(num);
    setLocalPriceRange(([min, _]) => [min, Math.max(nextMax, min)]);
  };

  const handleAvailability = (inStock: boolean) => {
    startTransition(() => {
      const qs = createQueryString({ inStock: inStock ? 'true' : null });
      router.push(`/menu/product${qs ? `?${qs}` : ''}`);
    });
  };

  const clearAllFilters = () => {
    setLocalPriceRange([priceRange.min, priceRange.max]);
    startTransition(() => {
      router.push('/menu/product');
    });
  };

  const hasActiveFilters =
    selectedFilters.groups.length > 0 ||
    selectedFilters.industries.length > 0 ||
    selectedFilters.brands.length > 0 ||
    selectedFilters.priceMin !== undefined ||
    selectedFilters.priceMax !== undefined ||
    selectedFilters.inStock;

  const activeCount = useMemo(() => {
    let n =
      selectedFilters.groups.length +
      selectedFilters.industries.length +
      selectedFilters.brands.length;
    if (selectedFilters.priceMin !== undefined || selectedFilters.priceMax !== undefined) n += 1;
    if (selectedFilters.inStock) n += 1;
    return n;
  }, [selectedFilters]);

  const sectionIcons: Record<string, React.ReactNode> = {
    groups: <Tag className="h-3.5 w-3.5" />,
    industries: <Building2 className="h-3.5 w-3.5" />,
    brands: <Sparkles className="h-3.5 w-3.5" />,
    price: <DollarSign className="h-3.5 w-3.5" />,
    availability: <Package className="h-3.5 w-3.5" />,
  };

  const renderFilterSection = (
    key: 'groups' | 'industries' | 'brands',
    title: string,
    options: FilterOption[],
    selectedSlugs: string[],
    filterKey: string
  ) => {
    const isExpanded = expandedSections[key];
    const hasMore = options.length > 5;
    const visibleCount = hasMore && !showAll[key] ? 5 : options.length;
    const selectedCount = selectedSlugs.length;

    return (
      <div className="border-b border-gray-100 last:border-0">
        <button
          onClick={() => toggleSection(key)}
          className={cn(
            'flex w-full items-center gap-2 py-3 text-left transition-colors',
            'group hover:text-ce-primary'
          )}
        >
          <span
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md transition-colors',
              isExpanded
                ? 'bg-ce-primary/10 text-ce-primary'
                : 'bg-gray-100 text-gray-500 group-hover:bg-ce-primary/10 group-hover:text-ce-primary'
            )}
          >
            {sectionIcons[key]}
          </span>
          <span className="flex-1 text-sm font-semibold text-gray-800">{title}</span>
          {selectedCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ce-primary px-1.5 text-[10px] font-bold text-white">
              {selectedCount}
            </span>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-gray-400 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </button>

        <div
          className={cn(
            'grid transition-all duration-200 ease-out',
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-0.5 pb-3">
              {options.slice(0, visibleCount).map((option) => {
                const isChecked = selectedSlugs.includes(option.slug);
                return (
                  <label
                    key={option.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-all',
                      isChecked
                        ? 'bg-ce-primary/5 text-ce-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Checkbox
                      id={`${filterKey}-${option.slug}`}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleMultiSelect(filterKey, option.slug, checked as boolean)
                      }
                      disabled={isPending}
                      className={cn(
                        'h-4 w-4 rounded border-2 transition-all',
                        isChecked
                          ? 'border-ce-primary bg-ce-primary data-[state=checked]:bg-ce-primary'
                          : 'border-gray-300'
                      )}
                    />
                    <span
                      className={cn('flex-1 text-sm leading-tight', isChecked && 'font-medium')}
                    >
                      {option.label}
                    </span>
                    {option.count !== undefined && option.count > 0 && (
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                          isChecked
                            ? 'bg-ce-primary/20 text-ce-primary'
                            : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        {option.count}
                      </span>
                    )}
                  </label>
                );
              })}
              {hasMore && (
                <button
                  type="button"
                  onClick={() => toggleShowAll(key)}
                  className="mt-1 flex items-center gap-1 px-2 text-xs font-medium text-ce-primary transition-colors hover:text-ce-primary/80"
                >
                  {showAll[key] ? <>Show less</> : <>+{options.length - 5} more</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ce-primary to-ce-primary/80 text-white shadow-sm">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{t('filters')}</h2>
            {activeCount > 0 && <p className="text-[10px] text-gray-500">{activeCount} active</p>}
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            disabled={isPending}
            className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="space-y-0">
        {/* Groups */}
        {groups.length > 0 &&
          renderFilterSection(
            'groups',
            t('filterByGroup'),
            groups,
            selectedFilters.groups,
            'groups'
          )}

        {/* Industries */}
        {industries.length > 0 &&
          renderFilterSection(
            'industries',
            t('filterByIndustry'),
            industries,
            selectedFilters.industries,
            'industries'
          )}

        {/* Brands */}
        {brands.length > 0 &&
          renderFilterSection(
            'brands',
            t('filterByBrand'),
            brands,
            selectedFilters.brands,
            'brands'
          )}

        {/* Price range */}
        <div className="border-b border-gray-100 last:border-0">
          <button
            onClick={() => toggleSection('price')}
            className="group flex w-full items-center gap-2 py-3 text-left transition-colors hover:text-ce-primary"
          >
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-md transition-colors',
                expandedSections.price
                  ? 'bg-ce-primary/10 text-ce-primary'
                  : 'bg-gray-100 text-gray-500 group-hover:bg-ce-primary/10 group-hover:text-ce-primary'
              )}
            >
              {sectionIcons.price}
            </span>
            <span className="flex-1 text-sm font-semibold text-gray-800">{t('filterByPrice')}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform duration-200',
                expandedSections.price && 'rotate-180'
              )}
            />
          </button>

          <div
            className={cn(
              'grid transition-all duration-200 ease-out',
              expandedSections.price ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            )}
          >
            <div className="overflow-hidden">
              <div className="space-y-3 px-1 pb-3">
                <Slider
                  min={priceRange.min}
                  max={priceRange.max}
                  step={10000}
                  value={localPriceRange}
                  onValueChange={setLocalPriceRange}
                  className="w-full"
                  disabled={isPending}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      inputMode="numeric"
                      value={String(localPriceRange[0])}
                      onChange={(e) => handleMinInput(e.target.value.replace(/[^\d]/g, ''))}
                      className="h-8 border-gray-200 bg-gray-50 text-center text-xs focus:bg-white"
                      disabled={isPending}
                      placeholder="Min"
                    />
                  </div>
                  <div>
                    <Input
                      inputMode="numeric"
                      value={String(localPriceRange[1])}
                      onChange={(e) => handleMaxInput(e.target.value.replace(/[^\d]/g, ''))}
                      className="h-8 border-gray-200 bg-gray-50 text-center text-xs focus:bg-white"
                      disabled={isPending}
                      placeholder="Max"
                    />
                  </div>
                </div>
                <button
                  onClick={handlePriceChange}
                  disabled={isPending}
                  className="w-full rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                >
                  {t('applyPrice')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="pt-1">
          <button
            onClick={() => toggleSection('availability')}
            className="group flex w-full items-center gap-2 py-3 text-left transition-colors hover:text-ce-primary"
          >
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-md transition-colors',
                expandedSections.availability
                  ? 'bg-ce-primary/10 text-ce-primary'
                  : 'bg-gray-100 text-gray-500 group-hover:bg-ce-primary/10 group-hover:text-ce-primary'
              )}
            >
              {sectionIcons.availability}
            </span>
            <span className="flex-1 text-sm font-semibold text-gray-800">
              {t('filterByAvailability')}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform duration-200',
                expandedSections.availability && 'rotate-180'
              )}
            />
          </button>

          <div
            className={cn(
              'grid transition-all duration-200 ease-out',
              expandedSections.availability
                ? 'grid-rows-[1fr] opacity-100'
                : 'grid-rows-[0fr] opacity-0'
            )}
          >
            <div className="overflow-hidden">
              <div className="pb-3">
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-all',
                    selectedFilters.inStock
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Checkbox
                    id="in-stock"
                    checked={Boolean(selectedFilters.inStock)}
                    onCheckedChange={(checked) => handleAvailability(checked as boolean)}
                    disabled={isPending}
                    className={cn(
                      'h-4 w-4 rounded border-2 transition-all',
                      selectedFilters.inStock
                        ? 'border-green-600 bg-green-600 data-[state=checked]:bg-green-600'
                        : 'border-gray-300'
                    )}
                  />
                  <span className={cn('flex-1 text-sm', selectedFilters.inStock && 'font-medium')}>
                    {t('inStockOnly')}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-medium',
                      selectedFilters.inStock
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    Ready
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-ce-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
