'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';

// Service data with images from public/images/services
const servicesData = [
  {
    id: 'mix-dispensing',
    slug: 'mix-dispensing',
    nameEn: 'Mix & Dispensing',
    nameVi: 'Trộn & Phân phối',
    descriptionEn:
      'Precision mixing and dispensing solutions for adhesives, sealants, and coatings with automated accuracy.',
    descriptionVi:
      'Giải pháp trộn và phân phối chính xác cho keo dán, chất bịt kín và lớp phủ với độ chính xác tự động.',
    // Image file: MIX_DISPENSING1.png
    imageSrc: '/images/services/MIX_DISPENSING1.png',
    href: '/services/mix-dispensing',
    tags: ['Precision', 'Automation'],
    tagsVi: ['Chính xác', 'Tự động hóa'],
  },
  {
    id: 'converting-services',
    slug: 'converting-services',
    nameEn: 'Converting Services',
    nameVi: 'Dịch vụ Chuyển đổi',
    descriptionEn:
      'Custom converting solutions for tapes, films, and flexible materials to meet exact specifications.',
    descriptionVi:
      'Giải pháp gia công chuyển đổi cho băng keo, màng và vật liệu linh hoạt theo yêu cầu chính xác.',
    // Image file: CONVERTING SERVICES.png
    imageSrc: '/images/services/CONVERTING SERVICES.png',
    href: '/services/converting-services',
    tags: ['Custom', 'Flexible'],
    tagsVi: ['Tùy chỉnh', 'Linh hoạt'],
  },
  {
    id: 'custom-labeling',
    slug: 'custom-labeling',
    nameEn: 'Custom Labeling',
    nameVi: 'Nhãn Tùy chỉnh',
    descriptionEn:
      'Professional labeling solutions for industrial and commercial applications with premium quality.',
    descriptionVi:
      'Giải pháp dán nhãn chuyên nghiệp cho ứng dụng công nghiệp và thương mại với chất lượng cao cấp.',
    // Image file: CUSTOM LABELING.png
    imageSrc: '/images/services/CUSTOM LABELING.png',
    href: '/services/custom-labeling',
    tags: ['Professional', 'Quality'],
    tagsVi: ['Chuyên nghiệp', 'Chất lượng'],
  },
  {
    id: 'laser-die-cutting',
    slug: 'laser-die-cutting',
    nameEn: 'Laser & Die Cutting',
    nameVi: 'Cắt Laser & Khuôn',
    descriptionEn:
      'High-precision laser and die cutting services for complex shapes and specialty materials.',
    descriptionVi:
      'Dịch vụ cắt laser và khuôn độ chính xác cao cho hình dạng phức tạp và vật liệu đặc biệt.',
    // Image file: laser_die cutting.png
    imageSrc: '/images/services/laser_die cutting.png',
    href: '/services/laser-die-cutting',
    tags: ['High-Precision', 'Advanced'],
    tagsVi: ['Độ chính xác cao', 'Tiên tiến'],
  },
];

interface ServicesSectionProps {
  className?: string;
}

export function ServicesSection({ className }: ServicesSectionProps) {
  const locale = useLocale();
  const tHome = useTranslations('home');
  const isVi = (locale || '').toLowerCase().startsWith('vi');

  return (
    <section className={cn('relative overflow-hidden bg-white py-20 lg:py-28', className)}>
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#676E9F_0.5px,transparent_0.5px)] opacity-[0.03] [background-size:24px_24px]" />

      <div className="ce-container relative">
        {/* Section Header */}
        <div className="mb-16 text-center">
          {/* Eyebrow */}
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.2em] text-ce-primary">
            {isVi ? 'Năng lực' : 'Capabilities'}
          </span>

          {/* Title */}
          <h2 className="mb-4 text-3xl font-bold text-ce-primary-800 md:text-4xl lg:text-5xl">
            {tHome('servicesTitle')}
          </h2>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
            {tHome('servicesSubtitle')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {servicesData.map((service, index) => {
            const name = isVi ? service.nameVi : service.nameEn;
            const description = isVi ? service.descriptionVi : service.descriptionEn;
            const tags = isVi ? service.tagsVi : service.tags;

            return (
              <article
                key={service.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-ce-primary/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={service.imageSrc}
                    alt={name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-70" />

                  {/* Tags on image */}
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ce-primary-700 backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5 lg:p-6">
                  {/* Title */}
                  <h3 className="mb-2 text-lg font-bold text-ce-primary-800 transition-colors group-hover:text-ce-primary lg:text-xl">
                    {name}
                  </h3>

                  {/* Description */}
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>

                  {/* CTA Link */}
                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-ce-primary transition-all duration-300 group-hover:gap-2.5"
                    aria-label={`${isVi ? 'Xem chi tiết' : 'Explore'} ${name}`}
                  >
                    <span>{isVi ? 'Xem chi tiết' : 'Explore service'}</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                </div>

                {/* Hover border accent */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-500 group-hover:border-ce-primary/20" />
              </article>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/services"
            className="group/btn inline-flex items-center gap-2 rounded-full border-2 border-ce-primary bg-transparent px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-ce-primary transition-all duration-300 hover:bg-ce-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-ce-primary focus:ring-offset-2"
            aria-label={isVi ? 'Xem tất cả dịch vụ' : 'View all services'}
          >
            <span>{isVi ? 'Xem tất cả dịch vụ' : 'View all services'}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
