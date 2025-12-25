'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  ArrowRight,
  CheckCircle2,
  Quote,
  Building2,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getFeaturedUseCases, getUseCasesByIndustry, UseCase } from '@/data/industry-use-cases';

interface UseCaseCardProps {
  useCase: UseCase;
  isVi: boolean;
  variant?: 'compact' | 'detailed';
}

function UseCaseCard({ useCase, isVi, variant = 'compact' }: UseCaseCardProps) {
  const title = isVi ? useCase.titleVi : useCase.titleEn;
  const client = isVi ? useCase.clientVi : useCase.clientEn;
  const tag = isVi ? useCase.industryTagVi : useCase.industryTagEn;
  const challenge = isVi ? useCase.challengeVi : useCase.challengeEn;
  const results = isVi ? useCase.resultsVi : useCase.resultsEn;
  const stats = isVi ? useCase.statsVi : useCase.statsEn;
  const testimonial = isVi ? useCase.testimonialVi : useCase.testimonialEn;

  if (variant === 'detailed') {
    return (
      <article className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-xl">
        {/* Header with Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={useCase.image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ce-primary-900/90 via-ce-primary-900/50 to-transparent" />

          {/* Featured Badge */}
          {useCase.featured && (
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-ce-accent-gold px-3 py-1 text-xs font-bold text-white">
              <Star className="h-3 w-3" />
              {isVi ? 'Nổi bật' : 'Featured'}
            </div>
          )}

          {/* Tag & Client */}
          <div className="absolute bottom-4 left-4 right-4">
            <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {tag}
            </span>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Client */}
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            {client}
          </div>

          {/* Challenge (truncated) */}
          <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{challenge}</p>

          {/* Stats */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            {stats.slice(0, 3).map((stat, idx) => (
              <div key={idx} className="rounded-lg bg-ce-primary-50 p-2 text-center">
                <div className="text-lg font-bold text-ce-primary">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Key Results */}
          <div className="mb-4 space-y-2">
            {results.slice(0, 2).map((result, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-ce-accent-teal" />
                <span className="text-muted-foreground">{result}</span>
              </div>
            ))}
          </div>

          {/* Testimonial Preview */}
          {testimonial && (
            <div className="mb-4 rounded-lg bg-ce-primary-50/50 p-3">
              <Quote className="mb-1 h-4 w-4 text-ce-primary/50" />
              <p className="text-xs italic text-muted-foreground line-clamp-2">
                "{testimonial}"
              </p>
              {useCase.testimonialAuthor && (
                <p className="mt-1 text-xs font-semibold text-ce-primary">
                  — {useCase.testimonialAuthor}, {useCase.testimonialRole}
                </p>
              )}
            </div>
          )}

          {/* CTA */}
          <Link
            href={`/industries/${useCase.industrySlug}#case-${useCase.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-ce-primary transition-all hover:gap-2"
          >
            {isVi ? 'Xem chi tiết' : 'Read Full Case Study'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    );
  }

  // Compact variant
  return (
    <Link
      href={`/industries/${useCase.industrySlug}#case-${useCase.id}`}
      className="group flex gap-4 rounded-xl border bg-white p-4 transition-all hover:border-ce-primary hover:shadow-lg"
    >
      {/* Thumbnail */}
      <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg">
        <Image src={useCase.image} alt={title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-ce-primary/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex-1">
        <span className="mb-1 inline-block text-xs font-semibold text-ce-primary">{tag}</span>
        <h4 className="mb-1 text-sm font-bold text-ce-primary-800 group-hover:text-ce-primary line-clamp-1">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2">{client}</p>

        {/* Mini Stats */}
        <div className="mt-2 flex gap-3">
          {stats.slice(0, 2).map((stat, idx) => (
            <div key={idx} className="text-xs">
              <span className="font-bold text-ce-accent-teal">{stat.value}</span>{' '}
              <span className="text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

interface IndustriesUseCasesProps {
  industrySlug?: string;
  showFeatured?: boolean;
  limit?: number;
  variant?: 'grid' | 'carousel' | 'list';
  className?: string;
}

export function IndustriesUseCases({
  industrySlug,
  showFeatured = true,
  limit = 6,
  variant = 'grid',
  className,
}: IndustriesUseCasesProps) {
  const locale = useLocale();
  const isVi = (locale || '').toLowerCase().startsWith('vi');

  const [currentSlide, setCurrentSlide] = useState(0);

  // Get use cases
  const allCases = industrySlug
    ? getUseCasesByIndustry(industrySlug)
    : showFeatured
      ? getFeaturedUseCases()
      : getFeaturedUseCases();

  const displayCases = allCases.slice(0, limit);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? displayCases.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === displayCases.length - 1 ? 0 : prev + 1));
  };

  if (displayCases.length === 0) {
    return null;
  }

  // Carousel variant
  if (variant === 'carousel') {
    return (
      <section className={cn('py-16 lg:py-24', className)}>
        <div className="ce-container">
          {/* Header */}
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="ce-kicker mb-3 block">
                {isVi ? 'Câu chuyện thành công' : 'Success Stories'}
              </span>
              <h2 className="ce-section-title text-3xl font-bold md:text-4xl">
                {isVi ? 'Dự Án Tiêu Biểu' : 'Featured Case Studies'}
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground">
                {isVi
                  ? 'Khám phá cách chúng tôi giúp khách hàng giải quyết thách thức công nghiệp và đạt được kết quả vượt trội.'
                  : 'Discover how we help clients solve industrial challenges and achieve outstanding results.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                className="border-ce-primary text-ce-primary hover:bg-ce-primary hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="border-ce-primary text-ce-primary hover:bg-ce-primary hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Featured Case - Large */}
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Main Featured */}
            <div className="lg:col-span-8">
              <FeaturedCaseCard useCase={displayCases[currentSlide]} isVi={isVi} />
            </div>

            {/* Side List */}
            <div className="lg:col-span-4">
              <div className="space-y-4">
                {displayCases.slice(0, 4).map((uc, idx) => (
                  <button
                    key={uc.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={cn(
                      'w-full text-left transition-all',
                      currentSlide === idx ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                    )}
                  >
                    <UseCaseCard useCase={uc} isVi={isVi} variant="compact" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Grid variant
  return (
    <section className={cn('bg-ce-primary-50/30 py-16 lg:py-24', className)}>
      <div className="ce-container">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="ce-kicker mb-3 block">
            {isVi ? 'Câu chuyện thành công' : 'Success Stories'}
          </span>
          <h2 className="ce-section-title text-3xl font-bold md:text-4xl">
            {industrySlug
              ? isVi
                ? 'Dự Án Trong Ngành'
                : 'Industry Case Studies'
              : isVi
                ? 'Dự Án Tiêu Biểu'
                : 'Featured Case Studies'}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {isVi
              ? 'Khám phá cách giải pháp của chúng tôi giúp doanh nghiệp tăng hiệu quả, giảm chi phí và đạt được mục tiêu kinh doanh.'
              : 'Explore how our solutions help businesses improve efficiency, reduce costs, and achieve their goals.'}
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayCases.map((useCase) => (
            <UseCaseCard key={useCase.id} useCase={useCase} isVi={isVi} variant="detailed" />
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <Button asChild variant="ce">
            <Link href="/case-studies">
              {isVi ? 'Xem tất cả dự án' : 'View All Case Studies'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// Featured Case Card - Large format
function FeaturedCaseCard({ useCase, isVi }: { useCase: UseCase; isVi: boolean }) {
  const title = isVi ? useCase.titleVi : useCase.titleEn;
  const client = isVi ? useCase.clientVi : useCase.clientEn;
  const tag = isVi ? useCase.industryTagVi : useCase.industryTagEn;
  const challenge = isVi ? useCase.challengeVi : useCase.challengeEn;
  const solution = isVi ? useCase.solutionVi : useCase.solutionEn;
  const results = isVi ? useCase.resultsVi : useCase.resultsEn;
  const stats = isVi ? useCase.statsVi : useCase.statsEn;
  const testimonial = isVi ? useCase.testimonialVi : useCase.testimonialEn;

  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-lg">
      {/* Image Header */}
      <div className="relative h-64 overflow-hidden lg:h-80">
        <Image src={useCase.image} alt={title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ce-primary-900 via-ce-primary-900/60 to-transparent" />

        {/* Content on Image */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-full bg-ce-primary px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
              {tag}
            </span>
            {useCase.featured && (
              <span className="flex items-center gap-1 rounded-full bg-ce-accent-gold px-3 py-1 text-xs font-bold text-white">
                <Star className="h-3 w-3" />
                {isVi ? 'Nổi bật' : 'Featured'}
              </span>
            )}
          </div>
          <h3 className="mb-2 text-2xl font-bold text-white lg:text-3xl">{title}</h3>
          <div className="flex items-center gap-2 text-white/80">
            <Building2 className="h-4 w-4" />
            <span>{client}</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 lg:p-8">
        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-gradient-to-br from-ce-primary-50 to-ce-primary-100/50 p-4 text-center"
            >
              <div className="text-2xl font-bold text-ce-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Challenge & Solution */}
        <div className="mb-6 space-y-4">
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ce-primary">
              <TrendingUp className="h-4 w-4" />
              {isVi ? 'Thách thức' : 'Challenge'}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{challenge}</p>
          </div>
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ce-accent-teal">
              <CheckCircle2 className="h-4 w-4" />
              {isVi ? 'Giải pháp' : 'Solution'}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{solution}</p>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-ce-primary">
            {isVi ? 'Kết quả' : 'Results'}
          </h4>
          <div className="space-y-2">
            {results.slice(0, 3).map((result, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-ce-accent-teal" />
                <span className="text-sm text-muted-foreground">{result}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        {testimonial && (
          <div className="mb-6 rounded-xl bg-ce-primary-900 p-4 text-white">
            <Quote className="mb-2 h-5 w-5 text-ce-accent-teal" />
            <p className="mb-3 text-sm italic leading-relaxed text-white/90">"{testimonial}"</p>
            {useCase.testimonialAuthor && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                  {useCase.testimonialAuthor.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{useCase.testimonialAuthor}</div>
                  <div className="text-xs text-white/60">{useCase.testimonialRole}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <Button asChild variant="ce" className="w-full">
          <Link href={`/industries/${useCase.industrySlug}`}>
            {isVi ? 'Xem chi tiết đầy đủ' : 'Read Full Case Study'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

export default IndustriesUseCases;

