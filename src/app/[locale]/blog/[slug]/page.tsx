import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { toBCP47Locale } from '@/lib/i18n/locale';
import { sanitizeRichText } from '@/lib/sanitize-html';
import { renderTiptapHtml } from '@/lib/render-tiptap-html';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Share2,
  Facebook,
  Linkedin,
  Twitter,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getBlogCoverFallback } from '@/lib/placeholders';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string) {
  const post = await prisma.blogPost.findFirst({
    where: {
      slug,
      OR: [{ status: 'PUBLISHED' }, { isPublished: true }],
      visibility: 'PUBLIC',
    },
    include: {
      category: true,
      author: { select: { name: true, image: true } },
      tags: { include: { tag: true } },
      translations: true,
    },
  });

  if (!post) return null;

  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      isPublished: true,
      id: { not: post.id },
      categoryId: post.categoryId,
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    include: { category: true },
  });

  return { post, relatedPosts };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBlogPost(slug);

  if (!data) return { title: 'Post Not Found' };

  const { post } = data;
  const translation = post.translations.find((t) => t.locale === 'en');
  const metaTitle = translation?.title || post.titleEn;
  const metaDescription = translation?.excerpt || post.excerptEn || post.titleEn;
  const ogImage =
    translation?.ogImageId && post.coverImage
      ? post.coverImage
      : post.coverImage || getBlogCoverFallback(post.slug);

  return {
    title: `${metaTitle} - Blog - Creative Engineering`,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription || undefined,
      images: [ogImage],
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.author?.name ? [post.author.name] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const locale = await getLocale();
  const fmtLocale = toBCP47Locale(locale);
  const t = await getTranslations('blog');
  const { slug } = await params;
  const data = await getBlogPost(slug);

  if (!data) notFound();

  const { post, relatedPosts } = data;
  const isVi = locale.toLowerCase().startsWith('vi');

  const translation = post.translations.find((t) => t.locale === (isVi ? 'vi' : 'en'));
  const title = translation?.title || (isVi ? post.titleVi : post.titleEn);
  const rawContentHtml =
    translation?.contentHtml ||
    renderTiptapHtml(translation?.contentJson) ||
    (isVi ? post.contentVi : post.contentEn);
  const content = sanitizeRichText(rawContentHtml);
  const categoryName = post.category ? (isVi ? post.category.nameVi : post.category.nameEn) : null;

  const plainText = (content || '').replace(/<[^>]+>/g, '');
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="min-h-screen bg-background pb-20 pt-8">
      <div className="ce-container mb-8">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-6 pl-0 hover:bg-transparent hover:text-ce-primary"
        >
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToBlog')}
          </Link>
        </Button>

        <div className="mx-auto max-w-4xl text-center">
          {categoryName && (
            <Badge variant="ce" className="mb-4">
              {categoryName}
            </Badge>
          )}

          <h1 className="mb-6 text-3xl font-heavy leading-tight md:text-4xl lg:text-5xl">
            {title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {post.author?.name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium text-foreground">{post.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{post.publishedAt ? formatDate(post.publishedAt, fmtLocale) : '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {readTime} {t('minRead')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="ce-container mb-12">
        <div className="relative mx-auto aspect-video max-w-5xl overflow-hidden rounded-xl bg-ce-neutral-20 shadow-lg">
          <Image
            src={post.coverImage || getBlogCoverFallback(post.slug)}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1280px) 100vw, 1200px"
          />
        </div>
      </div>

      <div className="ce-container">
        <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
          <article className="mx-auto w-full max-w-3xl">
            <div
              className="prose prose-lg prose-ce dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content || '' }}
            />

            {post.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {post.tags.map(({ tag }) => (
                  <Badge key={tag.id} variant="secondary" className="text-sm">
                    #{isVi ? tag.nameVi : tag.nameEn}
                  </Badge>
                ))}
              </div>
            )}

            <Separator className="my-8" />

            <div className="flex items-center justify-between">
              <span className="font-bold">{t('share')}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </article>

          <aside className="space-y-8">
            {post.author && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-bold">{t('aboutAuthor')}</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ce-primary/10">
                      <User className="h-6 w-6 text-ce-primary" />
                    </div>
                    <div>
                      <p className="font-bold">{post.author.name}</p>
                      <p className="text-sm text-muted-foreground">{t('editorRole')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {relatedPosts.length > 0 && (
              <div>
                <h3 className="mb-4 border-b pb-2 text-lg font-bold">{t('relatedPosts')}</h3>
                <div className="space-y-4">
                  {relatedPosts.map((related) => (
                    <Link key={related.id} href={`/blog/${related.slug}`} className="group block">
                      <div className="mb-2 aspect-video overflow-hidden rounded-md bg-ce-neutral-20">
                        <Image
                          src={related.coverImage || getBlogCoverFallback(related.slug)}
                          alt={isVi ? related.titleVi : related.titleEn}
                          width={300}
                          height={200}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <h4 className="line-clamp-2 font-medium transition-colors group-hover:text-ce-primary">
                        {isVi ? related.titleVi : related.titleEn}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {related.publishedAt ? formatDate(related.publishedAt, fmtLocale) : '-'}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
