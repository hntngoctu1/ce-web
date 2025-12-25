import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { IndustriesHero } from '@/components/industries/industries-hero';
import { IndustriesGrid } from '@/components/industries/industries-grid';
import { IndustriesUseCases } from '@/components/industries/industries-use-cases';
import { ContactSection } from '@/components/sections/contact-section';
import { PartnersSection } from '@/components/sections/partners-section';

export const metadata: Metadata = {
  title: 'Industrial Solutions - Creative Engineering',
  description:
    'Explore 13 specialized industrial solutions including tapes, adhesives, coatings, robotic dispensing, and more. Your trusted partner since 1999.',
};

export default async function IndustrialPage() {
  const locale = await getLocale();
  const tHome = await getTranslations('home');
  const isVi = (locale || '').toLowerCase().startsWith('vi');

  // Fallback partners for section
  const partnersData = [
    { id: 'henkel', name: 'Henkel', logoUrl: null },
    { id: 'tesa', name: 'Tesa', logoUrl: null },
    { id: 'graco', name: 'Graco', logoUrl: null },
    { id: '3m', name: '3M', logoUrl: null },
  ];

  return (
    <>
      {/* Hero Section - Premium Industrial Design */}
      <IndustriesHero />

      {/* Industries Grid with Filters */}
      <IndustriesGrid showFilters />

      {/* Trust Indicators */}
      <section className="border-y bg-white py-16">
        <div className="ce-container">
          {/* Brand Header */}
          <div className="mb-10 flex items-center justify-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-ce-gradient shadow-lg">
              <span className="text-xl font-bold text-white">CE</span>
            </div>
            <div>
              <div className="text-xl font-bold text-ce-primary-800">Creative Engineering</div>
              <div className="text-sm text-muted-foreground">
                {isVi ? 'Đối tác công nghiệp đáng tin cậy từ 1999' : 'Your Trusted Industrial Partner Since 1999'}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl bg-gradient-to-br from-ce-primary-50 to-ce-primary-100/50 p-6 text-center">
              <div className="text-4xl font-bold text-ce-primary">25+</div>
              <div className="mt-1 text-sm font-medium text-ce-primary-700">
                {isVi ? 'Năm kinh nghiệm' : 'Years Experience'}
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-ce-accent-teal/10 to-ce-accent-teal/20 p-6 text-center">
              <div className="text-4xl font-bold text-ce-accent-teal">13</div>
              <div className="mt-1 text-sm font-medium text-ce-primary-700">
                {isVi ? 'Ngành hàng chuyên biệt' : 'Specialized Industries'}
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-ce-accent-gold/10 to-ce-accent-gold/20 p-6 text-center">
              <div className="text-4xl font-bold text-ce-accent-gold">500+</div>
              <div className="mt-1 text-sm font-medium text-ce-primary-700">
                {isVi ? 'Đối tác doanh nghiệp' : 'Business Partners'}
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-ce-accent-coral/10 to-ce-accent-coral/20 p-6 text-center">
              <div className="text-4xl font-bold text-ce-accent-coral">1000+</div>
              <div className="mt-1 text-sm font-medium text-ce-primary-700">
                {isVi ? 'Sản phẩm công nghiệp' : 'Industrial Products'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Use Cases */}
      <IndustriesUseCases variant="grid" limit={6} />

      {/* Partners */}
      <PartnersSection
        partners={partnersData}
        title={tHome('partnersTitle')}
        subtitle={tHome('partnersSubtitle')}
      />

      {/* Contact Section */}
      <ContactSection />
    </>
  );
}
