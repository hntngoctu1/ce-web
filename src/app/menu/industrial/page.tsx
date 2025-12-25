import { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { IndustrySlider } from '@/components/industry/industry-slider';
import { ContactSection } from '@/components/sections/contact-section';

export const metadata: Metadata = {
  title: 'Industrial Solutions - Creative Engineering',
  description:
    'Explore our industrial solutions across multiple sectors including electronics, automotive, packaging, and more.',
};

async function getIndustries() {
  try {
    return await prisma.industryCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return [];
  }
}

export default async function IndustrialPage() {
  const locale = await getLocale();
  const industries = await getIndustries();

  return (
    <>
      {/* Industry Slider */}
      <IndustrySlider industries={industries} />

      {/* Contact Section */}
      <ContactSection />
    </>
  );
}
