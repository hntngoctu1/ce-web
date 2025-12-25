import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { HeroSection } from '@/components/sections/hero-section';
import { ContactSection } from '@/components/sections/contact-section';
import { ServiceCarousel } from '@/components/sections/service-carousel';
import { Target, Users, Award, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Envision - Creative Engineering',
  description:
    'Discover our vision for the future of industrial innovation. Creative Engineering has been shaping industry solutions since 1999.',
};

async function getEnvisionData() {
  const fallbackHero = {
    titleEn: 'ENVISION',
    titleVi: 'TẦM NHÌN',
    subtitleEn: 'Shaping the Future of Industrial Innovation',
    subtitleVi: 'Định hình Tương lai của Đổi mới Công nghiệp',
    contentEn:
      'Founded in 1999, Creative Engineering has been at the forefront of industrial innovation, partnering with global leaders like Henkel, Tesa, and Graco to deliver cutting-edge solutions.',
    contentVi:
      'Thành lập năm 1999, Creative Engineering luôn đi đầu trong đổi mới công nghiệp, hợp tác với các nhà lãnh đạo toàn cầu như Henkel, Tesa, và Graco để cung cấp các giải pháp tiên tiến.',
    imageUrl: null as string | null,
  };

  if (!process.env.DATABASE_URL) {
    return { heroSection: fallbackHero, services: [] };
  }

  try {
    const [heroSection, services] = await Promise.all([
      prisma.pageSection.findFirst({
        where: { page: 'envision', sectionType: 'HERO' },
      }),
      prisma.serviceCategory.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
    ]);

    return { heroSection: heroSection || fallbackHero, services };
  } catch (error) {
    console.error('Envision data error, using fallback:', error);
    return { heroSection: fallbackHero, services: [] };
  }
}

const features = [
  {
    icon: Target,
    titleEn: 'Innovation Focus',
    titleVi: 'Tập trung Đổi mới',
    descEn:
      'We constantly push boundaries to develop cutting-edge solutions for industrial challenges.',
    descVi:
      'Chúng tôi không ngừng vượt qua giới hạn để phát triển các giải pháp tiên tiến cho thách thức công nghiệp.',
  },
  {
    icon: Users,
    titleEn: 'Strategic Partnerships',
    titleVi: 'Đối tác Chiến lược',
    descEn: 'Collaborating with global leaders like Henkel, Tesa, and Graco to bring you the best.',
    descVi:
      'Hợp tác với các nhà lãnh đạo toàn cầu như Henkel, Tesa, và Graco để mang đến cho bạn điều tốt nhất.',
  },
  {
    icon: Award,
    titleEn: '25+ Years Experience',
    titleVi: '25+ Năm Kinh nghiệm',
    descEn:
      "Since 1999, we've been trusted by industries across Vietnam for quality and reliability.",
    descVi:
      'Từ năm 1999, chúng tôi đã được các ngành công nghiệp trên khắp Việt Nam tin tưởng về chất lượng và độ tin cậy.',
  },
  {
    icon: Globe,
    titleEn: 'Global Standards',
    titleVi: 'Tiêu chuẩn Toàn cầu',
    descEn: 'Our products and services meet international quality and safety standards.',
    descVi:
      'Sản phẩm và dịch vụ của chúng tôi đáp ứng các tiêu chuẩn chất lượng và an toàn quốc tế.',
  },
];

export default async function EnvisionPage() {
  const locale = await getLocale();
  const t = await getTranslations('pages.envision');
  const { heroSection, services } = await getEnvisionData();

  const isVi = locale.toLowerCase().startsWith('vi');
  const heroTitle = isVi ? heroSection?.titleVi : heroSection?.titleEn;
  const heroSubtitle = isVi ? heroSection?.subtitleVi : heroSection?.subtitleEn;
  const heroDescription = isVi ? heroSection?.contentVi : heroSection?.contentEn;

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title={heroTitle || 'ENVISION'}
        subtitle={heroSubtitle || 'Shaping the Future of Industrial Innovation'}
        description={
          heroDescription ||
          'Founded in 1999, Creative Engineering has been at the forefront of industrial innovation, partnering with global leaders like Henkel, Tesa, and Graco to deliver cutting-edge solutions.'
        }
        backgroundImage={heroSection?.imageUrl || undefined}
        size="large"
        align="center"
      />

      {/* Vision Content */}
      <section className="ce-section">
        <div className="ce-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="ce-heading mb-6 text-3xl">{t('visionTitle')}</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">{t('visionSubtitle')}</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="ce-section ce-circle-pattern bg-ce-neutral-20">
        <div className="ce-container">
          <div className="grid gap-8 md:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group animate-fade-up rounded-lg bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-ce-primary/10 transition-colors group-hover:bg-ce-primary">
                  <feature.icon className="h-7 w-7 text-ce-primary transition-colors group-hover:text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold">
                  {isVi ? feature.titleVi : feature.titleEn}
                </h3>
                <p className="text-muted-foreground">{isVi ? feature.descVi : feature.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services (anchor for mega-menu links) */}
      <div id="services" />
      <ServiceCarousel services={services} className="bg-white" />

      {/* Contact Section */}
      <ContactSection />
    </>
  );
}
