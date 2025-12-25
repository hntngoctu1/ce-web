import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { HeroSlideshow } from '@/components/sections/hero-slideshow';
import { ServicesSection } from '@/components/sections/services-section';
import { PartnersSection } from '@/components/sections/partners-section';
import { ContactSection } from '@/components/sections/contact-section';
import { CaseStudiesSection } from '@/components/sections/case-studies-section';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import fs from 'node:fs';
import path from 'node:path';

export const metadata: Metadata = {
  title: 'Creative Engineering - Industrial Solutions Partner',
  description:
    'Creative Engineering delivers innovative industrial solutions since 1999. Your trusted partner for adhesives, tapes, coatings, and specialized equipment in Vietnam.',
};

function pickBanner(baseName: string) {
  // Prefer user-provided raster images if present, otherwise fall back to existing SVGs.
  const publicDir = path.join(process.cwd(), 'public');
  const candidates = [
    `/banners/${baseName}.webp`,
    `/banners/${baseName}.jpg`,
    `/banners/${baseName}.jpeg`,
    `/banners/${baseName}.png`,
    `/banners/${baseName}.svg`,
  ];
  for (const rel of candidates) {
    const filePath = path.join(publicDir, rel.replace(/^\//, ''));
    if (fs.existsSync(filePath)) return rel;
  }
  // Last resort (should not happen because we ship home-1..3.svg)
  return '/banners/home-1.svg';
}

async function getHomeData() {
  // Fallback content to ensure the homepage always renders
  const fallbackServices = [
    {
      id: 's1',
      slug: 'mix-dispensing',
      nameEn: 'Mix & Dispensing',
      nameVi: 'Trộn & Phân phối',
      descriptionEn: 'Precision mixing and dispensing for adhesives, sealants, and coatings.',
      descriptionVi: 'Giải pháp trộn và phân phối chính xác cho keo dán, chất phủ.',
      iconName: 'beaker',
      imageUrl: null,
      order: 0,
      isActive: true,
    },
    {
      id: 's2',
      slug: 'converting-services',
      nameEn: 'Converting Services',
      nameVi: 'Dịch vụ Chuyển đổi',
      descriptionEn: 'Custom converting for tapes, films, and flexible materials.',
      descriptionVi: 'Gia công chuyển đổi băng keo, màng và vật liệu linh hoạt.',
      iconName: 'scissors',
      imageUrl: null,
      order: 1,
      isActive: true,
    },
    {
      id: 's3',
      slug: 'custom-labeling',
      nameEn: 'Custom Labeling',
      nameVi: 'Nhãn Tùy chỉnh',
      descriptionEn: 'Professional labeling for industrial and commercial applications.',
      descriptionVi: 'Giải pháp dán nhãn chuyên nghiệp cho công nghiệp và thương mại.',
      iconName: 'tag',
      imageUrl: null,
      order: 2,
      isActive: true,
    },
    {
      id: 's4',
      slug: 'laser-die-cutting',
      nameEn: 'Laser & Die Cutting',
      nameVi: 'Cắt Laser & Khuôn',
      descriptionEn: 'High-precision laser and die cutting for complex shapes and materials.',
      descriptionVi: 'Cắt laser và khuôn chính xác cho hình dạng/vật liệu phức tạp.',
      iconName: 'zap',
      imageUrl: null,
      order: 3,
      isActive: true,
    },
  ];

  const fallbackPartners = [
    { id: 'henkel', name: 'Henkel', logoUrl: null },
    { id: 'tesa', name: 'Tesa', logoUrl: null },
    { id: 'graco', name: 'Graco', logoUrl: null },
    { id: '3m', name: '3M', logoUrl: null },
  ];

  const fallbackHero = {
    titleEn: 'Engineering Excellence',
    titleVi: 'Xuất sắc trong Kỹ thuật',
    subtitleEn: 'Your Trusted Partner in Industrial Solutions',
    subtitleVi: 'Đối tác Đáng tin cậy trong Giải pháp Công nghiệp',
    contentEn:
      'Creative Engineering delivers innovative solutions for industrial challenges since 1999.',
    contentVi:
      'Creative Engineering cung cấp các giải pháp sáng tạo cho thách thức công nghiệp từ năm 1999.',
    imageUrl: null as string | null,
  };

  // If no DB configured, return fallback immediately
  if (!process.env.DATABASE_URL) {
    return {
      services: fallbackServices,
      partners: fallbackPartners,
      heroSection: fallbackHero,
      featuredProducts: [],
      latestPosts: [],
      productGroups: [],
    };
  }

  try {
    const [services, partners, heroSection, featuredProducts, latestPosts, productGroups] =
      await Promise.all([
        prisma.serviceCategory.findMany({
          where: { isActive: true },
          orderBy: { order: 'asc' },
        }),
        prisma.partner.findMany({
          where: { isActive: true },
          orderBy: { order: 'asc' },
        }),
        prisma.pageSection.findFirst({
          where: { page: 'home', sectionType: 'HERO' },
        }),
        prisma.product.findMany({
          where: { isActive: true, isFeatured: true },
          include: { images: { orderBy: { order: 'asc' }, take: 1 } },
          orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
          take: 6,
        }),
        prisma.blogPost.findMany({
          where: { isPublished: true },
          orderBy: { publishedAt: 'desc' },
          take: 3,
          include: { category: true },
        }),
        prisma.productGroup.findMany({
          where: { isActive: true },
          orderBy: { order: 'asc' },
          take: 8,
        }),
      ]);

    return {
      services: services.length ? services : fallbackServices,
      partners: partners.length ? partners : fallbackPartners,
      heroSection: heroSection || fallbackHero,
      featuredProducts,
      latestPosts,
      productGroups,
    };
  } catch (error) {
    console.error('Database connection error, using fallback:', error);
    return {
      services: fallbackServices,
      partners: fallbackPartners,
      heroSection: fallbackHero,
      featuredProducts: [],
      latestPosts: [],
      productGroups: [],
    };
  }
}

export default async function HomePage() {
  const locale = await getLocale();
  const tHome = await getTranslations('home');
  const { services, partners, heroSection, featuredProducts, latestPosts, productGroups } =
    await getHomeData();

  const isVi = locale.toLowerCase().startsWith('vi');
  const heroTitle = isVi ? heroSection?.titleVi : heroSection?.titleEn;
  const heroSubtitle = isVi ? heroSection?.subtitleVi : heroSection?.subtitleEn;
  const heroDescription = isVi ? heroSection?.contentVi : heroSection?.contentEn;

  return (
    <>
      {/* Hero Slideshow */}
      <HeroSlideshow
        slides={[
          {
            id: 'home-1',
            title: heroTitle || tHome('heroTitle'),
            subtitle: heroSubtitle || tHome('heroSubtitle'),
            description: heroDescription || tHome('heroDescription'),
            imageUrl: pickBanner('home-1'),
            ctaText: tHome('slides.home1.cta'),
            ctaHref: '/menu/product',
            secondaryCtaText: tHome('slides.home1.secondaryCta'),
            secondaryCtaHref: '/menu/industrial',
          },
          {
            id: 'home-2',
            title: tHome('slides.home2.title'),
            subtitle: tHome('slides.home2.subtitle'),
            description: tHome('slides.home2.description'),
            imageUrl: pickBanner('home-2'),
            ctaText: tHome('slides.home2.cta'),
            ctaHref: '/menu/industrial',
            secondaryCtaText: tHome('slides.home2.secondaryCta'),
            secondaryCtaHref: '/contact',
          },
          {
            id: 'home-3',
            title: tHome('slides.home3.title'),
            subtitle: tHome('slides.home3.subtitle'),
            description: tHome('slides.home3.description'),
            imageUrl: pickBanner('home-3'),
            ctaText: tHome('slides.home3.cta'),
            ctaHref: '/menu/product',
            secondaryCtaText: tHome('slides.home3.secondaryCta'),
            secondaryCtaHref: '/blog',
          },
          {
            id: 'home-4',
            title: tHome('slides.home4.title'),
            subtitle: tHome('slides.home4.subtitle'),
            description: tHome('slides.home4.description'),
            imageUrl: pickBanner('home-4'),
            ctaText: tHome('slides.home4.cta'),
            ctaHref: '/envision#services',
            secondaryCtaText: tHome('slides.home4.secondaryCta'),
            secondaryCtaHref: '/contact',
          },
          {
            id: 'home-5',
            title: tHome('slides.home5.title'),
            subtitle: tHome('slides.home5.subtitle'),
            description: tHome('slides.home5.description'),
            imageUrl: pickBanner('home-5'),
            ctaText: tHome('slides.home5.cta'),
            ctaHref: '/blog',
            secondaryCtaText: tHome('slides.home5.secondaryCta'),
            secondaryCtaHref: '/blog?category=case-studies',
          },
          {
            id: 'home-6',
            title: tHome('slides.home6.title'),
            subtitle: tHome('slides.home6.subtitle'),
            description: tHome('slides.home6.description'),
            imageUrl: pickBanner('home-6'),
            ctaText: tHome('slides.home6.cta'),
            ctaHref: '/menu/industrial',
            secondaryCtaText: tHome('slides.home6.secondaryCta'),
            secondaryCtaHref: '/contact',
          },
        ]}
      />

      {/* Prostech-like category blocks */}
      <section className="ce-section bg-white">
        <div className="ce-container">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {tHome('sections.categoriesKicker')}
              </div>
              <h2 className="mt-2 text-3xl font-heavy text-ce-primary-900">
                {tHome('sections.categoriesTitle')}
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                {tHome('sections.categoriesDesc')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="ce-outline">
                <Link href="/menu/industrial">{tHome('sections.industriesBtn')}</Link>
              </Button>
              <Button asChild variant="ce">
                <Link href="/menu/product">{tHome('sections.browseProductsBtn')}</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/menu/industrial"
              className="rounded-xl border bg-ce-gradient text-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="p-6">
                <div className="text-xs font-bold uppercase tracking-wider text-white/80">
                  {tHome('sections.solutionsKicker')}
                </div>
                <div className="mt-2 text-xl font-bold">{tHome('sections.solutionsCardTitle')}</div>
                <div className="mt-2 text-sm text-white/80">
                  {tHome('sections.solutionsCardDesc')}
                </div>
              </div>
            </Link>

            {(productGroups?.length ? productGroups : []).slice(0, 3).map((g) => (
              <Link
                key={g.id}
                href={`/menu/product?group=${g.slug}`}
                className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-ce-primary hover:shadow-md"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {tHome('sections.productGroupKicker')}
                </div>
                <div className="mt-2 text-lg font-bold text-ce-primary-900">
                  {isVi ? g.nameVi : g.nameEn}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {tHome('sections.productGroupCta')}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Premium Industrial Design */}
      <ServicesSection />

      {/* Case Studies Section */}
      <CaseStudiesSection />

      {/* Featured products (Prostech-style grid) */}
      <section className="ce-section bg-white">
        <div className="ce-container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {tHome('sections.featuredKicker')}
              </div>
              <h2 className="mt-2 text-3xl font-heavy text-ce-primary-900">
                {tHome('sections.featuredTitle')}
              </h2>
            </div>
            <Button asChild variant="ce">
              <Link href="/menu/product">{tHome('sections.viewAllProducts')}</Link>
            </Button>
          </div>

          {featuredProducts?.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-ce-primary hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-ce-primary-900">
                      {isVi ? p.nameVi : p.nameEn}
                    </div>
                    {p.isOnSale && <Badge variant="sale">{tHome('sections.saleBadge')}</Badge>}
                  </div>
                  <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {isVi ? p.shortDescVi : p.shortDescEn}
                  </div>
                  <div className="mt-4 text-sm font-medium text-ce-primary">
                    {tHome('sections.viewDetails')}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="rounded-xl">
              <CardContent className="p-6 text-sm text-muted-foreground">
                {tHome('sections.featuredEmptyHint')}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Partners Section */}
      <PartnersSection
        partners={partners}
        title={tHome('partnersTitle')}
        subtitle={tHome('partnersSubtitle')}
      />

      {/* Latest news (Prostech-style) */}
      <section className="ce-section bg-white">
        <div className="ce-container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {tHome('sections.newsKicker')}
              </div>
              <h2 className="mt-2 text-3xl font-heavy text-ce-primary-900">
                {tHome('sections.newsTitle')}
              </h2>
            </div>
            <Button asChild variant="ce-outline">
              <Link href="/blog">{tHome('sections.viewBlog')}</Link>
            </Button>
          </div>

          {latestPosts?.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {latestPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-ce-primary hover:shadow-md"
                >
                  {post.category && (
                    <Badge variant="secondary" className="mb-3">
                      {isVi ? post.category.nameVi : post.category.nameEn}
                    </Badge>
                  )}
                  <div className="text-lg font-bold text-ce-primary-900">
                    {isVi ? post.titleVi : post.titleEn}
                  </div>
                  <div className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {isVi ? post.excerptVi : post.excerptEn}
                  </div>
                  <div className="mt-4 text-sm font-medium text-ce-primary">
                    {tHome('sections.readMore')}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="rounded-xl">
              <CardContent className="p-6 text-sm text-muted-foreground">
                {tHome('sections.postsEmptyHint')}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />
    </>
  );
}
