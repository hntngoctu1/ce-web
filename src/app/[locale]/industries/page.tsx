import { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import { industries as staticIndustries } from '@/data/industries';
import { ArrowRight } from 'lucide-react';

// Industry images mapping
const industryImages: Record<string, string> = {
  'industrial-tapes': '/images/industries_img/Industrial Tapes.png',
  'silicone-rubber': '/images/industries_img/Virgin Silicone Rubber.png',
  'lubricants': '/images/industries_img/Lubricants.png',
  'metalworking-coatings': '/images/industries_img/Coatings – Metalworking and Cleaning.png',
  'electronic-coatings': '/images/industries_img/Electronic Surface Coatings.png',
  'sandpaper-abrasives': '/images/industries_img/Sandpaper and Abrasives, Polishing.png',
  'nukote-coatings': '/images/industries_img/Nukote – Protective Coatings.png',
  'industrial-adhesives': '/images/industries_img/Industrial Adhesives.png',
  'welding-equipment': '/images/industries_img/Welding Machines and Accessories.png',
  'printers': '/images/industries_img/Printers.png',
  'automatic-dosing': '/images/industries_img/Automatic Robotic Dosing Equipment.png',
  'fluid-transmission': '/images/industries_img/Fluid Transmission and Shredding.png',
  'heat-conducting': '/images/industries_img/Heat-Conducting Materials.png',
};

export const metadata: Metadata = {
  title: 'Industries & Product Categories - Creative Engineering',
  description:
    'Explore our comprehensive range of industrial products including tapes, adhesives, coatings, lubricants, welding equipment, and more.',
};

async function getIndustryCategories() {
  try {
    return await prisma.industryCategory.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return [];
  }
}

export default async function IndustriesPage() {
  const locale = await getLocale();
  const isVi = locale.toLowerCase().startsWith('vi');
  const categories = await getIndustryCategories();

  const display = (
    categories.length > 0
      ? categories
      : staticIndustries.map((i, idx) => ({
          id: `static-${idx}`,
          slug: i.slug,
          nameEn: i.name,
          nameVi: i.nameVi,
          descriptionEn: i.summary,
          descriptionVi: i.summaryVi,
          imageUrl: null,
          order: idx,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
  ).map((c) => {
    const detail = staticIndustries.find((d) => d.slug === c.slug);
    return {
      slug: c.slug,
      nameEn: c.nameEn,
      nameVi: c.nameVi,
      summaryEn: c.descriptionEn || detail?.summary || '',
      summaryVi: c.descriptionVi || detail?.summaryVi || '',
      tagsEn: detail?.tags || [],
      tagsVi: detail?.tagsVi || [],
      stats: detail?.stats || [],
      image: industryImages[c.slug] || '/images/industries_img/Industrial Tapes.png',
    };
  });

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ce-primary-800 via-ce-primary to-ce-primary-600 py-16 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] opacity-10 [background-size:24px_24px]" />
        <div className="ce-container relative text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            {isVi ? 'Danh Mục Sản Phẩm' : 'Product Categories'}
          </p>
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            {isVi ? 'Ngành Công Nghiệp & Sản Phẩm' : 'Industries & Products'}
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-white/80">
            {isVi
              ? 'Khám phá danh mục sản phẩm công nghiệp toàn diện của chúng tôi với 13 hạng mục chính, từ băng keo, keo dán đến thiết bị tự động hóa và vật liệu dẫn nhiệt.'
              : 'Explore our comprehensive industrial product catalog with 13 main categories, from tapes and adhesives to automation equipment and thermal materials.'}
          </p>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="bg-white py-16 lg:py-24">
        <div className="ce-container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {display.map((industry, index) => (
              <Link
                key={industry.slug}
                href={`/industries/${industry.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ce-primary/10"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-ce-primary/10 to-ce-primary/5">
                  <Image
                    src={industry.image}
                    alt={isVi ? industry.nameVi : industry.nameEn}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Tags */}
                  <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1">
                    {(isVi ? industry.tagsVi : industry.tagsEn).slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="mb-2 text-lg font-bold text-ce-primary-800 transition-colors group-hover:text-ce-primary">
                    {isVi ? industry.nameVi : industry.nameEn}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {isVi ? industry.summaryVi : industry.summaryEn}
                  </p>

                  {/* Stats preview */}
                  {industry.stats && industry.stats.length > 0 && (
                    <div className="mb-4 flex gap-4 border-t border-black/5 pt-4">
                      <div className="text-center">
                        <div className="text-sm font-bold text-ce-primary">
                          {industry.stats[0].value}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isVi ? industry.stats[0].labelVi : industry.stats[0].label}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="inline-flex items-center text-sm font-semibold text-ce-primary">
                    {isVi ? 'Xem chi tiết' : 'View details'}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-ce-neutral-50 py-16">
        <div className="ce-container text-center">
          <h2 className="mb-4 text-2xl font-bold text-ce-primary-800 md:text-3xl">
            {isVi ? 'Cần tư vấn chuyên gia?' : 'Need expert consultation?'}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            {isVi
              ? 'Đội ngũ kỹ thuật của chúng tôi sẵn sàng giúp bạn chọn sản phẩm phù hợp nhất cho ứng dụng của bạn.'
              : 'Our technical team is ready to help you select the most suitable products for your application.'}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-ce-primary px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-ce-primary-600 hover:shadow-lg"
            >
              {isVi ? 'Liên hệ tư vấn' : 'Contact us'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/menu/product"
              className="inline-flex items-center justify-center rounded-full border-2 border-ce-primary/20 px-8 py-4 text-sm font-semibold text-ce-primary transition-all hover:bg-ce-primary hover:text-white"
            >
              {isVi ? 'Xem tất cả sản phẩm' : 'View all products'}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
