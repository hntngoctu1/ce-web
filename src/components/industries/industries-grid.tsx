'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Search,
  ArrowRight,
  Grid3X3,
  LayoutGrid,
  ChevronRight,
  Factory,
  Cog,
  Shield,
  Cpu,
  Wrench,
  Zap,
  Droplets,
  Thermometer,
  Printer,
  Layers,
  Hammer,
  Gauge,
  Paintbrush,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Complete industry data with images
const allIndustries = [
  {
    id: 'industrial-tapes',
    slug: 'industrial-tapes',
    nameEn: 'Industrial Tapes',
    nameVi: 'Băng Keo Công Nghiệp',
    shortEn: 'High-performance bonding, masking & protection for all manufacturing sectors',
    shortVi: 'Kết dính, che chắn & bảo vệ hiệu suất cao cho mọi ngành sản xuất',
    image: '/images/industries_img/Industrial Tapes.png',
    icon: Shield,
    category: 'bonding',
    stats: { value: '-40°C ~ +260°C', labelEn: 'Temperature Range', labelVi: 'Phạm vi nhiệt độ' },
    featured: true,
  },
  {
    id: 'silicone-rubber',
    slug: 'silicone-rubber',
    nameEn: 'Virgin Silicone Rubber',
    nameVi: 'Cao Su Silicone Nguyên Chất',
    shortEn: 'Premium sealing, gasketing & high-temperature applications with FDA compliance',
    shortVi: 'Làm kín, gioăng & ứng dụng chịu nhiệt cao đạt chuẩn FDA',
    image: '/images/industries_img/Virgin Silicone Rubber.png',
    icon: Cog,
    category: 'sealing',
    stats: { value: 'FDA/RoHS', labelEn: 'Certified', labelVi: 'Chứng nhận' },
    featured: true,
  },
  {
    id: 'lubricants',
    slug: 'lubricants',
    nameEn: 'Lubricants',
    nameVi: 'Chất Bôi Trơn',
    shortEn: 'Industrial lubricants & greases for machinery maintenance & friction reduction',
    shortVi: 'Chất bôi trơn & mỡ công nghiệp cho bảo trì máy móc & giảm ma sát',
    image: '/images/industries_img/Lubricants.png',
    icon: Droplets,
    category: 'maintenance',
    stats: { value: '+50%', labelEn: 'Equipment Lifespan', labelVi: 'Tuổi thọ thiết bị' },
    featured: false,
  },
  {
    id: 'metalworking-coatings',
    slug: 'metalworking-coatings',
    nameEn: 'Metalworking & Cleaning',
    nameVi: 'Gia Công Kim Loại & Vệ Sinh',
    shortEn: 'Specialized coatings, coolants & cleaning solutions for metalworking processes',
    shortVi: 'Chất phủ, làm mát & vệ sinh chuyên dụng cho quy trình gia công kim loại',
    image: '/images/industries_img/Coatings – Metalworking and Cleaning.png',
    icon: Wrench,
    category: 'coatings',
    stats: { value: '+30%', labelEn: 'Tool Life Extension', labelVi: 'Kéo dài tuổi thọ DC' },
    featured: false,
  },
  {
    id: 'electronic-coatings',
    slug: 'electronic-coatings',
    nameEn: 'Electronic Coatings',
    nameVi: 'Chất Phủ Điện Tử',
    shortEn: 'Conformal coatings & encapsulants for PCB protection in harsh environments',
    shortVi: 'Chất phủ bảo vệ & bọc kín cho PCB trong môi trường khắc nghiệt',
    image: '/images/industries_img/Electronic Surface Coatings.png',
    icon: Cpu,
    category: 'electronics',
    stats: { value: 'IP67+', labelEn: 'Protection Level', labelVi: 'Mức bảo vệ' },
    featured: true,
  },
  {
    id: 'sandpaper-abrasives',
    slug: 'sandpaper-abrasives',
    nameEn: 'Sandpaper & Abrasives',
    nameVi: 'Giấy Nhám & Vật Liệu Mài',
    shortEn: 'Complete range of abrasive products for surface preparation & finishing',
    shortVi: 'Dòng sản phẩm mài mòn đầy đủ cho chuẩn bị bề mặt & hoàn thiện',
    image: '/images/industries_img/Sandpaper and Abrasives, Polishing.png',
    icon: Layers,
    category: 'finishing',
    stats: { value: 'P40-P5000', labelEn: 'Grit Range', labelVi: 'Phạm vi độ nhám' },
    featured: false,
  },
  {
    id: 'nukote-coatings',
    slug: 'nukote-coatings',
    nameEn: 'Nukote Coatings',
    nameVi: 'Chất Phủ Nukote',
    shortEn: 'Polyurea & hybrid coatings for extreme abrasion & corrosion protection',
    shortVi: 'Polyurea & hybrid bảo vệ tối đa chống mài mòn & ăn mòn',
    image: '/images/industries_img/Nukote – Protective Coatings.png',
    icon: Paintbrush,
    category: 'coatings',
    stats: { value: '20+ yrs', labelEn: 'Service Life', labelVi: 'Tuổi thọ' },
    featured: true,
  },
  {
    id: 'industrial-adhesives',
    slug: 'industrial-adhesives',
    nameEn: 'Industrial Adhesives',
    nameVi: 'Keo Dán Công Nghiệp',
    shortEn: 'High-performance structural & assembly adhesives for various materials',
    shortVi: 'Keo kết cấu & lắp ráp hiệu suất cao cho các vật liệu khác nhau',
    image: '/images/industries_img/Industrial Adhesives.png',
    icon: Cog,
    category: 'bonding',
    stats: { value: '45 MPa', labelEn: 'Shear Strength', labelVi: 'Độ bền cắt' },
    featured: false,
  },
  {
    id: 'welding-equipment',
    slug: 'welding-equipment',
    nameEn: 'Welding Machines',
    nameVi: 'Máy Hàn & Phụ Kiện',
    shortEn: 'Professional MIG, TIG & spot welders plus consumables & safety accessories',
    shortVi: 'Máy hàn MIG, TIG chuyên nghiệp cùng vật tư tiêu hao & phụ kiện an toàn',
    image: '/images/industries_img/Welding Machines and Accessories.png',
    icon: Zap,
    category: 'equipment',
    stats: { value: '100-500A', labelEn: 'Power Range', labelVi: 'Công suất' },
    featured: false,
  },
  {
    id: 'printers',
    slug: 'printers',
    nameEn: 'Industrial Printers',
    nameVi: 'Máy In Công Nghiệp',
    shortEn: 'Industrial printing solutions including inkjet coders & label printers',
    shortVi: 'Giải pháp in công nghiệp bao gồm máy in phun mã & máy in nhãn',
    image: '/images/industries_img/Printers.png',
    icon: Printer,
    category: 'equipment',
    stats: { value: '300m/min', labelEn: 'Print Speed', labelVi: 'Tốc độ in' },
    featured: false,
  },
  {
    id: 'automatic-dosing',
    slug: 'automatic-dosing',
    nameEn: 'Robotic Dosing',
    nameVi: 'Định Lượng Robot',
    shortEn: 'Precision dispensing robots & automated dosing systems for production',
    shortVi: 'Robot phân phối chính xác & hệ thống định lượng tự động cho sản xuất',
    image: '/images/industries_img/Automatic Robotic Dosing Equipment.png',
    icon: Factory,
    category: 'automation',
    stats: { value: '±1%', labelEn: 'Accuracy', labelVi: 'Độ chính xác' },
    featured: true,
  },
  {
    id: 'fluid-transmission',
    slug: 'fluid-transmission',
    nameEn: 'Fluid Transmission',
    nameVi: 'Truyền Động Chất Lỏng',
    shortEn: 'Hydraulic & pneumatic components, hoses, fittings & industrial shredders',
    shortVi: 'Linh kiện thủy lực & khí nén, ống, phụ kiện & máy nghiền công nghiệp',
    image: '/images/industries_img/Fluid Transmission and Shredding.png',
    icon: Gauge,
    category: 'equipment',
    stats: { value: '400 bar', labelEn: 'Max Pressure', labelVi: 'Áp suất tối đa' },
    featured: false,
  },
  {
    id: 'heat-conducting',
    slug: 'heat-conducting',
    nameEn: 'Thermal Materials',
    nameVi: 'Vật Liệu Dẫn Nhiệt',
    shortEn: 'Thermal interface materials for effective heat dissipation in electronics',
    shortVi: 'Vật liệu giao diện nhiệt để tản nhiệt hiệu quả trong điện tử',
    image: '/images/industries_img/Heat-Conducting Materials.png',
    icon: Thermometer,
    category: 'electronics',
    stats: { value: '14 W/mK', labelEn: 'Conductivity', labelVi: 'Độ dẫn nhiệt' },
    featured: false,
  },
];

const categories = [
  { id: 'all', labelEn: 'All Industries', labelVi: 'Tất cả' },
  { id: 'bonding', labelEn: 'Bonding & Tapes', labelVi: 'Kết dính & Băng keo' },
  { id: 'coatings', labelEn: 'Coatings', labelVi: 'Chất phủ' },
  { id: 'electronics', labelEn: 'Electronics', labelVi: 'Điện tử' },
  { id: 'equipment', labelEn: 'Equipment', labelVi: 'Thiết bị' },
  { id: 'automation', labelEn: 'Automation', labelVi: 'Tự động hóa' },
  { id: 'maintenance', labelEn: 'Maintenance', labelVi: 'Bảo trì' },
  { id: 'sealing', labelEn: 'Sealing', labelVi: 'Làm kín' },
  { id: 'finishing', labelEn: 'Finishing', labelVi: 'Hoàn thiện' },
];

interface IndustriesGridProps {
  className?: string;
  showFilters?: boolean;
}

export function IndustriesGrid({ className, showFilters = true }: IndustriesGridProps) {
  const locale = useLocale();
  const isVi = (locale || '').toLowerCase().startsWith('vi');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredIndustries = useMemo(() => {
    return allIndustries.filter((industry) => {
      const name = isVi ? industry.nameVi : industry.nameEn;
      const desc = isVi ? industry.shortVi : industry.shortEn;

      const matchesSearch =
        !searchQuery ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === 'all' || industry.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, isVi]);

  return (
    <section id="industries-grid" className={cn('bg-white py-16 lg:py-24', className)}>
      <div className="ce-container">
        {showFilters && (
          <>
            {/* Section Header */}
            <div className="mb-10 text-center">
              <span className="ce-kicker mb-3 block">
                {isVi ? 'Danh mục ngành hàng' : 'Industry Categories'}
              </span>
              <h2 className="ce-section-title text-3xl font-bold md:text-4xl">
                {isVi ? 'Khám phá giải pháp' : 'Explore Our Solutions'}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                {isVi
                  ? 'Chúng tôi cung cấp giải pháp toàn diện cho 13 ngành công nghiệp, từ băng keo công nghiệp đến robot định lượng tự động.'
                  : 'We provide comprehensive solutions for 13 industries, from industrial tapes to robotic dispensing systems.'}
              </p>
            </div>

            {/* Filters */}
            <div className="mb-8 flex flex-col gap-4 rounded-2xl border bg-ce-primary-50/30 p-4 lg:flex-row lg:items-center lg:justify-between lg:p-6">
              {/* Search */}
              <div className="relative flex-1 lg:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isVi ? 'Tìm kiếm ngành hàng...' : 'Search industries...'}
                  className="w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm focus:border-ce-primary focus:outline-none focus:ring-1 focus:ring-ce-primary"
                />
              </div>

              {/* Category Pills + View Toggle */}
              <div className="flex flex-wrap items-center gap-2">
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                      activeCategory === cat.id
                        ? 'bg-ce-primary text-white'
                        : 'bg-white text-ce-primary-700 hover:bg-ce-primary-100'
                    )}
                  >
                    {isVi ? cat.labelVi : cat.labelEn}
                  </button>
                ))}

                {/* View Mode Toggle */}
                <div className="ml-2 flex items-center gap-1 rounded-lg border bg-white p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'rounded p-1.5 transition-colors',
                      viewMode === 'grid' ? 'bg-ce-primary text-white' : 'text-muted-foreground hover:text-ce-primary'
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'rounded p-1.5 transition-colors',
                      viewMode === 'list' ? 'bg-ce-primary text-white' : 'text-muted-foreground hover:text-ce-primary'
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {filteredIndustries.length} {isVi ? 'ngành hàng' : 'industries'}
              </span>
              {activeCategory !== 'all' && (
                <button
                  onClick={() => setActiveCategory('all')}
                  className="text-ce-primary hover:underline"
                >
                  {isVi ? 'Xóa bộ lọc' : 'Clear filter'}
                </button>
              )}
            </div>
          </>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredIndustries.map((industry, index) => {
              const Icon = industry.icon;
              return (
                <Link
                  key={industry.id}
                  href={`/industries/${industry.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-ce-primary/10"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={industry.image}
                      alt={isVi ? industry.nameVi : industry.nameEn}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ce-primary-900/70 via-ce-primary-900/30 to-transparent" />

                    {/* Featured Badge */}
                    {industry.featured && (
                      <div className="absolute right-3 top-3 rounded-full bg-ce-accent-teal px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        {isVi ? 'Nổi bật' : 'Featured'}
                      </div>
                    )}

                    {/* Stats Badge */}
                    <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 backdrop-blur-sm">
                      <div className="text-xs font-bold text-ce-primary-800">
                        {industry.stats.value}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {isVi ? industry.stats.labelVi : industry.stats.labelEn}
                      </div>
                    </div>

                    {/* Icon Badge */}
                    <div className="absolute bottom-3 right-3 rounded-full bg-white/20 p-2 backdrop-blur-sm">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 text-lg font-bold text-ce-primary-800 transition-colors group-hover:text-ce-primary">
                      {isVi ? industry.nameVi : industry.nameEn}
                    </h3>
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {isVi ? industry.shortVi : industry.shortEn}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-1 text-sm font-semibold text-ce-primary transition-all group-hover:gap-2">
                      {isVi ? 'Xem chi tiết' : 'Learn more'}
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Hover Border */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent transition-colors group-hover:border-ce-primary/20" />
                </Link>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredIndustries.map((industry, index) => {
              const Icon = industry.icon;
              return (
                <Link
                  key={industry.id}
                  href={`/industries/${industry.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg md:flex-row"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image */}
                  <div className="relative h-48 w-full md:h-auto md:w-64 lg:w-80">
                    <Image
                      src={industry.image}
                      alt={isVi ? industry.nameVi : industry.nameEn}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ce-primary-900/30 md:bg-gradient-to-l" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-center p-6">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-lg bg-ce-primary-100 p-2">
                        <Icon className="h-5 w-5 text-ce-primary" />
                      </div>
                      {industry.featured && (
                        <span className="rounded-full bg-ce-accent-teal/10 px-2.5 py-0.5 text-xs font-semibold text-ce-accent-teal">
                          {isVi ? 'Nổi bật' : 'Featured'}
                        </span>
                      )}
                    </div>

                    <h3 className="mb-2 text-xl font-bold text-ce-primary-800 transition-colors group-hover:text-ce-primary">
                      {isVi ? industry.nameVi : industry.nameEn}
                    </h3>

                    <p className="mb-4 text-muted-foreground">
                      {isVi ? industry.shortVi : industry.shortEn}
                    </p>

                    <div className="flex items-center gap-6">
                      <div className="rounded-lg bg-ce-primary-50 px-4 py-2">
                        <div className="text-sm font-bold text-ce-primary">
                          {industry.stats.value}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isVi ? industry.stats.labelVi : industry.stats.labelEn}
                        </div>
                      </div>

                      <span className="flex items-center gap-1 text-sm font-semibold text-ce-primary transition-all group-hover:gap-2">
                        {isVi ? 'Xem chi tiết' : 'Explore solutions'}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredIndustries.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed bg-muted/30 p-12 text-center">
            <Factory className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold text-muted-foreground">
              {isVi ? 'Không tìm thấy ngành hàng' : 'No industries found'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isVi
                ? 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.'
                : 'Try a different search term or clear filters.'}
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              variant="ce-outline"
              className="mt-4"
            >
              {isVi ? 'Xóa bộ lọc' : 'Clear filters'}
            </Button>
          </div>
        )}

        {/* CTA */}
        {showFilters && (
          <div className="mt-12 text-center">
            <p className="mb-4 text-muted-foreground">
              {isVi
                ? 'Không tìm thấy giải pháp phù hợp?'
                : "Can't find the right solution?"}
            </p>
            <Button asChild variant="ce">
              <Link href="/contact">
                {isVi ? 'Liên hệ tư vấn' : 'Contact Our Experts'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default IndustriesGrid;

