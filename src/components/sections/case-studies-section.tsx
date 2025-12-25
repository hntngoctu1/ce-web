'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';

interface CaseStudiesSectionProps {
  className?: string;
}

// Placeholder case studies - in production, these would come from the database
const caseStudies = [
  {
    id: '1',
    titleEn: 'Automotive Assembly Line',
    titleVi: 'Dây chuyền lắp ráp ô tô',
    descriptionEn: 'Optimized adhesive dispensing for a high-volume assembly process',
    descriptionVi: 'Tối ưu định lượng keo cho dây chuyền lắp ráp sản lượng lớn',
    image: '/images/case-automotive.svg',
    href: '/blog?category=case-studies',
  },
  {
    id: '2',
    titleEn: 'Electronics Manufacturing',
    titleVi: 'Sản xuất điện tử',
    descriptionEn: 'Precision taping to improve yield and shorten cycle time',
    descriptionVi: 'Dán băng keo chính xác giúp tăng tỷ lệ đạt và rút ngắn chu kỳ',
    image: '/images/case-electronics.svg',
    href: '/blog?category=case-studies',
  },
  {
    id: '3',
    titleEn: 'Food Processing',
    titleVi: 'Chế biến thực phẩm',
    descriptionEn: 'Food-safe coatings and packaging solutions with clean processes',
    descriptionVi: 'Giải pháp lớp phủ an toàn thực phẩm và đóng gói theo chuẩn sạch',
    image: '/images/case-food.svg',
    href: '/blog?category=case-studies',
  },
  {
    id: '4',
    titleEn: 'Solar Panel Production',
    titleVi: 'Sản xuất pin năng lượng mặt trời',
    descriptionEn: 'High-performance bonding for reliability in harsh environments',
    descriptionVi: 'Liên kết bền vững, đảm bảo độ tin cậy trong môi trường khắc nghiệt',
    image: '/images/case-solar.svg',
    href: '/blog?category=case-studies',
  },
  {
    id: '5',
    titleEn: 'Medical Devices',
    titleVi: 'Thiết bị y tế',
    descriptionEn: 'Precision converting for tight-tolerance components',
    descriptionVi: 'Gia công chuyển đổi chính xác cho linh kiện dung sai chặt',
    image: '/images/case-medical.svg',
    href: '/blog?category=case-studies',
  },
  {
    id: '6',
    titleEn: 'Appliance Manufacturing',
    titleVi: 'Sản xuất thiết bị gia dụng',
    descriptionEn: 'Integrated labeling to standardize quality and reduce rework',
    descriptionVi: 'Tích hợp dán nhãn giúp chuẩn hoá chất lượng và giảm rework',
    image: '/images/case-appliance.svg',
    href: '/blog?category=case-studies',
  },
];

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
            <Link href="/blog?category=case-studies">
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

              {/* Content (visible by default; stronger on hover) */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white transition-opacity duration-300">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold">{isVi ? study.titleVi : study.titleEn}</h3>
                  <ArrowRight className="h-5 w-5 opacity-80 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-2 text-sm text-white/85">
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
