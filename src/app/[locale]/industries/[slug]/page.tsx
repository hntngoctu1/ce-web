import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { industries as staticIndustries } from '@/data/industries';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  PlayCircle,
  BookOpen,
  ExternalLink,
  Phone,
  Mail,
} from 'lucide-react';

type Props = {
  params: Promise<{ slug: string }>;
};

type StaticIndustry = (typeof staticIndustries)[number];
type StaticResource = StaticIndustry['resources'][number];
type ResourceKind = StaticResource['type'];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const industry = staticIndustries.find((i) => i.slug === slug);
  if (!industry) {
    try {
      const cat = await prisma.industryCategory.findUnique({ where: { slug } });
      if (!cat) return { title: 'Not Found' };
      return {
        title: `${cat.nameEn} - Creative Engineering`,
        description: cat.descriptionEn || undefined,
      };
    } catch {
      return { title: 'Not Found' };
    }
  }

  return {
    title: `${industry.name} - Creative Engineering`,
    description: industry.summary,
  };
}

export async function generateStaticParams() {
  return staticIndustries.map((industry) => ({
    slug: industry.slug,
  }));
}

const resourceIcons: Record<ResourceKind, any> = {
  pdf: Download,
  video: PlayCircle,
  guide: BookOpen,
  link: ExternalLink,
};

export default async function IndustryDetailPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const isVi = locale.toLowerCase().startsWith('vi');

  const detail = staticIndustries.find((i) => i.slug === slug);
  let category: {
    slug: string;
    nameEn: string;
    nameVi: string;
    descriptionEn: string | null;
    descriptionVi: string | null;
    imageUrl: string | null;
  } | null = null;
  try {
    category = await prisma.industryCategory.findUnique({
      where: { slug },
      select: {
        slug: true,
        nameEn: true,
        nameVi: true,
        descriptionEn: true,
        descriptionVi: true,
        imageUrl: true,
      },
    });
  } catch {
    category = null;
  }

  if (!detail && !category) return notFound();

  const industry: StaticIndustry =
    detail ||
    ({
      slug,
      name: category?.nameEn || slug,
      nameVi: category?.nameVi || slug,
      summary: category?.descriptionEn || '',
      summaryVi: category?.descriptionVi || '',
      heroImage: category?.imageUrl || '/placeholders/category.svg',
      tags: [],
      tagsVi: [],
      keyOutcomes: [],
      keyOutcomesVi: [],
      useCases: [],
      useCasesVi: [],
      products: [],
      resources: [],
      stats: [],
    } satisfies StaticIndustry);

  const currentIndex = staticIndustries.findIndex((i) => i.slug === slug);
  const prevIndustry = currentIndex > 0 ? staticIndustries[currentIndex - 1] : null;
  const nextIndustry =
    currentIndex < staticIndustries.length - 1 ? staticIndustries[currentIndex + 1] : null;

  const name = isVi ? category?.nameVi || industry.nameVi : category?.nameEn || industry.name;
  const summary = isVi
    ? category?.descriptionVi || industry.summaryVi
    : category?.descriptionEn || industry.summary;
  const tags = isVi ? industry.tagsVi : industry.tags;
  const keyOutcomes = isVi ? industry.keyOutcomesVi : industry.keyOutcomes;
  const useCases = isVi ? industry.useCasesVi : industry.useCases;

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ce-primary-800 via-ce-primary to-ce-primary-600 py-16 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] opacity-10 [background-size:24px_24px]" />
        <div className="pointer-events-none absolute -bottom-1/2 -right-1/4 h-[600px] w-[600px] rounded-full bg-white/5" />

        <div className="ce-container relative">
          {/* Back link */}
          <Link
            href="/industries"
            className="mb-8 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isVi ? 'Tất cả danh mục' : 'All Categories'}</span>
          </Link>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              {/* Tags */}
              <div className="mb-6 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">{name}</h1>
              <p className="text-lg leading-relaxed text-white/85">{summary}</p>

              {/* Stats */}
              {industry.stats && (
                <div className="mt-10 grid grid-cols-3 gap-4">
                  {industry.stats.map((stat, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm"
                    >
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="mt-1 text-xs text-white/70">
                        {isVi ? stat.labelVi : stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CTAs */}
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-ce-primary transition-all hover:bg-white/90 hover:shadow-lg"
                >
                  {isVi ? 'Liên hệ chuyên gia' : 'Talk to specialist'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/menu/product"
                  className="inline-flex items-center justify-center rounded-full border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  {isVi ? 'Xem sản phẩm' : 'View products'}
                </Link>
              </div>
            </div>

            {/* Key Outcomes Card */}
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm lg:p-8">
              <h2 className="mb-6 text-xl font-bold text-white">
                {isVi ? 'Lợi ích chính' : 'Key Outcomes'}
              </h2>
              <ul className="space-y-4">
                {keyOutcomes.map((outcome, i) => (
                  <li key={i} className="flex gap-3 text-white/85">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-ce-accent-teal" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="ce-container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-ce-primary-800">
              {isVi ? 'Ứng dụng' : 'Use Cases'}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {isVi
                ? 'Các ứng dụng phổ biến trong ngành công nghiệp'
                : 'Common applications across industries'}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {useCases.map((useCase, i) => (
              <span
                key={i}
                className="rounded-full border border-ce-primary/20 bg-ce-primary/5 px-4 py-2 text-sm font-medium text-ce-primary-800"
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-ce-neutral-50 py-16 lg:py-24">
        <div className="ce-container">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-ce-primary-800">
                {isVi ? 'Sản phẩm liên quan' : 'Related Products'}
              </h2>
              <p className="text-muted-foreground">
                {isVi
                  ? 'Khám phá các sản phẩm trong danh mục này'
                  : 'Explore products in this category'}
              </p>
            </div>
            <Link
              href="/menu/product"
              className="hidden items-center gap-2 text-sm font-semibold text-ce-primary hover:underline sm:flex"
            >
              {isVi ? 'Xem tất cả' : 'Browse all'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {industry.products.map((product, i) => (
              <Link
                key={i}
                href={product.href}
                className="group flex items-center justify-between rounded-xl border border-black/5 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="font-semibold text-ce-primary-800 group-hover:text-ce-primary">
                  {isVi ? product.titleVi : product.title}
                </span>
                <ArrowRight className="h-5 w-5 text-ce-primary/50 transition-transform group-hover:translate-x-1 group-hover:text-ce-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="ce-container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-ce-primary-800">
              {isVi ? 'Tài liệu & Hướng dẫn' : 'Resources & Guides'}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {isVi
                ? 'Tải xuống tài liệu kỹ thuật và hướng dẫn sử dụng'
                : 'Download technical documents and usage guides'}
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {industry.resources.map((resource, i) => {
              const Icon = resourceIcons[resource.type] || FileText;
              return (
                <Link
                  key={i}
                  href={resource.href}
                  className="bg-ce-neutral-50 group flex items-center gap-4 rounded-xl border border-black/5 p-5 transition-all hover:border-ce-primary/20 hover:bg-white hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ce-primary/10 transition-colors group-hover:bg-ce-primary">
                    <Icon className="h-6 w-6 text-ce-primary transition-colors group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-ce-primary-800">
                      {isVi && resource.titleVi ? resource.titleVi : resource.title}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {resource.type}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-ce-primary/50 transition-transform group-hover:translate-x-1 group-hover:text-ce-primary" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-ce-primary-800 to-ce-primary py-16 lg:py-24">
        <div className="ce-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              {isVi ? 'Cần hỗ trợ kỹ thuật?' : 'Need technical support?'}
            </h2>
            <p className="mb-8 text-lg text-white/80">
              {isVi
                ? `Chia sẻ ứng dụng của bạn - chúng tôi sẽ đề xuất quy trình và sản phẩm phù hợp cho ${name}.`
                : `Share your application - we'll suggest a validated process and products for ${name}.`}
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-ce-primary transition-all hover:bg-white/90 hover:shadow-lg"
              >
                {isVi ? 'Liên hệ ngay' : 'Contact us'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-6 text-sm text-white/70 sm:flex-row">
              <a
                href="tel:+84123456789"
                className="flex items-center justify-center gap-2 hover:text-white"
              >
                <Phone className="h-4 w-4" />
                +84 123 456 789
              </a>
              <a
                href="mailto:info@ce-vietnam.com"
                className="flex items-center justify-center gap-2 hover:text-white"
              >
                <Mail className="h-4 w-4" />
                info@ce-vietnam.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="bg-ce-neutral-50 border-t py-8">
        <div className="ce-container">
          <div className="flex items-center justify-between">
            {prevIndustry ? (
              <Link
                href={`/industries/${prevIndustry.slug}`}
                className="group flex items-center gap-3 text-muted-foreground transition-colors hover:text-ce-primary"
              >
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground/60">
                    {isVi ? 'Trước' : 'Previous'}
                  </div>
                  <div className="font-semibold">
                    {isVi ? prevIndustry.nameVi : prevIndustry.name}
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}

            <Link
              href="/industries"
              className="hidden rounded-full border-2 border-ce-primary/20 px-6 py-2 text-sm font-semibold text-ce-primary transition-colors hover:bg-ce-primary hover:text-white sm:block"
            >
              {isVi ? 'Tất cả danh mục' : 'All Categories'}
            </Link>

            {nextIndustry ? (
              <Link
                href={`/industries/${nextIndustry.slug}`}
                className="group flex items-center gap-3 text-right text-muted-foreground transition-colors hover:text-ce-primary"
              >
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground/60">
                    {isVi ? 'Tiếp theo' : 'Next'}
                  </div>
                  <div className="font-semibold">
                    {isVi ? nextIndustry.nameVi : nextIndustry.name}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
