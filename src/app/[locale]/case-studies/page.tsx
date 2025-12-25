import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CaseStudiesClient } from './case-studies-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isVi = locale === 'vi';
  return {
    title: isVi ? 'Nghiên Cứu Điển Hình | Creative Engineering' : 'Case Studies | Creative Engineering',
    description: isVi
      ? 'Khám phá các dự án thành công của Creative Engineering trong nhiều ngành công nghiệp'
      : 'Explore successful projects by Creative Engineering across various industries',
  };
}

export default async function CaseStudiesPage() {
  const t = await getTranslations('caseStudies');
  return <CaseStudiesClient />;
}

