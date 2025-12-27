'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  ArrowRight,
  Search,
  Filter,
  CheckCircle,
  Quote,
  ChevronDown,
  Factory,
  Target,
  Lightbulb,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCases, type UseCase } from '@/data/industry-use-cases';

// Get unique industries from use cases
const industries = Array.from(new Set(useCases.map((uc) => uc.industrySlug)));

export function CaseStudiesClient() {
  const locale = useLocale();
  const isVi = (locale || '').toLowerCase().startsWith('vi');

  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  // Filter use cases
  const filteredCases = useMemo(() => {
    return useCases.filter((uc) => {
      const matchesIndustry = !selectedIndustry || uc.industrySlug === selectedIndustry;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        uc.titleEn.toLowerCase().includes(searchLower) ||
        uc.titleVi.toLowerCase().includes(searchLower) ||
        uc.industryTagEn.toLowerCase().includes(searchLower) ||
        uc.industryTagVi.toLowerCase().includes(searchLower);
      return matchesIndustry && matchesSearch;
    });
  }, [selectedIndustry, searchQuery]);

  // Featured cases (first 3 featured ones)
  const featuredCases = useCases.filter((uc) => uc.featured).slice(0, 3);

  const industryLabels: Record<string, { en: string; vi: string }> = {
    'industrial-tapes': { en: 'Industrial Tapes', vi: 'Băng Keo Công Nghiệp' },
    'silicone-rubber': { en: 'Silicone Rubber', vi: 'Cao Su Silicone' },
    lubricants: { en: 'Lubricants', vi: 'Chất Bôi Trơn' },
    'electronic-coatings': { en: 'Electronic Coatings', vi: 'Chất Phủ Điện Tử' },
    'industrial-adhesives': { en: 'Industrial Adhesives', vi: 'Keo Công Nghiệp' },
    'sandpaper-abrasives': { en: 'Sandpaper & Abrasives', vi: 'Giấy Nhám & Mài' },
    'nukote-coatings': { en: 'Nukote Coatings', vi: 'Chất Phủ Nukote' },
    'welding-equipment': { en: 'Welding Equipment', vi: 'Thiết Bị Hàn' },
    printers: { en: 'Printers', vi: 'Máy In' },
    'automatic-dosing': { en: 'Robotic Dosing', vi: 'Robot Định Lượng' },
    'fluid-transmission': { en: 'Fluid Transmission', vi: 'Truyền Động Chất Lỏng' },
    'heat-conducting': { en: 'Thermal Materials', vi: 'Vật Liệu Dẫn Nhiệt' },
    'metalworking-coatings': { en: 'Metalworking', vi: 'Gia Công Kim Loại' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ce-primary-50/30 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-ce-primary-800 py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                               linear-gradient(to bottom, white 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className="ce-container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
              <Factory className="h-4 w-4" />
              {isVi ? 'Nghiên Cứu Điển Hình' : 'Case Studies'}
            </span>
            <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              {isVi ? 'Câu Chuyện Thành Công' : 'Success Stories'}
            </h1>
            <p className="text-lg text-white/80 md:text-xl">
              {isVi
                ? 'Khám phá cách Creative Engineering đã giúp các doanh nghiệp giải quyết thách thức sản xuất và đạt được kết quả vượt trội.'
                : 'Discover how Creative Engineering has helped businesses overcome manufacturing challenges and achieve outstanding results.'}
            </p>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-4">
            {[
              { value: '39+', labelEn: 'Case Studies', labelVi: 'Dự Án' },
              { value: '13', labelEn: 'Industries', labelVi: 'Ngành Hàng' },
              { value: '25+', labelEn: 'Years Experience', labelVi: 'Năm Kinh Nghiệm' },
              { value: '500+', labelEn: 'Clients', labelVi: 'Khách Hàng' },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm"
              >
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/70">{isVi ? stat.labelVi : stat.labelEn}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cases */}
      <section className="py-16 lg:py-20">
        <div className="ce-container">
          <div className="mb-10 text-center">
            <span className="ce-kicker">{isVi ? 'Nổi Bật' : 'Featured'}</span>
            <h2 className="mt-2 text-3xl font-bold text-ce-primary-800 md:text-4xl">
              {isVi ? 'Dự Án Tiêu Biểu' : 'Featured Projects'}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredCases.map((uc) => (
              <CaseCard key={uc.id} useCase={uc} isVi={isVi} variant="featured" />
            ))}
          </div>
        </div>
      </section>

      {/* All Cases with Filters */}
      <section className="border-t bg-white py-16 lg:py-20">
        <div className="ce-container">
          {/* Filters */}
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-ce-primary-800 md:text-3xl">
                {isVi ? 'Tất Cả Dự Án' : 'All Case Studies'}
              </h2>
              <p className="mt-1 text-muted-foreground">
                {filteredCases.length} {isVi ? 'kết quả' : 'results'}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={isVi ? 'Tìm kiếm...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:w-64"
                />
              </div>

              {/* Industry Filter */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedIndustry === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedIndustry(null)}
                  className={cn(
                    selectedIndustry === null && 'bg-ce-primary hover:bg-ce-primary-600'
                  )}
                >
                  {isVi ? 'Tất cả' : 'All'}
                </Button>
                {industries.slice(0, 5).map((ind) => (
                  <Button
                    key={ind}
                    variant={selectedIndustry === ind ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedIndustry(ind)}
                    className={cn(
                      selectedIndustry === ind && 'bg-ce-primary hover:bg-ce-primary-600'
                    )}
                  >
                    {isVi ? industryLabels[ind]?.vi || ind : industryLabels[ind]?.en || ind}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Case Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCases.map((uc) => (
              <CaseCard
                key={uc.id}
                useCase={uc}
                isVi={isVi}
                variant="grid"
                expanded={expandedCase === uc.id}
                onToggle={() => setExpandedCase(expandedCase === uc.id ? null : uc.id)}
              />
            ))}
          </div>

          {filteredCases.length === 0 && (
            <div className="py-20 text-center">
              <Filter className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold text-ce-primary-800">
                {isVi ? 'Không tìm thấy kết quả' : 'No results found'}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {isVi ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' : 'Try adjusting filters or search terms'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-ce-primary-800 py-16">
        <div className="ce-container text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            {isVi ? 'Bạn Có Thách Thức Tương Tự?' : 'Have a Similar Challenge?'}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
            {isVi
              ? 'Đội ngũ kỹ sư của chúng tôi sẵn sàng hỗ trợ bạn tìm giải pháp tối ưu.'
              : 'Our engineering team is ready to help you find the optimal solution.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-ce-primary-800 hover:bg-ce-primary-50" asChild>
              <Link href="/contact">
                {isVi ? 'Liên Hệ Tư Vấn' : 'Contact Us'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/menu/product">{isVi ? 'Xem Sản Phẩm' : 'Browse Products'}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Case Card Component
function CaseCard({
  useCase,
  isVi,
  variant = 'grid',
  expanded = false,
  onToggle,
}: {
  useCase: UseCase;
  isVi: boolean;
  variant?: 'featured' | 'grid';
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const isFeatured = variant === 'featured';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all',
        isFeatured ? 'border-ce-primary/20' : 'border-border',
        'hover:shadow-lg hover:shadow-ce-primary/5'
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={useCase.image}
          alt={isVi ? useCase.titleVi : useCase.titleEn}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ce-primary-900/80 via-ce-primary-900/30 to-transparent" />

        {/* Industry Badge */}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-ce-accent-teal px-3 py-1 text-xs font-bold text-white">
            {isVi ? useCase.industryTagVi : useCase.industryTagEn}
          </span>
        </div>

        {/* Featured Badge */}
        {useCase.featured && (
          <div className="absolute right-4 top-4">
            <span className="rounded-full bg-ce-accent-gold px-3 py-1 text-xs font-bold text-white">
              {isVi ? 'Nổi bật' : 'Featured'}
            </span>
          </div>
        )}

        {/* Title on Image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold text-white line-clamp-2">
            {isVi ? useCase.titleVi : useCase.titleEn}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Stats */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(isVi ? useCase.statsVi : useCase.statsEn).slice(0, 3).map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-1 rounded-full bg-ce-primary-50 px-3 py-1 text-xs"
            >
              <span className="font-bold text-ce-primary">{stat.value}</span>
              <span className="text-ce-primary-600">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Challenge & Solution Preview */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-ce-accent-coral" />
            <div>
              <div className="text-xs font-semibold uppercase text-ce-accent-coral">
                {isVi ? 'Thách thức' : 'Challenge'}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {isVi ? useCase.challengeVi : useCase.challengeEn}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-ce-accent-teal" />
            <div>
              <div className="text-xs font-semibold uppercase text-ce-accent-teal">
                {isVi ? 'Giải pháp' : 'Solution'}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {isVi ? useCase.solutionVi : useCase.solutionEn}
              </p>
            </div>
          </div>
        </div>

        {/* Expandable Results */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="mt-4 flex w-full items-center justify-between rounded-lg bg-ce-primary-50/50 px-3 py-2 text-sm font-medium text-ce-primary-700 transition-colors hover:bg-ce-primary-50"
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {isVi ? 'Xem kết quả' : 'View Results'}
            </span>
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')}
            />
          </button>
        )}

        {expanded && (
          <div className="mt-4 space-y-3 border-t pt-4">
            <div className="text-xs font-semibold uppercase text-ce-primary-600">
              {isVi ? 'Kết quả đạt được' : 'Key Results'}
            </div>
            <ul className="space-y-2">
              {(isVi ? useCase.resultsVi : useCase.resultsEn).map((result, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-ce-accent-sage" />
                  <span>{result}</span>
                </li>
              ))}
            </ul>

            {useCase.testimonialEn && (
              <div className="mt-4 rounded-lg bg-ce-primary-50 p-4">
                <Quote className="mb-2 h-5 w-5 text-ce-primary/50" />
                <p className="text-sm italic text-ce-primary-700">
                  &ldquo;{isVi ? useCase.testimonialVi : useCase.testimonialEn}&rdquo;
                </p>
                {useCase.testimonialAuthor && (
                  <div className="mt-3 text-xs">
                    <span className="font-semibold text-ce-primary-800">
                      {useCase.testimonialAuthor}
                    </span>
                    {useCase.testimonialRole && (
                      <span className="text-muted-foreground"> - {useCase.testimonialRole}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

