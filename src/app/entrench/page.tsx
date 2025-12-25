import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { HeroSection } from '@/components/sections/hero-section';
import { ContactSection } from '@/components/sections/contact-section';
import { Shield, Clock, HeartHandshake, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Entrench - Creative Engineering',
  description:
    'Built to last, designed for the future. Our solutions are engineered for durability and long-term performance.',
};

async function getEntrenchData() {
  const fallbackHero = {
    titleEn: 'ENTRENCH',
    titleVi: 'BỀN VỮNG',
    subtitleEn: 'Built to Last, Designed for the Future',
    subtitleVi: 'Xây dựng để Tồn tại, Thiết kế cho Tương lai',
    contentEn:
      'Our solutions are engineered for durability and long-term performance. We provide continuous support and maintenance to ensure your operations run smoothly for years to come.',
    contentVi:
      'Các giải pháp của chúng tôi được thiết kế cho độ bền và hiệu suất lâu dài. Chúng tôi cung cấp hỗ trợ và bảo trì liên tục để đảm bảo hoạt động của bạn suôn sẻ trong nhiều năm.',
    imageUrl: null as string | null,
  };

  if (!process.env.DATABASE_URL) {
    return { heroSection: fallbackHero };
  }

  try {
    const heroSection = await prisma.pageSection.findFirst({
      where: { page: 'entrench', sectionType: 'HERO' },
    });

    return { heroSection: heroSection || fallbackHero };
  } catch (error) {
    console.error('Entrench data error, using fallback:', error);
    return { heroSection: fallbackHero };
  }
}

const commitments = [
  {
    icon: Shield,
    titleEn: 'Quality Guarantee',
    titleVi: 'Bảo đảm Chất lượng',
    descEn:
      'All our products meet strict international quality standards with comprehensive warranties.',
    descVi:
      'Tất cả sản phẩm của chúng tôi đáp ứng các tiêu chuẩn chất lượng quốc tế nghiêm ngặt với bảo hành toàn diện.',
  },
  {
    icon: Clock,
    titleEn: '24/7 Support',
    titleVi: 'Hỗ trợ 24/7',
    descEn: 'Our technical team is available around the clock to address any issues or questions.',
    descVi:
      'Đội ngũ kỹ thuật của chúng tôi luôn sẵn sàng suốt ngày đêm để giải quyết mọi vấn đề hoặc câu hỏi.',
  },
  {
    icon: HeartHandshake,
    titleEn: 'Long-term Partnership',
    titleVi: 'Đối tác Lâu dài',
    descEn: 'We build lasting relationships with our clients, growing together over the years.',
    descVi:
      'Chúng tôi xây dựng mối quan hệ lâu dài với khách hàng, cùng nhau phát triển qua nhiều năm.',
  },
  {
    icon: TrendingUp,
    titleEn: 'Continuous Improvement',
    titleVi: 'Cải tiến Liên tục',
    descEn: 'Regular reviews and updates ensure your solutions stay optimized and current.',
    descVi:
      'Đánh giá và cập nhật thường xuyên đảm bảo các giải pháp của bạn luôn được tối ưu và cập nhật.',
  },
];

const stats = [
  { value: '25+', labelEn: 'Years of Experience', labelVi: 'Năm Kinh nghiệm' },
  { value: '500+', labelEn: 'Active Clients', labelVi: 'Khách hàng Hoạt động' },
  { value: '98%', labelEn: 'Client Retention', labelVi: 'Tỷ lệ Giữ chân' },
  { value: '24/7', labelEn: 'Support Available', labelVi: 'Hỗ trợ Sẵn sàng' },
];

export default async function EntrenchPage() {
  const locale = await getLocale();
  const t = await getTranslations('pages.entrench');
  const { heroSection } = await getEntrenchData();

  const isVi = locale.toLowerCase().startsWith('vi');
  const heroTitle = isVi ? heroSection?.titleVi : heroSection?.titleEn;
  const heroSubtitle = isVi ? heroSection?.subtitleVi : heroSection?.subtitleEn;
  const heroDescription = isVi ? heroSection?.contentVi : heroSection?.contentEn;

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title={heroTitle || 'ENTRENCH'}
        subtitle={heroSubtitle || 'Built to Last, Designed for the Future'}
        description={
          heroDescription ||
          'Our solutions are engineered for durability and long-term performance. We provide continuous support and maintenance to ensure your operations run smoothly for years to come.'
        }
        backgroundImage={heroSection?.imageUrl || undefined}
        size="large"
        align="center"
      />

      {/* Stats Section */}
      <section className="bg-ce-primary py-12">
        <div className="ce-container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="animate-fade-up text-center text-white"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl font-heavy md:text-5xl">{stat.value}</div>
                <div className="mt-2 text-sm text-ce-neutral-40">
                  {isVi ? stat.labelVi : stat.labelEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitments Section */}
      <section className="ce-section">
        <div className="ce-container">
          <div className="mb-12 text-center">
            <h2 className="ce-heading mb-4 text-3xl">{t('commitmentsTitle')}</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">{t('commitmentsSubtitle')}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {commitments.map((commitment, index) => (
              <div
                key={index}
                className="group flex animate-fade-up gap-4 rounded-lg border border-transparent bg-white p-6 shadow-sm transition-all duration-300 hover:border-ce-primary hover:shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-ce-primary/10 transition-colors group-hover:bg-ce-primary">
                  <commitment.icon className="h-7 w-7 text-ce-primary transition-colors group-hover:text-white" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold">
                    {isVi ? commitment.titleVi : commitment.titleEn}
                  </h3>
                  <p className="text-muted-foreground">
                    {isVi ? commitment.descVi : commitment.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="ce-section ce-circle-pattern bg-ce-neutral-20">
        <div className="ce-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="ce-heading mb-6 text-3xl">{t('trustTitle')}</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">{t('trustSubtitle')}</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />
    </>
  );
}
