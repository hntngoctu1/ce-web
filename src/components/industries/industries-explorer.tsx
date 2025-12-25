'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Search, Tag, Package, ArrowRight } from 'lucide-react';
import { industries, Industry } from '@/data/industries';
import { cn } from '@/lib/utils';

function IndustryCard({ item, isVi }: { item: Industry; isVi: boolean }) {
  const name = isVi ? item.nameVi : item.name;
  const summary = isVi ? item.summaryVi : item.summary;
  const tags = isVi ? item.tagsVi : item.tags;
  const keyOutcomes = isVi ? item.keyOutcomesVi : item.keyOutcomes;

  return (
    <Link
      href={`/industries/${item.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-xl"
    >
      {/* Image/Icon area */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-white/10 to-white/5">
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="h-16 w-16 text-white/20" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ce-primary-900/80 to-transparent" />

        {/* Tags on image */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-bold text-white group-hover:text-ce-accent-teal">{name}</h3>
        <p className="line-clamp-2 text-sm text-white/70">{summary}</p>

        {/* Stats preview */}
        {item.stats && item.stats.length > 0 && (
          <div className="mt-auto flex items-center gap-3 border-t border-white/10 pt-3">
            <div className="text-center">
              <div className="text-sm font-bold text-ce-accent-teal">{item.stats[0].value}</div>
              <div className="text-xs text-white/50">
                {isVi ? item.stats[0].labelVi : item.stats[0].label}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 text-sm font-semibold text-white/80 group-hover:text-white">
          {isVi ? 'Xem chi tiết' : 'View details'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export function IndustriesExplorer() {
  const locale = useLocale();
  const isVi = locale.toLowerCase().startsWith('vi');

  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = industries.flatMap((i) => (isVi ? i.tagsVi : i.tags));
    return Array.from(new Set(tags)).sort();
  }, [isVi]);

  const filtered = useMemo(() => {
    return industries.filter((item) => {
      const name = isVi ? item.nameVi : item.name;
      const summary = isVi ? item.summaryVi : item.summary;
      const tags = isVi ? item.tagsVi : item.tags;

      const matchesQuery =
        !query ||
        name.toLowerCase().includes(query.toLowerCase()) ||
        summary.toLowerCase().includes(query.toLowerCase());
      const matchesTag = !selectedTag || tags.includes(selectedTag);
      return matchesQuery && matchesTag;
    });
  }, [query, selectedTag, isVi]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-white/60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isVi ? 'Tìm kiếm danh mục...' : 'Search categories...'}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-white/30 focus:outline-none md:w-72"
            />
          </div>
          <div className="text-sm text-white/60">
            {filtered.length} {isVi ? 'danh mục' : 'categories'}
          </div>
        </div>

        {/* Tags filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition',
              !selectedTag
                ? 'border-white/40 bg-white/15 text-white'
                : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30'
            )}
          >
            {isVi ? 'Tất cả' : 'All'}
          </button>
          {allTags.slice(0, 10).map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition',
                selectedTag === tag
                  ? 'border-white/40 bg-white/15 text-white'
                  : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30'
              )}
            >
              <Tag className="h-3 w-3" />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => (
          <IndustryCard key={item.slug} item={item} isVi={isVi} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
            {isVi
              ? 'Không tìm thấy danh mục. Thử từ khóa hoặc tag khác.'
              : 'No categories found. Try another keyword or tag.'}
          </div>
        )}
      </div>
    </div>
  );
}
