import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Monitor, Tablet, Smartphone, Edit } from 'lucide-react';
import { sanitizeRichText } from '@/lib/sanitize-html';
import { renderTiptapHtml } from '@/lib/render-tiptap-html';

interface PreviewPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locale?: string; device?: string }>;
}

async function getPost(id: string) {
  return prisma.blogPost.findUnique({
    where: { id },
    include: {
      category: true,
      author: { select: { name: true } },
      coverMedia: true,
      translations: true,
    },
  });
}

export default async function BlogPreviewPage({ params, searchParams }: PreviewPageProps) {
  const { id } = await params;
  const { locale = 'en', device = 'desktop' } = await searchParams;

  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  const translation = post.translations.find((t) => t.locale === locale);
  const title =
    translation?.title || (locale === 'vi' ? post.titleVi || post.titleEn : post.titleEn);
  const rawContent =
    translation?.contentHtml ||
    renderTiptapHtml(translation?.contentJson) ||
    (locale === 'vi' ? post.contentVi : post.contentEn);
  const content = sanitizeRichText(rawContent);
  const excerpt =
    translation?.excerpt || (locale === 'vi' ? post.excerptVi || post.excerptEn : post.excerptEn);

  const deviceWidths: Record<string, string> = {
    desktop: 'max-w-4xl',
    tablet: 'max-w-2xl',
    mobile: 'max-w-sm',
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Preview Toolbar */}
      <div className="sticky top-0 z-50 bg-slate-900 px-4 py-2 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-white hover:bg-slate-800" asChild>
              <Link href={`/admin/blog/${id}`}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Editor
              </Link>
            </Button>
            <Badge variant="outline" className="border-slate-600 text-white">
              Preview Mode
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Locale Switcher */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-800 p-1">
              <Link
                href={`?locale=en&device=${device}`}
                className={`rounded px-3 py-1 text-sm ${locale === 'en' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              >
                EN
              </Link>
              <Link
                href={`?locale=vi&device=${device}`}
                className={`rounded px-3 py-1 text-sm ${locale === 'vi' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              >
                VI
              </Link>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-800 p-1">
              <Link
                href={`?locale=${locale}&device=desktop`}
                className={`rounded p-2 ${device === 'desktop' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              >
                <Monitor className="h-4 w-4" />
              </Link>
              <Link
                href={`?locale=${locale}&device=tablet`}
                className={`rounded p-2 ${device === 'tablet' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              >
                <Tablet className="h-4 w-4" />
              </Link>
              <Link
                href={`?locale=${locale}&device=mobile`}
                className={`rounded p-2 ${device === 'mobile' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              >
                <Smartphone className="h-4 w-4" />
              </Link>
            </div>

            <Button variant="ghost" size="sm" className="text-white hover:bg-slate-800" asChild>
              <Link href={`/admin/blog/${id}`}>
                <Edit className="mr-1 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="px-4 py-8">
        <div
          className={`mx-auto overflow-hidden rounded-lg bg-white shadow-2xl ${deviceWidths[device]}`}
        >
          {/* Cover Image */}
          {(post.coverMedia?.url || post.coverImage) && (
            <div className="relative aspect-video">
              <img
                src={post.coverMedia?.url || post.coverImage || ''}
                alt={title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <article className="p-6 md:p-10">
            {/* Category */}
            {post.category && (
              <div className="mb-4">
                <Badge variant="outline" className="border-ce-primary text-ce-primary">
                  {locale === 'vi' ? post.category.nameVi : post.category.nameEn}
                </Badge>
              </div>
            )}

            {/* Title */}
            <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">{title}</h1>

            {/* Meta */}
            <div className="mb-8 flex items-center gap-4 border-b pb-8 text-sm text-muted-foreground">
              {post.author?.name && <span>By {post.author.name}</span>}
              {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
              {post.wordCount && <span>{Math.ceil(post.wordCount / 200)} min read</span>}
            </div>

            {/* Excerpt */}
            {excerpt && (
              <p className="mb-8 text-xl leading-relaxed text-muted-foreground">{excerpt}</p>
            )}

            {/* Content */}
            <div
              className="prose prose-lg prose-headings:text-slate-900 prose-a:text-ce-primary max-w-none"
              dangerouslySetInnerHTML={{ __html: content || '<p>No content yet.</p>' }}
            />
          </article>
        </div>
      </div>
    </div>
  );
}
