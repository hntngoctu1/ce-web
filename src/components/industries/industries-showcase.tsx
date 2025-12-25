'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
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
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Industry data with real images
const industriesData = [
  {
    id: 'industrial-tapes',
    slug: 'industrial-tapes',
    nameEn: 'Industrial Tapes',
    nameVi: 'Băng Keo Công Nghiệp',
    shortEn: 'High-performance bonding & protection',
    shortVi: 'Kết dính & bảo vệ hiệu suất cao',
    image: '/images/industries_img/Industrial Tapes.png',
    icon: Shield,
    stats: '-40°C ~ +260°C',
    color: 'bg-ce-primary',
  },
  {
    id: 'silicone-rubber',
    slug: 'silicone-rubber',
    nameEn: 'Silicone Rubber',
    nameVi: 'Cao Su Silicone',
    shortEn: 'Premium sealing solutions',
    shortVi: 'Giải pháp làm kín cao cấp',
    image: '/images/industries_img/Virgin Silicone Rubber.png',
    icon: Cog,
    stats: 'FDA/RoHS',
    color: 'bg-ce-accent-teal',
  },
  {
    id: 'lubricants',
    slug: 'lubricants',
    nameEn: 'Lubricants',
    nameVi: 'Chất Bôi Trơn',
    shortEn: 'Machinery maintenance',
    shortVi: 'Bảo trì máy móc',
    image: '/images/industries_img/Lubricants.png',
    icon: Factory,
    stats: '+50% Life',
    color: 'bg-ce-accent-gold',
  },
  {
    id: 'electronic-coatings',
    slug: 'electronic-coatings',
    nameEn: 'Electronic Coatings',
    nameVi: 'Chất Phủ Điện Tử',
    shortEn: 'PCB protection',
    shortVi: 'Bảo vệ mạch PCB',
    image: '/images/industries_img/Electronic Surface Coatings.png',
    icon: Cpu,
    stats: 'IP67+',
    color: 'bg-indigo-500',
  },
  {
    id: 'industrial-adhesives',
    slug: 'industrial-adhesives',
    nameEn: 'Industrial Adhesives',
    nameVi: 'Keo Công Nghiệp',
    shortEn: 'Structural bonding',
    shortVi: 'Kết cấu chịu lực',
    image: '/images/industries_img/Industrial Adhesives.png',
    icon: Zap,
    stats: '45 MPa',
    color: 'bg-ce-accent-coral',
  },
  {
    id: 'welding-equipment',
    slug: 'welding-equipment',
    nameEn: 'Welding Machines',
    nameVi: 'Máy Hàn',
    shortEn: 'MIG, TIG & accessories',
    shortVi: 'MIG, TIG & phụ kiện',
    image: '/images/industries_img/Welding Machines and Accessories.png',
    icon: Wrench,
    stats: '100-500A',
    color: 'bg-rose-500',
  },
];

interface IndustriesShowcaseProps {
  className?: string;
  variant?: 'full' | 'compact';
}

export function IndustriesShowcase({ className, variant = 'full' }: IndustriesShowcaseProps) {
  const locale = useLocale();
  const isVi = (locale || '').toLowerCase().startsWith('vi');

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % industriesData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const handlePrev = () => {
    setIsAutoPlay(false);
    setActiveIndex((prev) => (prev === 0 ? industriesData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setActiveIndex((prev) => (prev + 1) % industriesData.length);
  };

  if (variant === 'compact') {
    return (
      <section className={cn('bg-white py-16', className)}>
        <div className="ce-container">
          <div className="mb-8 text-center">
            <span className="ce-kicker">{isVi ? 'Ngành hàng' : 'Industries'}</span>
            <h2 className="mt-2 text-3xl font-bold text-ce-primary-800">
              {isVi ? 'Giải pháp cho mọi ngành' : 'Solutions for Every Industry'}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {industriesData.slice(0, 6).map((ind) => (
              <Link
                key={ind.id}
                href={`/industries/${ind.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image src={ind.image} alt={isVi ? ind.nameVi : ind.nameEn} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-ce-primary-800 line-clamp-1">
                    {isVi ? ind.nameVi : ind.nameEn}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {isVi ? ind.shortVi : ind.shortEn}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-ce-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('relative overflow-hidden bg-gradient-to-b from-white via-ce-primary-50/50 to-white py-20 lg:py-24', className)}>
      {/* Subtle Background Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-ce-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-ce-accent-teal/5 blur-3xl" />
      </div>

      <div className="ce-container relative z-10">
        {/* Section Header */}
        <div className="mb-12 flex flex-col items-center text-center lg:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ce-primary/20 bg-ce-primary/5 px-4 py-2">
            <Sparkles className="h-4 w-4 text-ce-primary" />
            <span className="text-sm font-semibold text-ce-primary">
              {isVi ? '13 Ngành Hàng Chuyên Biệt' : '13 Specialized Industries'}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-ce-primary-800 md:text-4xl lg:text-5xl">
            {isVi ? 'Giải Pháp Công Nghiệp' : 'Industrial Solutions'}
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {isVi
              ? 'Từ băng keo công nghiệp đến thiết bị tự động hóa, chúng tôi cung cấp giải pháp toàn diện cho mọi ngành sản xuất.'
              : 'From industrial tapes to automation equipment, we provide comprehensive solutions for all manufacturing sectors.'}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Featured Industry Card */}
          <div className="relative">
            <Link
              href={`/industries/${industriesData[activeIndex].slug}`}
              className="group relative block overflow-hidden rounded-2xl bg-white shadow-xl shadow-ce-primary/5 transition-all hover:shadow-2xl hover:shadow-ce-primary/10"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={industriesData[activeIndex].image}
                  alt={isVi ? industriesData[activeIndex].nameVi : industriesData[activeIndex].nameEn}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ce-primary-900/90 via-ce-primary-900/40 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  {/* Index Badge */}
                  <div className="mb-4 flex items-center gap-3">
                    <span className={cn('flex h-10 w-10 items-center justify-center rounded-full text-white', industriesData[activeIndex].color)}>
                      {(() => {
                        const Icon = industriesData[activeIndex].icon;
                        return <Icon className="h-5 w-5" />;
                      })()}
                    </span>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                      {String(activeIndex + 1).padStart(2, '0')} / {industriesData.length}
                    </span>
                    <span className="rounded-full bg-ce-accent-teal px-3 py-1 text-xs font-bold text-white">
                      {industriesData[activeIndex].stats}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl">
                    {isVi ? industriesData[activeIndex].nameVi : industriesData[activeIndex].nameEn}
                  </h3>
                  <p className="mb-4 text-base text-white/80">
                    {isVi ? industriesData[activeIndex].shortVi : industriesData[activeIndex].shortEn}
                  </p>

                  {/* CTA */}
                  <div className="inline-flex">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ce-primary-800 shadow-lg transition-all group-hover:gap-3 group-hover:bg-ce-accent-teal group-hover:text-white">
                      {isVi ? 'Tìm hiểu thêm' : 'Learn more'}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Navigation Arrows */}
            <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                className="h-10 w-10 rounded-full border-2 border-ce-primary/20 bg-white shadow-md hover:border-ce-primary hover:bg-ce-primary hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="h-10 w-10 rounded-full border-2 border-ce-primary/20 bg-white shadow-md hover:border-ce-primary hover:bg-ce-primary hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Industry Cards Grid */}
          <div className="flex flex-col gap-4">
            {/* Grid of 6 cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
              {industriesData.map((industry, index) => (
                <button
                  key={industry.id}
                  onClick={() => {
                    setIsAutoPlay(false);
                    setActiveIndex(index);
                  }}
                  className={cn(
                    'group relative flex flex-col overflow-hidden rounded-xl border-2 bg-white p-3 text-left transition-all hover:shadow-lg',
                    activeIndex === index
                      ? 'border-ce-primary shadow-md shadow-ce-primary/10'
                      : 'border-transparent hover:border-ce-primary/30'
                  )}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-white', industry.color)}>
                      {(() => {
                        const Icon = industry.icon;
                        return <Icon className="h-4 w-4" />;
                      })()}
                    </span>
                    <span className="rounded bg-ce-primary-50 px-2 py-0.5 text-[10px] font-bold text-ce-primary">
                      {industry.stats}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-ce-primary-800 line-clamp-1">
                    {isVi ? industry.nameVi : industry.nameEn}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    {isVi ? industry.shortVi : industry.shortEn}
                  </p>
                  {activeIndex === index && (
                    <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-ce-accent-teal" />
                  )}
                </button>
              ))}
            </div>

            {/* View All Link */}
            <Link
              href="/menu/industrial"
              className="group flex items-center justify-between rounded-xl border-2 border-dashed border-ce-primary/30 bg-ce-primary-50/50 p-4 transition-all hover:border-ce-primary hover:bg-ce-primary-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ce-primary text-white">
                  <Factory className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-ce-primary-800">
                    {isVi ? '+7 ngành hàng khác' : '+7 more industries'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isVi ? 'Xem tất cả danh mục' : 'View all categories'}
                  </div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-ce-primary transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mx-auto mt-12 max-w-md">
          <div className="flex items-center gap-3">
            {industriesData.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlay(false);
                  setActiveIndex(index);
                }}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-all',
                  activeIndex === index ? 'bg-ce-primary' : 'bg-ce-primary/20 hover:bg-ce-primary/40'
                )}
              />
            ))}
          </div>
        </div>

        {/* Brand Footer */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-ce-primary/20 bg-white px-4 py-2 shadow-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-ce-primary text-xs font-bold text-white">
              CE
            </div>
            <span className="text-sm font-medium text-ce-primary-700">Creative Engineering</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {isVi ? 'Đối tác công nghiệp từ 1999' : 'Industrial Partner Since 1999'}
          </span>
        </div>
      </div>
    </section>
  );
}

export default IndustriesShowcase;
