'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  Cog,
  Cpu,
  Wrench,
  Factory,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Industry data with real images from public/images/industries_img
const industriesData = [
  {
    id: 'industrial-tapes',
    slug: 'industrial-tapes',
    nameEn: 'Industrial Tapes',
    nameVi: 'Băng Keo Công Nghiệp',
    shortEn: 'High-performance bonding, masking & protection',
    shortVi: 'Kết dính, che chắn & bảo vệ hiệu suất cao',
    image: '/images/industries_img/Industrial Tapes.png',
    icon: Shield,
    stats: { value: '-40°C ~ +260°C', labelEn: 'Temp Range', labelVi: 'Nhiệt độ' },
    accent: 'from-blue-500/80 to-ce-primary/80',
  },
  {
    id: 'silicone-rubber',
    slug: 'silicone-rubber',
    nameEn: 'Virgin Silicone Rubber',
    nameVi: 'Cao Su Silicone Nguyên Chất',
    shortEn: 'Premium sealing & high-temp applications',
    shortVi: 'Làm kín & ứng dụng chịu nhiệt cao',
    image: '/images/industries_img/Virgin Silicone Rubber.png',
    icon: Cog,
    stats: { value: 'FDA/RoHS', labelEn: 'Certified', labelVi: 'Chứng nhận' },
    accent: 'from-teal-500/80 to-ce-accent-teal/80',
  },
  {
    id: 'lubricants',
    slug: 'lubricants',
    nameEn: 'Lubricants',
    nameVi: 'Chất Bôi Trơn',
    shortEn: 'Machinery maintenance & friction reduction',
    shortVi: 'Bảo trì máy móc & giảm ma sát',
    image: '/images/industries_img/Lubricants.png',
    icon: Factory,
    stats: { value: '+50%', labelEn: 'Equipment Life', labelVi: 'Tuổi thọ TB' },
    accent: 'from-amber-500/80 to-ce-accent-gold/80',
  },
  {
    id: 'metalworking-coatings',
    slug: 'metalworking-coatings',
    nameEn: 'Metalworking & Cleaning',
    nameVi: 'Gia Công Kim Loại & Vệ Sinh',
    shortEn: 'Coatings, coolants & cleaning solutions',
    shortVi: 'Chất phủ, làm mát & vệ sinh',
    image: '/images/industries_img/Coatings – Metalworking and Cleaning.png',
    icon: Wrench,
    stats: { value: '+30%', labelEn: 'Tool Life', labelVi: 'Tuổi thọ DC' },
    accent: 'from-slate-500/80 to-ce-accent-slate/80',
  },
  {
    id: 'electronic-coatings',
    slug: 'electronic-coatings',
    nameEn: 'Electronic Coatings',
    nameVi: 'Chất Phủ Điện Tử',
    shortEn: 'PCB protection & encapsulation',
    shortVi: 'Bảo vệ PCB & bọc kín',
    image: '/images/industries_img/Electronic Surface Coatings.png',
    icon: Cpu,
    stats: { value: 'IP67+', labelEn: 'Protection', labelVi: 'Bảo vệ' },
    accent: 'from-indigo-500/80 to-ce-primary/80',
  },
  {
    id: 'sandpaper-abrasives',
    slug: 'sandpaper-abrasives',
    nameEn: 'Sandpaper & Abrasives',
    nameVi: 'Giấy Nhám & Mài',
    shortEn: 'Surface preparation & polishing',
    shortVi: 'Chuẩn bị bề mặt & đánh bóng',
    image: '/images/industries_img/Sandpaper and Abrasives, Polishing.png',
    icon: Zap,
    stats: { value: 'P40-P5000', labelEn: 'Grit Range', labelVi: 'Độ nhám' },
    accent: 'from-orange-500/80 to-ce-accent-coral/80',
  },
  {
    id: 'nukote-coatings',
    slug: 'nukote-coatings',
    nameEn: 'Nukote Coatings',
    nameVi: 'Chất Phủ Nukote',
    shortEn: 'Polyurea extreme protection',
    shortVi: 'Polyurea bảo vệ tối đa',
    image: '/images/industries_img/Nukote – Protective Coatings.png',
    icon: Shield,
    stats: { value: '20+ yrs', labelEn: 'Service Life', labelVi: 'Tuổi thọ' },
    accent: 'from-emerald-500/80 to-ce-accent-sage/80',
  },
  {
    id: 'industrial-adhesives',
    slug: 'industrial-adhesives',
    nameEn: 'Industrial Adhesives',
    nameVi: 'Keo Dán Công Nghiệp',
    shortEn: 'Structural & assembly bonding',
    shortVi: 'Kết cấu & lắp ráp',
    image: '/images/industries_img/Industrial Adhesives.png',
    icon: Cog,
    stats: { value: '45 MPa', labelEn: 'Shear Strength', labelVi: 'Độ bền cắt' },
    accent: 'from-purple-500/80 to-ce-primary-600/80',
  },
  {
    id: 'welding-equipment',
    slug: 'welding-equipment',
    nameEn: 'Welding Machines',
    nameVi: 'Máy Hàn',
    shortEn: 'MIG, TIG & accessories',
    shortVi: 'MIG, TIG & phụ kiện',
    image: '/images/industries_img/Welding Machines and Accessories.png',
    icon: Zap,
    stats: { value: '100-500A', labelEn: 'Power Range', labelVi: 'Công suất' },
    accent: 'from-red-500/80 to-ce-accent-coral/80',
  },
  {
    id: 'printers',
    slug: 'printers',
    nameEn: 'Industrial Printers',
    nameVi: 'Máy In Công Nghiệp',
    shortEn: 'Inkjet, label & marking',
    shortVi: 'Phun mực, nhãn & đánh dấu',
    image: '/images/industries_img/Printers.png',
    icon: Cpu,
    stats: { value: '300m/min', labelEn: 'Print Speed', labelVi: 'Tốc độ' },
    accent: 'from-cyan-500/80 to-ce-accent-teal/80',
  },
  {
    id: 'automatic-dosing',
    slug: 'automatic-dosing',
    nameEn: 'Robotic Dosing',
    nameVi: 'Định Lượng Robot',
    shortEn: 'Precision dispensing automation',
    shortVi: 'Tự động phân phối chính xác',
    image: '/images/industries_img/Automatic Robotic Dosing Equipment.png',
    icon: Factory,
    stats: { value: '±1%', labelEn: 'Accuracy', labelVi: 'Độ chính xác' },
    accent: 'from-violet-500/80 to-ce-primary/80',
  },
  {
    id: 'fluid-transmission',
    slug: 'fluid-transmission',
    nameEn: 'Fluid Transmission',
    nameVi: 'Truyền Động Chất Lỏng',
    shortEn: 'Hydraulic & pneumatic systems',
    shortVi: 'Hệ thống thủy lực & khí nén',
    image: '/images/industries_img/Fluid Transmission and Shredding.png',
    icon: Cog,
    stats: { value: '400 bar', labelEn: 'Max Pressure', labelVi: 'Áp suất' },
    accent: 'from-sky-500/80 to-ce-accent-slate/80',
  },
  {
    id: 'heat-conducting',
    slug: 'heat-conducting',
    nameEn: 'Thermal Materials',
    nameVi: 'Vật Liệu Dẫn Nhiệt',
    shortEn: 'Heat dissipation solutions',
    shortVi: 'Giải pháp tản nhiệt',
    image: '/images/industries_img/Heat-Conducting Materials.png',
    icon: Cpu,
    stats: { value: '14 W/mK', labelEn: 'Conductivity', labelVi: 'Dẫn nhiệt' },
    accent: 'from-rose-500/80 to-ce-accent-coral/80',
  },
];

interface IndustriesShowcaseProps {
  className?: string;
  variant?: 'full' | 'compact';
}

export function IndustriesShowcase({ className, variant = 'full' }: IndustriesShowcaseProps) {
  const locale = useLocale();
  const tHome = useTranslations('home');
  const isVi = (locale || '').toLowerCase().startsWith('vi');

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % industriesData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const activeIndustry = industriesData[activeIndex];
  const Icon = activeIndustry.icon;

  const handlePrev = () => {
    setIsAutoPlay(false);
    setActiveIndex((prev) => (prev === 0 ? industriesData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setActiveIndex((prev) => (prev + 1) % industriesData.length);
  };

  const handleThumbnailClick = (index: number) => {
    setIsAutoPlay(false);
    setActiveIndex(index);
  };

  // Scroll thumbnails to keep active in view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeThumb = container.children[activeIndex] as HTMLElement;
      if (activeThumb) {
        const containerRect = container.getBoundingClientRect();
        const thumbRect = activeThumb.getBoundingClientRect();
        const scrollLeft =
          activeThumb.offsetLeft - containerRect.width / 2 + thumbRect.width / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  if (variant === 'compact') {
    return (
      <section className={cn('relative overflow-hidden bg-white py-16 lg:py-20', className)}>
        <div className="ce-container">
          {/* Header */}
          <div className="mb-10 text-center">
            <span className="ce-kicker mb-3 block">
              {isVi ? 'Ngành hàng' : 'Industries'}
            </span>
            <h2 className="text-3xl font-bold text-ce-primary-800 md:text-4xl">
              {isVi ? 'Giải pháp cho mọi ngành' : 'Solutions for Every Industry'}
            </h2>
          </div>

          {/* Compact Grid */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {industriesData.slice(0, 8).map((industry) => (
              <Link
                key={industry.id}
                href={`/industries/${industry.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-ce-primary/10"
              >
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={industry.image}
                    alt={isVi ? industry.nameVi : industry.nameEn}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-t opacity-70',
                      industry.accent
                    )}
                  />
                  <div className="absolute bottom-2 left-2">
                    <industry.icon className="h-5 w-5 text-white/90" />
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <h3 className="mb-1 text-sm font-bold text-ce-primary-800 line-clamp-1">
                    {isVi ? industry.nameVi : industry.nameEn}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {isVi ? industry.shortVi : industry.shortEn}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* View All */}
          <div className="mt-8 text-center">
            <Button asChild variant="ce-outline">
              <Link href="/menu/industrial">
                {isVi ? 'Xem tất cả ngành hàng' : 'View all industries'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-ce-primary-900 via-ce-primary-800 to-ce-primary-900 py-20 lg:py-28',
        className
      )}
    >
      {/* Industrial Pattern Background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, white 1px, transparent 1px),
              linear-gradient(to bottom, white 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Radial glow */}
        <div className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-ce-accent-teal/10 blur-[120px]" />
        <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-ce-primary-400/10 blur-[100px]" />
      </div>

      <div className="ce-container relative z-10">
        {/* Section Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 lg:mb-16 lg:flex-row lg:items-end">
          <div>
            <span className="mb-3 inline-block rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm">
              {isVi ? '13 Ngành hàng Chuyên biệt' : '13 Specialized Industries'}
            </span>
            <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              {isVi ? 'Giải Pháp Công Nghiệp' : 'Industrial Solutions'}
            </h2>
            <p className="mt-3 max-w-xl text-lg text-white/60">
              {isVi
                ? 'Từ băng keo công nghiệp đến robot định lượng tự động, chúng tôi cung cấp giải pháp toàn diện cho mọi ngành sản xuất.'
                : 'From industrial tapes to robotic dispensing, we provide comprehensive solutions for all manufacturing sectors.'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Brand Badge */}
            <div className="mr-4 hidden items-center gap-3 rounded-full border border-white/20 bg-white/5 px-4 py-2 backdrop-blur-sm lg:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <span className="text-sm font-bold text-white">CE</span>
              </div>
              <span className="text-sm font-medium text-white/80">Creative Engineering</span>
            </div>

            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="border-2 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-ce-primary-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="border-2 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-ce-primary-800"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Showcase - Hero Card + Thumbnails */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Featured Industry - Large Card */}
          <div className="lg:col-span-7">
            <Link
              href={`/industries/${activeIndustry.slug}`}
              className="group relative block overflow-hidden rounded-2xl"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] lg:aspect-[16/10]">
                <Image
                  src={activeIndustry.image}
                  alt={isVi ? activeIndustry.nameVi : activeIndustry.nameEn}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />

                {/* Gradient Overlay */}
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-tr opacity-80 transition-opacity duration-500 group-hover:opacity-70',
                    activeIndustry.accent
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  {/* Icon Badge */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-full bg-white/20 p-2.5 backdrop-blur-sm">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                      {String(activeIndex + 1).padStart(2, '0')}/{industriesData.length}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                    {isVi ? activeIndustry.nameVi : activeIndustry.nameEn}
                  </h3>
                  <p className="mb-4 max-w-md text-base text-white/80 lg:text-lg">
                    {isVi ? activeIndustry.shortVi : activeIndustry.shortEn}
                  </p>

                  {/* Stats + CTA */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="rounded-lg bg-white/15 px-4 py-2 backdrop-blur-sm">
                      <div className="text-lg font-bold text-white">
                        {activeIndustry.stats.value}
                      </div>
                      <div className="text-xs text-white/70">
                        {isVi
                          ? activeIndustry.stats.labelVi
                          : activeIndustry.stats.labelEn}
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-ce-primary-800 shadow-lg transition-all group-hover:gap-3 group-hover:bg-ce-accent-teal group-hover:text-white">
                      {isVi ? 'Khám phá ngay' : 'Explore now'}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Thumbnails Grid */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-2 lg:gap-4">
              {industriesData.slice(0, 6).map((industry, index) => (
                <button
                  key={industry.id}
                  onClick={() => handleThumbnailClick(index)}
                  className={cn(
                    'group relative aspect-square overflow-hidden rounded-xl transition-all duration-300',
                    activeIndex === index
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-ce-primary-900'
                      : 'opacity-70 hover:opacity-100'
                  )}
                >
                  <Image
                    src={industry.image}
                    alt={isVi ? industry.nameVi : industry.nameEn}
                    fill
                    className="object-cover"
                  />
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-tr opacity-60 transition-opacity group-hover:opacity-40',
                      industry.accent
                    )}
                  />
                  <div className="absolute inset-0 flex items-end p-2 lg:p-3">
                    <span className="line-clamp-2 text-left text-xs font-semibold text-white lg:text-sm">
                      {isVi ? industry.nameVi : industry.nameEn}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* View More */}
            <div className="mt-4 lg:mt-6">
              <Link
                href="/menu/industrial"
                className="group flex items-center justify-between rounded-xl border-2 border-ce-accent-teal/50 bg-ce-accent-teal/10 p-4 backdrop-blur-sm transition-all hover:border-ce-accent-teal hover:bg-ce-accent-teal/20"
              >
                <div>
                  <div className="text-sm font-bold text-white">
                    {isVi ? '+7 ngành hàng khác' : '+7 more industries'}
                  </div>
                  <div className="text-xs text-ce-accent-teal">
                    {isVi ? 'Xem tất cả danh mục' : 'View all categories'}
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ce-accent-teal text-white transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Thumbnails Carousel */}
        <div className="relative mt-8 lg:mt-12">
          <div
            ref={scrollContainerRef}
            className="scrollbar-hide flex gap-3 overflow-x-auto pb-2"
          >
            {industriesData.map((industry, index) => (
              <button
                key={industry.id}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  'group relative flex-shrink-0 overflow-hidden rounded-lg transition-all duration-300',
                  activeIndex === index
                    ? 'ring-2 ring-ce-accent-teal ring-offset-2 ring-offset-ce-primary-900'
                    : 'opacity-60 hover:opacity-100'
                )}
              >
                <div className="relative h-16 w-24 lg:h-20 lg:w-32">
                  <Image
                    src={industry.image}
                    alt={isVi ? industry.nameVi : industry.nameEn}
                    fill
                    className="object-cover"
                  />
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-tr opacity-50',
                      industry.accent
                    )}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 flex items-center gap-2">
            <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-ce-accent-teal transition-all duration-500"
                style={{
                  width: `${((activeIndex + 1) / industriesData.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs font-medium text-white/60">
              {String(activeIndex + 1).padStart(2, '0')}/{industriesData.length}
            </span>
          </div>
        </div>
      </div>

      {/* Custom scrollbar hide style */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

export default IndustriesShowcase;

