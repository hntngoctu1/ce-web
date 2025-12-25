'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Gauge,
  Ruler,
  Weight,
  Thermometer,
  Zap,
  Package,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

type Spec = {
  id: string;
  key: string;
  value: string;
};

type SpecsTableProps = {
  specs: Spec[];
  className?: string;
};

// Map common spec keywords to icons (case-insensitive partial match)
function getIconForKey(key: string): React.ReactNode | null {
  const lower = key.toLowerCase();
  if (
    lower.includes('size') ||
    lower.includes('dimension') ||
    lower.includes('length') ||
    lower.includes('width') ||
    lower.includes('height')
  ) {
    return <Ruler className="h-4 w-4 text-ce-primary/60" />;
  }
  if (lower.includes('weight') || lower.includes('mass')) {
    return <Weight className="h-4 w-4 text-ce-primary/60" />;
  }
  if (lower.includes('temperature') || lower.includes('temp') || lower.includes('heat')) {
    return <Thermometer className="h-4 w-4 text-ce-primary/60" />;
  }
  if (
    lower.includes('power') ||
    lower.includes('volt') ||
    lower.includes('current') ||
    lower.includes('electric')
  ) {
    return <Zap className="h-4 w-4 text-ce-primary/60" />;
  }
  if (lower.includes('package') || lower.includes('packaging') || lower.includes('pack')) {
    return <Package className="h-4 w-4 text-ce-primary/60" />;
  }
  if (
    lower.includes('capacity') ||
    lower.includes('volume') ||
    lower.includes('speed') ||
    lower.includes('rate')
  ) {
    return <Gauge className="h-4 w-4 text-ce-primary/60" />;
  }
  return null;
}

export function SpecsTable({ specs, className }: SpecsTableProps) {
  const t = useTranslations('productDetail');
  const [expanded, setExpanded] = useState(false);

  if (!specs || specs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-ce-neutral-20/50 px-6 py-5 text-center text-sm text-muted-foreground">
        {t('noSpecs')}
      </div>
    );
  }

  const COLLAPSE_THRESHOLD = 8;
  const shouldCollapse = specs.length > COLLAPSE_THRESHOLD;
  const visibleSpecs = shouldCollapse && !expanded ? specs.slice(0, COLLAPSE_THRESHOLD) : specs;

  return (
    <div className={className}>
      {/* Specs grid - zebra stripes, premium typography */}
      <div className="overflow-hidden rounded-xl border shadow-sm">
        {visibleSpecs.map((spec, idx) => {
          const icon = getIconForKey(spec.key);
          return (
            <div
              key={spec.id}
              className={`flex flex-col justify-between gap-3 px-6 py-4 transition-colors hover:bg-ce-primary/5 sm:flex-row sm:items-center ${
                idx % 2 === 0 ? 'bg-white' : 'bg-ce-neutral-20/30'
              }`}
            >
              <div className="flex items-center gap-3 font-medium text-ce-primary-900">
                {icon}
                <span className="text-[15px]">{spec.key}</span>
              </div>
              <div className="text-[15px] leading-relaxed text-foreground/80 sm:text-right">
                {spec.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand/collapse button */}
      {shouldCollapse && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-ce-primary hover:bg-ce-primary/10"
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                {t('showLess')}
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                {t('showMore')} ({specs.length - COLLAPSE_THRESHOLD})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
