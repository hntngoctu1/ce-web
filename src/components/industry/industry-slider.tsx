'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getIndustryImageFallback } from '@/lib/placeholders';
import { useLocale, useTranslations } from 'next-intl';

interface Industry {
  id: string;
  slug: string;
  nameEn: string;
  nameVi: string;
  descriptionEn: string | null;
  descriptionVi: string | null;
  imageUrl: string | null;
}

interface IndustrySliderProps {
  industries: Industry[];
}

// Fallback mock industries if database is unavailable
const mockIndustries: Industry[] = [
  {
    id: '1',
    slug: 'electricity-electronics',
    nameEn: 'Electricity & Electronics',
    nameVi: 'Điện & Điện tử',
    descriptionEn:
      'Advanced adhesive and coating solutions for electronics manufacturing, circuit boards, and electrical components',
    descriptionVi:
      'Giải pháp keo dán và phủ tiên tiến cho sản xuất điện tử, bảng mạch và linh kiện điện',
    imageUrl: null,
  },
  {
    id: '2',
    slug: 'automotive-transportation',
    nameEn: 'Automotive & Transportation',
    nameVi: 'Ô tô & Vận tải',
    descriptionEn:
      'High-performance bonding and sealing solutions for automotive assembly and transportation industry',
    descriptionVi: 'Giải pháp kết dính và trám bịt hiệu suất cao cho lắp ráp ô tô và ngành vận tải',
    imageUrl: null,
  },
  {
    id: '3',
    slug: 'printing-packaging',
    nameEn: 'Printing & Packaging',
    nameVi: 'In ấn & Đóng gói',
    descriptionEn:
      'Specialized tapes and adhesives for printing processes and packaging applications',
    descriptionVi: 'Băng keo và keo dán chuyên dụng cho quy trình in ấn và ứng dụng đóng gói',
    imageUrl: null,
  },
  {
    id: '4',
    slug: 'automation-measurement',
    nameEn: 'Automation & Measurement',
    nameVi: 'Tự động hóa & Đo lường',
    descriptionEn:
      'Precision bonding solutions for automation equipment and measurement instruments',
    descriptionVi: 'Giải pháp kết dính chính xác cho thiết bị tự động hóa và dụng cụ đo lường',
    imageUrl: null,
  },
  {
    id: '5',
    slug: 'waterproofing-coating',
    nameEn: 'Waterproofing & Coating',
    nameVi: 'Chống thấm & Phủ',
    descriptionEn:
      'Professional waterproofing systems and protective coatings for various surfaces',
    descriptionVi: 'Hệ thống chống thấm chuyên nghiệp và lớp phủ bảo vệ cho nhiều bề mặt',
    imageUrl: null,
  },
  {
    id: '6',
    slug: 'furniture-wood',
    nameEn: 'Furniture & Wood',
    nameVi: 'Nội thất & Gỗ',
    descriptionEn: 'Wood bonding adhesives and finishing solutions for furniture manufacturing',
    descriptionVi: 'Keo dán gỗ và giải pháp hoàn thiện cho sản xuất nội thất',
    imageUrl: null,
  },
  {
    id: '7',
    slug: 'food-pharmaceuticals',
    nameEn: 'Food & Pharmaceuticals',
    nameVi: 'Thực phẩm & Dược phẩm',
    descriptionEn:
      'Food-safe adhesives and packaging solutions for food and pharmaceutical industries',
    descriptionVi:
      'Keo dán an toàn thực phẩm và giải pháp đóng gói cho ngành thực phẩm và dược phẩm',
    imageUrl: null,
  },
];

export function IndustrySlider({ industries }: IndustrySliderProps) {
  const locale = useLocale();
  const tIndustrial = useTranslations('industrial');
  const isVi = (locale || '').toLowerCase().startsWith('vi');
  const displayIndustries = industries.length > 0 ? industries : mockIndustries;
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayIndustries.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === displayIndustries.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentIndustry = displayIndustries[currentIndex];
  const name = isVi ? currentIndustry.nameVi : currentIndustry.nameEn;
  const description = isVi ? currentIndustry.descriptionVi : currentIndustry.descriptionEn;

  const displayImage =
    currentIndustry.imageUrl && currentIndustry.imageUrl.startsWith('/')
      ? currentIndustry.imageUrl
      : getIndustryImageFallback(currentIndustry.slug);

  return (
    <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden bg-ce-gradient-light">
      {/* Background Pattern */}
      <div className="ce-hero-pattern absolute inset-0 opacity-10" />

      <div className="relative z-10 flex min-h-[calc(100vh-6rem)] items-center">
        <div className="ce-container">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div className="text-ce-primary-900">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-ce-primary">
                {tIndustrial('kicker')}
              </p>

              <h1
                className="mb-6 animate-fade-up text-4xl font-heavy leading-tight md:text-5xl lg:text-6xl"
                key={currentIndex}
              >
                {name}
              </h1>

              {description && (
                <p className="animation-delay-200 mb-8 max-w-lg animate-fade-up text-lg leading-relaxed text-muted-foreground">
                  {description}
                </p>
              )}

              <Button
                variant="outline"
                size="lg"
                className="animation-delay-400 animate-fade-up border-ce-primary text-ce-primary hover:bg-ce-primary hover:text-white"
                asChild
              >
                <Link href="/menu/product">{tIndustrial('ctaViewProducts')}</Link>
              </Button>
            </div>

            {/* Right Image/Visual */}
            <div className="flex items-center justify-center">
              <div
                className="relative h-80 w-full max-w-xl animate-fade-up overflow-hidden rounded-2xl border bg-white/40 shadow-sm backdrop-blur-sm lg:h-[420px]"
                key={`img-${currentIndex}`}
              >
                <Image
                  src={displayImage}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 560px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/70 via-white/30 to-transparent" />

                {/* Decorative circles */}
                <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full border border-ce-primary/25" />
                <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full border border-ce-primary/20" />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between">
            {/* Dots */}
            <div className="flex gap-2">
              {displayIndustries.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                className="border-white/40 text-white hover:border-white hover:bg-white hover:text-ce-primary"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                className="border-white/40 text-white hover:border-white hover:bg-white hover:text-ce-primary"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Slide Counter */}
          <div className="mt-4 text-sm text-ce-neutral-60">
            <span className="text-white">{String(currentIndex + 1).padStart(2, '0')}</span>
            <span className="mx-2">/</span>
            <span>{String(displayIndustries.length).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
