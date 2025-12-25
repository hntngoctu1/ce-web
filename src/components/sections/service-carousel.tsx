'use client';

import { Beaker, Scissors, Tag, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';

interface Service {
  slug: string;
  nameEn: string;
  nameVi: string;
  descriptionEn: string | null;
  descriptionVi: string | null;
  iconName: string | null;
}

interface ServiceCarouselProps {
  services: Service[];
  className?: string;
}

const iconMap: Record<string, typeof Beaker> = {
  beaker: Beaker,
  scissors: Scissors,
  tag: Tag,
  zap: Zap,
};

// Fallback mock services if database is unavailable
const mockServices: Service[] = [
  {
    slug: 'adhesives',
    nameEn: 'Adhesives & Sealants',
    nameVi: 'Keo dán & Chất trám',
    descriptionEn: 'Industrial-grade bonding solutions for diverse applications',
    descriptionVi: 'Giải pháp kết dính công nghiệp cho nhiều ứng dụng',
    iconName: 'beaker',
  },
  {
    slug: 'tapes',
    nameEn: 'Specialty Tapes',
    nameVi: 'Băng keo chuyên dụng',
    descriptionEn: 'High-performance tapes for manufacturing and assembly',
    descriptionVi: 'Băng keo hiệu năng cao cho sản xuất và lắp ráp',
    iconName: 'scissors',
  },
  {
    slug: 'coatings',
    nameEn: 'Coatings & Films',
    nameVi: 'Lớp phủ & Màng',
    descriptionEn: 'Protective coatings and specialty films for various industries',
    descriptionVi: 'Lớp phủ bảo vệ và màng chuyên dụng cho nhiều ngành',
    iconName: 'tag',
  },
  {
    slug: 'equipment',
    nameEn: 'Dispensing Equipment',
    nameVi: 'Thiết bị phân phối',
    descriptionEn: 'Precision dispensing systems and application equipment',
    descriptionVi: 'Hệ thống phân phối chính xác và thiết bị ứng dụng',
    iconName: 'zap',
  },
];

export function ServiceCarousel({ services, className }: ServiceCarouselProps) {
  const locale = useLocale();
  const tHome = useTranslations('home');
  const isVi = (locale || '').toLowerCase().startsWith('vi');
  const displayServices = services.length > 0 ? services : mockServices;

  return (
    <section className={cn('ce-section', className)}>
      <div className="ce-container">
        <div className="mb-12 text-center">
          <h2 className="ce-heading mb-4 text-3xl">{tHome('servicesTitle')}</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">{tHome('servicesSubtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {displayServices.map((service, index) => {
            const IconComponent = iconMap[service.iconName || 'beaker'] || Beaker;
            const name = isVi ? service.nameVi : service.nameEn;
            const description = isVi ? service.descriptionVi : service.descriptionEn;

            return (
              <Card
                key={service.slug}
                className={cn(
                  'group cursor-pointer border-2 border-transparent transition-all duration-300 hover:border-ce-primary hover:shadow-lg',
                  'animate-fade-up'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-ce-primary/10 transition-colors group-hover:bg-ce-primary">
                    <IconComponent className="h-7 w-7 text-ce-primary transition-colors group-hover:text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground">{name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">{description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
