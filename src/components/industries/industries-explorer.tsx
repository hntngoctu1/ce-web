'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Tag } from 'lucide-react';
import { industries, Industry } from '@/data/industries';
import { cn } from '@/lib/utils';

const allTags = Array.from(new Set(industries.flatMap((i) => i.tags))).sort();

function IndustryCard({ item }: { item: Industry }) {
  return (
    <div className="bg-white/5/10 via-white/3 group flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-white/5 text-white shadow-lg shadow-black/10 backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20">
      <div
        className="relative h-44 w-full overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(103,110,159,0.28), rgba(67,74,107,0.28)), url(${item.heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400/80" />
          {item.tags.slice(0, 3).join(' • ')}
        </div>
        <h3 className="text-xl font-semibold text-white">{item.name}</h3>
        <p className="line-clamp-3 text-sm text-white/70">{item.summary}</p>
        <div className="mt-auto flex flex-wrap gap-2">
          {item.keyOutcomes.slice(0, 3).map((o) => (
            <span
              key={o}
              className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-white/75"
            >
              {o}
            </span>
          ))}
        </div>
        <div className="pt-2">
          <Link
            href={`/industries/${item.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-white/80"
          >
            View details
            <span className="transition group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function IndustriesExplorer() {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return industries.filter((item) => {
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.summary.toLowerCase().includes(query.toLowerCase());
      const matchesTag = !tag || item.tags.includes(tag);
      return matchesQuery && matchesTag;
    });
  }, [query, tag]);

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
              placeholder="Search industries..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-white/30 focus:outline-none md:w-72"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTag(null)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition',
                !tag
                  ? 'border-white/40 bg-white/15 text-white'
                  : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30'
              )}
            >
              All
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t === tag ? null : t)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition',
                  tag === t
                    ? 'border-white/40 bg-white/15 text-white'
                    : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30'
                )}
              >
                <Tag className="h-3 w-3" />
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <IndustryCard key={item.slug} item={item} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
            No industries found. Try another keyword or tag.
          </div>
        )}
      </div>
    </div>
  );
}
