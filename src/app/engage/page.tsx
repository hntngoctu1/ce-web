import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { HeroSection } from '@/components/sections/hero-section';
import { ContactSection } from '@/components/sections/contact-section';
import { MessageSquare, Lightbulb, Wrench, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Engage - Creative Engineering',
  description:
    'From concept to reality. We work closely with clients to implement innovative industrial solutions.',
};

async function getEngageData() {
  const fallbackHero = {
    titleEn: 'ENGAGE',
    titleVi: 'HỢP TÁC',
    subtitleEn: 'From Concept to Reality',
    subtitleVi: 'Từ Ý tưởng đến Thực tế',
    contentEn:
      'We work closely with our clients from the initial idea through to full implementation, ensuring every solution meets your unique requirements.',
    contentVi:
      'Chúng tôi làm việc chặt chẽ với khách hàng từ ý tưởng ban đầu đến triển khai hoàn chỉnh, đảm bảo mọi giải pháp đáp ứng yêu cầu riêng của bạn.',
    imageUrl: null as string | null,
  };

  if (!process.env.DATABASE_URL) {
    return { heroSection: fallbackHero };
  }

  try {
    const heroSection = await prisma.pageSection.findFirst({
      where: { page: 'engage', sectionType: 'HERO' },
    });

    return { heroSection: heroSection || fallbackHero };
  } catch (error) {
    console.error('Engage data error, using fallback:', error);
    return { heroSection: fallbackHero };
  }
}

const processSteps = [
  {
    icon: MessageSquare,
    step: '01',
    titleEn: 'Consultation',
    titleVi: 'Tư vấn',
    descEn:
      'We start by understanding your unique challenges and requirements through in-depth consultation.',
    descVi:
      'Chúng tôi bắt đầu bằng việc hiểu các thách thức và yêu cầu riêng của bạn thông qua tư vấn chuyên sâu.',
  },
  {
    icon: Lightbulb,
    step: '02',
    titleEn: 'Solution Design',
    titleVi: 'Thiết kế Giải pháp',
    descEn:
      'Our experts design customized solutions tailored to your specific industry and application needs.',
    descVi:
      'Các chuyên gia của chúng tôi thiết kế các giải pháp tùy chỉnh phù hợp với ngành và nhu cầu ứng dụng cụ thể của bạn.',
  },
  {
    icon: Wrench,
    step: '03',
    titleEn: 'Implementation',
    titleVi: 'Triển khai',
    descEn:
      'We work alongside your team to implement solutions with minimal disruption to operations.',
    descVi:
      'Chúng tôi làm việc cùng đội ngũ của bạn để triển khai các giải pháp với sự gián đoạn tối thiểu cho hoạt động.',
  },
  {
    icon: CheckCircle,
    step: '04',
    titleEn: 'Optimization',
    titleVi: 'Tối ưu hóa',
    descEn: 'Continuous monitoring and optimization ensure maximum performance and ROI.',
    descVi: 'Giám sát và tối ưu hóa liên tục đảm bảo hiệu suất và ROI tối đa.',
  },
];

export default async function EngagePage() {
  const locale = await getLocale();
  const t = await getTranslations('pages.engage');
  const { heroSection } = await getEngageData();

  const isVi = locale.toLowerCase().startsWith('vi');
  const heroTitle = isVi ? heroSection?.titleVi : heroSection?.titleEn;
  const heroSubtitle = isVi ? heroSection?.subtitleVi : heroSection?.subtitleEn;
  const heroDescription = isVi ? heroSection?.contentVi : heroSection?.contentEn;

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title={heroTitle || 'ENGAGE'}
        subtitle={heroSubtitle || 'From Concept to Reality'}
        description={
          heroDescription ||
          'We work closely with our clients from the initial idea through to full implementation, ensuring every solution meets your unique requirements.'
        }
        backgroundImage={heroSection?.imageUrl || undefined}
        size="large"
        align="center"
      />

      {/* Process Section */}
      <section className="ce-section">
        <div className="ce-container">
          <div className="mb-12 text-center">
            <h2 className="ce-heading mb-4 text-3xl">{t('processTitle')}</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">{t('processSubtitle')}</p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-ce-neutral-40 lg:block" />

            <div className="space-y-12 lg:space-y-0">
              {processSteps.map((step, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col items-center gap-8 lg:flex-row lg:gap-16 ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  } animate-fade-up`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Content */}
                  <div className={`flex-1 ${index % 2 === 1 ? 'lg:text-left' : 'lg:text-right'}`}>
                    <div
                      className={`inline-block rounded-lg bg-white p-8 shadow-lg ${
                        index % 2 === 1 ? '' : 'lg:ml-auto'
                      }`}
                    >
                      <div className="mb-4 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ce-primary/10">
                          <step.icon className="h-6 w-6 text-ce-primary" />
                        </div>
                        <span className="text-4xl font-heavy text-ce-neutral-40">{step.step}</span>
                      </div>
                      <h3 className="mb-3 text-xl font-bold">
                        {isVi ? step.titleVi : step.titleEn}
                      </h3>
                      <p className="text-muted-foreground">{isVi ? step.descVi : step.descEn}</p>
                    </div>
                  </div>

                  {/* Center Circle */}
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-ce-primary text-white shadow-lg lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                    <span className="font-bold">{index + 1}</span>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden flex-1 lg:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ce-section ce-hero-pattern bg-ce-gradient-light">
        <div className="ce-container text-center">
          <h2 className="ce-heading mb-4 text-3xl">{t('ctaTitle')}</h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">{t('ctaSubtitle')}</p>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />
    </>
  );
}
