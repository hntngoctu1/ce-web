'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import { getFeaturedUseCases } from '@/data/industry-use-cases';

interface CaseStudiesSectionProps {
  className?: string;
}

// Get featured use cases from our professional data
const featuredUseCases = getFeaturedUseCases();

// Transform use cases to case studies format for display
const caseStudies = featuredUseCases.slice(0, 6).map((uc) => ({
  id: uc.id,
  titleEn: uc.titleEn,
  titleVi: uc.titleVi,
  descriptionEn: uc.solutionEn.slice(0, 120) + '...',
  descriptionVi: uc.solutionVi.slice(0, 120) + '...',
  image: uc.image,
  href: '/case-studies',
  stats: uc.statsEn,
  statsVi: uc.statsVi,
  industryEn: uc.industryTagEn,
  industryVi: uc.industryTagVi,
}));

export function CaseStudiesSection({ className }: CaseStudiesSectionProps) {
  const locale = useLocale();
  const tHome = useTranslations('home');
  const tCommon = useTranslations('common');
  const isVi = (locale || '').toLowerCase().startsWith('vi');

  return (
    <section className={cn('ce-section', className)}>
      <div className="ce-container">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="ce-heading mb-4 text-3xl">{tHome('caseStudiesTitle')}</h2>
            <p className="max-w-2xl text-muted-foreground">{tHome('caseStudiesSubtitle')}</p>
          </div>
          <Button variant="ce-outline" asChild>
            <Link href="/case-studies">
              {tCommon('viewAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Hexagon Grid Layout */}
        <div className="grid gap-4 md:grid-cols-3 lg:gap-6">
          {caseStudies.slice(0, 6).map((study, index) => (
            <Link
              key={study.id}
              href={study.href}
              className={cn(
                'group relative aspect-[4/3] overflow-hidden rounded-xl bg-ce-neutral-20',
                'animate-fade-up cursor-pointer'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Cover image */}
              <Image
                src={study.image}
                alt={isVi ? study.titleVi : study.titleEn}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
              />

              {/* Always-on premium overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-ce-primary-900/75 via-ce-primary-900/20 to-transparent" />
              <div className="ce-hero-pattern absolute inset-0 opacity-10" />

              {/* Industry tag */}
              <div className="absolute left-4 top-4">
                <span className="rounded-full bg-ce-accent-teal/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {isVi ? study.industryVi : study.industryEn}
                </span>
              </div>

              {/* Content (visible by default; stronger on hover) */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white transition-opacity duration-300">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold">{isVi ? study.titleVi : study.titleEn}</h3>
                  <ArrowRight className="h-5 w-5 opacity-80 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-white/85">
                  {isVi ? study.descriptionVi : study.descriptionEn}
                </p>
              </div>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent transition-colors duration-300 group-hover:border-ce-primary" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
