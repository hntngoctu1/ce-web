'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getGroupImageFallback } from '@/lib/placeholders';
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

// Updated fallback with 13 industry categories
const mockIndustries: Industry[] = [
  {
    id: '1',
    slug: 'industrial-tapes',
    nameEn: 'Industrial Tapes',
    nameVi: 'Băng Keo Công Nghiệp',
    descriptionEn:
      'High-performance industrial tapes for bonding, masking, insulation, and surface protection.',
    descriptionVi:
      'Băng keo công nghiệp hiệu suất cao cho kết dính, che chắn, cách điện và bảo vệ bề mặt.',
    imageUrl: null,
  },
  {
    id: '2',
    slug: 'silicone-rubber',
    nameEn: 'Virgin Silicone Rubber',
    nameVi: 'Cao Su Silicone Nguyên Chất',
    descriptionEn:
      'Premium quality virgin silicone rubber materials for sealing and high-temperature applications.',
    descriptionVi:
      'Vật liệu cao su silicone nguyên chất cao cấp cho các ứng dụng làm kín và chịu nhiệt cao.',
    imageUrl: null,
  },
  {
    id: '3',
    slug: 'lubricants',
    nameEn: 'Lubricants',
    nameVi: 'Chất Bôi Trơn',
    descriptionEn:
      'Industrial lubricants and greases for machinery maintenance and friction reduction.',
    descriptionVi: 'Chất bôi trơn và mỡ công nghiệp cho bảo trì máy móc và giảm ma sát.',
    imageUrl: null,
  },
  {
    id: '4',
    slug: 'metalworking-coatings',
    nameEn: 'Coatings – Metalworking & Cleaning',
    nameVi: 'Chất Phủ – Gia Công Kim Loại và Vệ Sinh',
    descriptionEn:
      'Specialized coatings, coolants, and cleaning solutions for metalworking processes.',
    descriptionVi:
      'Chất phủ, dung dịch làm mát và vệ sinh chuyên dụng cho quy trình gia công kim loại.',
    imageUrl: null,
  },
  {
    id: '5',
    slug: 'electronic-coatings',
    nameEn: 'Electronic Surface Coatings',
    nameVi: 'Chất Phủ Bề Mặt Điện Tử',
    descriptionEn: 'Conformal coatings and encapsulants for protecting electronic assemblies.',
    descriptionVi: 'Chất phủ bảo vệ và chất bọc bảo vệ các cụm lắp ráp điện tử.',
    imageUrl: null,
  },
  {
    id: '6',
    slug: 'sandpaper-abrasives',
    nameEn: 'Sandpaper & Abrasives, Polishing',
    nameVi: 'Giấy Nhám và Vật Liệu Mài, Đánh Bóng',
    descriptionEn:
      'Complete range of abrasive products for surface preparation, finishing, and polishing.',
    descriptionVi: 'Dòng sản phẩm mài mòn đầy đủ cho chuẩn bị bề mặt, hoàn thiện và đánh bóng.',
    imageUrl: null,
  },
  {
    id: '7',
    slug: 'nukote-coatings',
    nameEn: 'Nukote – Protective Coatings',
    nameVi: 'Nukote – Chất Phủ Bảo Vệ',
    descriptionEn:
      'Nukote polyurea and hybrid coatings for extreme protection against abrasion and corrosion.',
    descriptionVi: 'Chất phủ polyurea và hybrid Nukote để bảo vệ tối đa chống mài mòn và ăn mòn.',
    imageUrl: null,
  },
  {
    id: '8',
    slug: 'industrial-adhesives',
    nameEn: 'Industrial Adhesives',
    nameVi: 'Keo Dán Công Nghiệp',
    descriptionEn: 'High-performance structural and assembly adhesives for various materials.',
    descriptionVi: 'Keo kết cấu và lắp ráp hiệu suất cao cho các vật liệu khác nhau.',
    imageUrl: null,
  },
  {
    id: '9',
    slug: 'welding-equipment',
    nameEn: 'Welding Machines & Accessories',
    nameVi: 'Máy Hàn và Phụ Kiện',
    descriptionEn:
      'Professional welding equipment including MIG, TIG, and spot welders plus consumables.',
    descriptionVi:
      'Thiết bị hàn chuyên nghiệp bao gồm máy hàn MIG, TIG và hàn điểm cùng vật tư tiêu hao.',
    imageUrl: null,
  },
  {
    id: '10',
    slug: 'printers',
    nameEn: 'Printers',
    nameVi: 'Máy In',
    descriptionEn: 'Industrial printing solutions including inkjet coders and label printers.',
    descriptionVi: 'Giải pháp in công nghiệp bao gồm máy in phun mã và máy in nhãn.',
    imageUrl: null,
  },
  {
    id: '11',
    slug: 'automatic-dosing',
    nameEn: 'Automatic Robotic Dosing Equipment',
    nameVi: 'Thiết Bị Định Lượng Tự Động Robot',
    descriptionEn:
      'Precision dispensing robots and automated dosing systems for adhesives and sealants.',
    descriptionVi:
      'Robot phân phối chính xác và hệ thống định lượng tự động cho keo dán và chất bịt kín.',
    imageUrl: null,
  },
  {
    id: '12',
    slug: 'fluid-transmission',
    nameEn: 'Fluid Transmission & Shredding',
    nameVi: 'Truyền Động Chất Lỏng và Nghiền',
    descriptionEn:
      'Hydraulic and pneumatic components, hoses, fittings, and industrial shredding equipment.',
    descriptionVi: 'Linh kiện thủy lực và khí nén, ống, phụ kiện và thiết bị nghiền công nghiệp.',
    imageUrl: null,
  },
  {
    id: '13',
    slug: 'heat-conducting',
    nameEn: 'Heat-Conducting Material',
    nameVi: 'Vật Liệu Dẫn Nhiệt',
    descriptionEn:
      'Thermal interface materials including pads, pastes, and gap fillers for heat dissipation.',
    descriptionVi: 'Vật liệu giao diện nhiệt bao gồm miếng đệm, keo tản nhiệt và chất lấp khe.',
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
      : getGroupImageFallback(currentIndustry.slug);

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

              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="animation-delay-400 animate-fade-up border-ce-primary text-ce-primary hover:bg-ce-primary hover:text-white"
                  asChild
                >
                  <Link href="/menu/product">{tIndustrial('ctaViewProducts')}</Link>
                </Button>
                <Button
                  size="lg"
                  className="animation-delay-400 animate-fade-up bg-ce-primary text-white hover:bg-ce-primary-600"
                  asChild
                >
                  <Link href={`/industries/${currentIndustry.slug}`}>
                    {isVi ? 'Xem chi tiết' : 'View details'}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Image/Visual */}
            <div className="flex items-center justify-center">
              <div
                className="relative h-80 w-full max-w-xl animate-fade-up overflow-hidden rounded-2xl border bg-white/40 shadow-sm backdrop-blur-sm lg:h-[420px]"
                key={`img-${currentIndex}`}
              >
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 560px"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ce-primary/10 to-ce-primary/5">
                    <Package className="h-24 w-24 text-ce-primary/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/70 via-white/30 to-transparent" />

                {/* Decorative circles */}
                <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full border border-ce-primary/25" />
                <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full border border-ce-primary/20" />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between">
            {/* Dots - show first 6 + counter for the rest */}
            <div className="flex items-center gap-2">
              {displayIndustries.slice(0, 6).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    index === currentIndex
                      ? 'w-8 bg-ce-primary'
                      : 'w-2 bg-ce-primary/30 hover:bg-ce-primary/50'
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
              {displayIndustries.length > 6 && (
                <span className="ml-2 text-sm text-ce-primary/60">
                  +{displayIndustries.length - 6} {isVi ? 'danh mục khác' : 'more'}
                </span>
              )}
            </div>

            {/* Arrows */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                className="border-ce-primary/40 text-ce-primary hover:border-ce-primary hover:bg-ce-primary hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                className="border-ce-primary/40 text-ce-primary hover:border-ce-primary hover:bg-ce-primary hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Slide Counter */}
          <div className="mt-4 text-sm text-ce-primary/60">
            <span className="font-semibold text-ce-primary">
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
            <span className="mx-2">/</span>
            <span>{String(displayIndustries.length).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
