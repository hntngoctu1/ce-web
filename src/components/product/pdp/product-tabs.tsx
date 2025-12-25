'use client';

import { useState } from 'react';
import { FileText, Info, ListChecks } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { SpecsTable } from './specs-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Spec = {
  id: string;
  key: string;
  value: string;
};

type ProductTabsProps = {
  overview?: string | null;
  specs: Spec[];
  className?: string;
};

export function ProductTabs({ overview, specs, className }: ProductTabsProps) {
  const t = useTranslations('productDetail');
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'docs'>('overview');

  return (
    <div className={cn('rounded-2xl border bg-white shadow-sm', className)}>
      {/* Tab navigation - sticky on scroll */}
      <div className="sticky top-20 z-10 border-b bg-white">
        <div className="flex gap-1 p-2">
          {[
            { id: 'overview' as const, label: t('overviewLabel'), icon: Info },
            { id: 'specs' as const, label: t('specsLabel'), icon: ListChecks },
            { id: 'docs' as const, label: t('documentsTitle'), icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-ce-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-ce-neutral-20 hover:text-ce-primary'
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6 md:p-8">
        {activeTab === 'overview' && (
          <div>
            {overview ? (
              <div
                className="prose prose-ce max-w-none"
                dangerouslySetInnerHTML={{ __html: overview }}
              />
            ) : (
              <p className="text-center text-sm text-muted-foreground">{t('noDescription')}</p>
            )}
          </div>
        )}

        {activeTab === 'specs' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-ce-primary-900">{t('specsTitle')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('specsSubtitle')}</p>
            </div>
            <SpecsTable specs={specs} />
          </div>
        )}

        {activeTab === 'docs' && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-ce-primary-900">{t('documentsTitle')}</h2>
            <div className="bg-ce-surface rounded-xl border border-dashed p-6 text-center">
              <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t('documentsEmpty')}</p>
              <div className="mt-4">
                <Button variant="ce" asChild>
                  <Link href="#quote">{t('requestDocuments')}</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
