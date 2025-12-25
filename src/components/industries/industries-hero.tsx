'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowRight,
  ChevronDown,
  Factory,
  Cog,
  Shield,
  Cpu,
  Wrench,
  Zap,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Industry data with comprehensive info
const industriesHeroData = [
  {
    id: 'industrial-tapes',
    slug: 'industrial-tapes',
    nameEn: 'Industrial Tapes',
    nameVi: 'Băng Keo Công Nghiệp',
    taglineEn: 'High-Performance Bonding Solutions',
    taglineVi: 'Giải Pháp Kết Dính Hiệu Suất Cao',
    descEn:
      'Premium industrial tapes for bonding, masking, insulation, and surface protection across all manufacturing sectors.',
    descVi:
      'Băng keo công nghiệp cao cấp cho kết dính, che chắn, cách điện và bảo vệ bề mặt trong tất cả các ngành sản xuất.',
    image: '/images/industries_img/Industrial Tapes.png',
    icon: Shield,
    color: '#5BA3A0',
    stats: [
      { value: '-40°C ~ +260°C', labelEn: 'Temp Range', labelVi: 'Nhiệt độ' },
      { value: '25N/cm', labelEn: 'Adhesion', labelVi: 'Bám dính' },
      { value: '15+', labelEn: 'Brands', labelVi: 'Thương hiệu' },
    ],
  },
  {
    id: 'automatic-dosing',
    slug: 'automatic-dosing',
    nameEn: 'Robotic Dosing',
    nameVi: 'Định Lượng Robot',
    taglineEn: 'Precision Automation Technology',
    taglineVi: 'Công Nghệ Tự Động Hóa Chính Xác',
    descEn:
      'State-of-the-art dispensing robots and automated dosing systems for adhesives, sealants, and fluid materials.',
    descVi:
      'Robot phân phối hiện đại và hệ thống định lượng tự động cho keo dán, chất bịt kín và vật liệu lỏng.',
    image: '/images/industries_img/Automatic Robotic Dosing Equipment.png',
    icon: Factory,
    color: '#676E9F',
    stats: [
      { value: '±1%', labelEn: 'Accuracy', labelVi: 'Độ chính xác' },
      { value: '±0.5%', labelEn: 'Repeatability', labelVi: 'Độ lặp lại' },
      { value: '<2s', labelEn: 'Cycle Time', labelVi: 'Thời gian' },
    ],
  },
  {
    id: 'electronic-coatings',
    slug: 'electronic-coatings',
    nameEn: 'Electronic Coatings',
    nameVi: 'Chất Phủ Điện Tử',
    taglineEn: 'Advanced PCB Protection',
    taglineVi: 'Bảo Vệ PCB Tiên Tiến',
    descEn:
      'Conformal coatings, potting compounds, and encapsulants for protecting electronic assemblies from harsh environments.',
    descVi:
      'Chất phủ bảo vệ, hợp chất đổ khuôn và chất bọc để bảo vệ các cụm lắp ráp điện tử khỏi môi trường khắc nghiệt.',
    image: '/images/industries_img/Electronic Surface Coatings.png',
    icon: Cpu,
    color: '#E07B67',
    stats: [
      { value: 'IP67+', labelEn: 'Protection', labelVi: 'Bảo vệ' },
      { value: '-55°C ~ +200°C', labelEn: 'Operating Temp', labelVi: 'Nhiệt độ HĐ' },
      { value: '+40%', labelEn: 'Reliability', labelVi: 'Độ tin cậy' },
    ],
  },
  {
    id: 'welding-equipment',
    slug: 'welding-equipment',
    nameEn: 'Welding Systems',
    nameVi: 'Hệ Thống Hàn',
    taglineEn: 'Professional Grade Welding',
    taglineVi: 'Hàn Chuyên Nghiệp',
    descEn:
      'Complete welding solutions including MIG, TIG, and spot welders, plus consumables and safety accessories.',
    descVi:
      'Giải pháp hàn hoàn chỉnh bao gồm máy hàn MIG, TIG và hàn điểm, cùng vật tư tiêu hao và phụ kiện an toàn.',
    image: '/images/industries_img/Welding Machines and Accessories.png',
    icon: Zap,
    color: '#D4A84B',
    stats: [
      { value: '100-500A', labelEn: 'Power Range', labelVi: 'Công suất' },
      { value: '60%', labelEn: 'Duty Cycle', labelVi: 'Chu kỳ' },
      { value: 'MIG/TIG/Stick', labelEn: 'Processes', labelVi: 'Quy trình' },
    ],
  },
];

interface IndustriesHeroProps {
  className?: string;
}

export function IndustriesHero({ className }: IndustriesHeroProps) {
  const locale = useLocale();
  const tIndustrial = useTranslations('industrial');
  const isVi = (locale || '').toLowerCase().startsWith('vi');

  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeIndustry = industriesHeroData[activeIndex];
  const Icon = activeIndustry.icon;

  // Auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % industriesHeroData.length);
        setIsTransitioning(false);
      }, 300);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectIndustry = useCallback((index: number) => {
    if (index === activeIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 300);
  }, [activeIndex]);

  const scrollToContent = () => {
    const element = document.getElementById('industries-grid');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className={cn(
        'relative min-h-[calc(100vh-4rem)] overflow-hidden bg-ce-primary-900',
        className
      )}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={activeIndustry.image}
          alt=""
          fill
          className={cn(
            'object-cover transition-all duration-700',
            isTransitioning ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
          )}
          priority
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-ce-primary-900/95 via-ce-primary-900/80 to-ce-primary-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ce-primary-900 via-transparent to-ce-primary-900/30" />

        {/* Animated Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, white 1px, transparent 1px),
              linear-gradient(to bottom, white 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center">
        <div className="ce-container py-12 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Content */}
            <div
              className={cn(
                'transition-all duration-500',
                isTransitioning
                  ? '-translate-x-4 opacity-0'
                  : 'translate-x-0 opacity-100'
              )}
            >
              {/* Kicker */}
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="rounded-full p-2.5"
                  style={{ backgroundColor: `${activeIndustry.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: activeIndustry.color }} />
                </div>
                <span
                  className="text-xs font-bold uppercase tracking-[0.2em]"
                  style={{ color: activeIndustry.color }}
                >
                  {isVi ? activeIndustry.taglineVi : activeIndustry.taglineEn}
                </span>
              </div>

              {/* Title */}
              <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                {isVi ? activeIndustry.nameVi : activeIndustry.nameEn}
              </h1>

              {/* Description */}
              <p className="mb-8 max-w-lg text-lg leading-relaxed text-white/70 md:text-xl">
                {isVi ? activeIndustry.descVi : activeIndustry.descEn}
              </p>

              {/* Stats */}
              <div className="mb-8 flex flex-wrap gap-4">
                {activeIndustry.stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm"
                  >
                    <div
                      className="text-lg font-bold"
                      style={{ color: activeIndustry.color }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs text-white/50">
                      {isVi ? stat.labelVi : stat.labelEn}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-ce-primary px-8 text-white shadow-lg shadow-ce-primary/30 hover:bg-ce-primary-600 hover:shadow-xl hover:shadow-ce-primary/40"
                  asChild
                >
                  <Link href={`/industries/${activeIndustry.slug}`}>
                    {isVi ? 'Khám phá giải pháp' : 'Explore Solutions'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  className="border-2 border-white bg-white/10 px-8 text-white backdrop-blur-sm hover:bg-white hover:text-ce-primary-800"
                  asChild
                >
                  <Link href="/menu/product">
                    <Search className="mr-2 h-4 w-4" />
                    {isVi ? 'Tìm sản phẩm' : 'Find Products'}
                  </Link>
                </Button>
              </div>

              {/* Brand Badge */}
              <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                  <span className="text-lg font-bold text-white">CE</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Creative Engineering</div>
                  <div className="text-xs text-white/60">
                    {isVi ? 'Đối tác công nghiệp từ 1999' : 'Industrial Partner Since 1999'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Industry Selector */}
            <div className="hidden lg:block">
              <div className="space-y-3">
                {industriesHeroData.map((industry, index) => {
                  const ItemIcon = industry.icon;
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={industry.id}
                      onClick={() => handleSelectIndustry(index)}
                      className={cn(
                        'group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300',
                        isActive
                          ? 'border-white/30 bg-white/10 backdrop-blur-sm'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={industry.image}
                          alt=""
                          fill
                          className="object-cover"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, ${industry.color}60, ${industry.color}20)`,
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <ItemIcon
                            className="h-4 w-4"
                            style={{ color: isActive ? industry.color : 'white' }}
                          />
                          <span
                            className={cn(
                              'text-sm font-semibold transition-colors',
                              isActive ? 'text-white' : 'text-white/70'
                            )}
                          >
                            {isVi ? industry.nameVi : industry.nameEn}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-white/50 line-clamp-1">
                          {isVi ? industry.taglineVi : industry.taglineEn}
                        </p>
                      </div>

                      {/* Active indicator */}
                      <div
                        className={cn(
                          'h-2 w-2 flex-shrink-0 rounded-full transition-all',
                          isActive ? 'scale-100' : 'scale-0'
                        )}
                        style={{ backgroundColor: industry.color }}
                      />
                    </button>
                  );
                })}

                {/* View All Button */}
                <button
                  onClick={scrollToContent}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 p-4 text-sm font-medium text-white/60 transition-all hover:border-white/30 hover:text-white/80"
                >
                  {isVi ? 'Xem tất cả 13 ngành hàng' : 'View all 13 industries'}
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Industry Pills */}
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {industriesHeroData.map((industry, index) => (
              <button
                key={industry.id}
                onClick={() => handleSelectIndustry(index)}
                className={cn(
                  'flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  activeIndex === index
                    ? 'bg-white text-ce-primary-800'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                )}
              >
                {isVi ? industry.nameVi : industry.nameEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {industriesHeroData.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSelectIndustry(index)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              activeIndex === index
                ? 'w-8 bg-white'
                : 'w-2 bg-white/30 hover:bg-white/50'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 right-8 z-20 hidden items-center gap-2 text-sm text-white/60 transition-colors hover:text-white lg:flex"
      >
        <span>{isVi ? 'Cuộn xuống' : 'Scroll down'}</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </button>
    </section>
  );
}

export default IndustriesHero;

