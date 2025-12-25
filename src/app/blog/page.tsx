import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { toBCP47Locale } from '@/lib/i18n/locale';
import { HeroSection } from '@/components/sections/hero-section';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBlogCoverFallback } from '@/lib/placeholders';

export const metadata: Metadata = {
  title: 'Blog & Insights - Creative Engineering',
  description: 'Latest news, insights, and case studies from Creative Engineering.',
};

interface BlogPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

async function getBlogData(searchParams: { category?: string }) {
  try {
    const where: Record<string, unknown> = { isPublished: true };
    if (searchParams.category) {
      where.category = { slug: searchParams.category };
    }

    const [posts, categories] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          category: true,
          author: { select: { name: true } },
        },
        orderBy: { publishedAt: 'desc' },
        take: 12,
      }),
      prisma.blogCategory.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
    ]);

    return { posts, categories };
  } catch (error) {
    console.error('Database connection error:', error);
    return { posts: [], categories: [] };
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const locale = await getLocale();
  const fmtLocale = toBCP47Locale(locale);
  const t = await getTranslations('blog');
  const params = await searchParams;
  const { posts, categories } = await getBlogData(params);
  const activeCategory = params.category
    ? categories.find((c) => c.slug === params.category)
    : undefined;
  const isVi = locale.toLowerCase().startsWith('vi');

  return (
    <>
      <HeroSection title={t('title')} subtitle={t('subtitle')} size="small" align="center" />

      <section className="ce-section">
        <div className="ce-container">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Main Content */}
            <div className="flex-1">
              {activeCategory && (
                <div className="mb-6 rounded-lg border bg-ce-neutral-20 p-4 text-sm">
                  <span className="font-medium">{t('filtering')}</span>{' '}
                  <span className="font-semibold text-ce-primary">
                    {isVi ? activeCategory.nameVi : activeCategory.nameEn}
                  </span>{' '}
                  <Link href="/blog" className="ml-2 underline hover:text-ce-primary">
                    {t('clearFilter')}
                  </Link>
                </div>
              )}
              {posts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {posts.map((post) => {
                    const title = isVi ? post.titleVi : post.titleEn;
                    const excerpt = isVi ? post.excerptVi : post.excerptEn;
                    const categoryName = post.category
                      ? isVi
                        ? post.category.nameVi
                        : post.category.nameEn
                      : null;

                    return (
                      <Card key={post.id} className="group overflow-hidden">
                        {/* Cover Image */}
                        <div className="relative aspect-video overflow-hidden bg-ce-neutral-20">
                          <Image
                            src={post.coverImage || getBlogCoverFallback(post.slug)}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          {categoryName && (
                            <Badge className="absolute left-3 top-3" variant="ce">
                              {categoryName}
                            </Badge>
                          )}
                        </div>

                        <CardHeader>
                          <Link href={`/blog/${post.slug}`}>
                            <h2 className="line-clamp-2 text-xl font-bold transition-colors group-hover:text-ce-primary">
                              {title}
                            </h2>
                          </Link>
                        </CardHeader>

                        <CardContent>
                          {excerpt && (
                            <p className="line-clamp-3 text-sm text-muted-foreground">{excerpt}</p>
                          )}
                        </CardContent>

                        <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {post.publishedAt ? formatDate(post.publishedAt, fmtLocale) : '-'}
                            </span>
                            {post.author?.name && (
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {post.author.name}
                              </span>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border bg-card py-12 text-center">
                  <p className="text-muted-foreground">{t('noPosts')}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-full shrink-0 lg:w-72">
              <div className="sticky top-24 space-y-6">
                {/* Categories */}
                <Card>
                  <CardHeader>
                    <h3 className="font-bold">{t('categories')}</h3>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/blog?category=${category.slug}`}
                        className={cn(
                          'block rounded-md px-3 py-2 text-sm transition-colors hover:bg-ce-neutral-20',
                          category.slug === params.category &&
                            'bg-ce-neutral-20 font-medium text-ce-primary'
                        )}
                      >
                        {isVi ? category.nameVi : category.nameEn}
                      </Link>
                    ))}
                  </CardContent>
                </Card>

                {/* CTA */}
                <Card className="bg-ce-primary text-white">
                  <CardContent className="p-6">
                    <h3 className="mb-2 text-lg font-bold">{t('needConsultation')}</h3>
                    <p className="mb-4 text-sm text-ce-neutral-40">{t('needConsultationDesc')}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white text-white hover:bg-white hover:text-ce-primary"
                      asChild
                    >
                      <Link href="/contact">
                        {t('contactCta')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
