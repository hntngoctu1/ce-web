import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BlogPostsTable } from '@/components/blog/blog-posts-table';
import {
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle,
  Archive,
  Calendar,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { BlogPostStatus, Prisma } from '@prisma/client';

interface BlogPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    category?: string;
    featured?: string;
    page?: string;
    sort?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: FileText },
  REVIEW: { label: 'Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
  SCHEDULED: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Calendar },
  PUBLISHED: { label: 'Published', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  ARCHIVED: { label: 'Archived', color: 'bg-gray-100 text-gray-600', icon: Archive },
};

async function getPosts(params: {
  q?: string;
  status?: string;
  category?: string;
  featured?: string;
  page?: string;
  sort?: string;
}) {
  const page = parseInt(params.page || '1', 10);
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: Prisma.BlogPostWhereInput = {};

  if (params.status) {
    where.status = params.status as BlogPostStatus;
  }
  if (params.category) {
    where.categoryId = params.category;
  }
  if (params.featured === 'true') {
    where.isFeatured = true;
  }
  if (params.q) {
    // Note: SQLite doesn't support mode: 'insensitive', use LIKE which is case-insensitive by default
    where.OR = [
      { titleEn: { contains: params.q } },
      { titleVi: { contains: params.q } },
      { slug: { contains: params.q } },
    ];
  }

  const orderBy: Prisma.BlogPostOrderByWithRelationInput =
    params.sort === 'oldest'
      ? { createdAt: 'asc' }
      : params.sort === 'updated'
        ? { updatedAt: 'desc' }
        : params.sort === 'published'
          ? { publishedAt: 'desc' }
          : { createdAt: 'desc' };

  // Count posts by status using simple count queries (avoids groupBy issues)
  const [
    posts,
    total,
    categories,
    draftCount,
    reviewCount,
    scheduledCount,
    publishedCount,
    archivedCount,
  ] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: {
        category: { select: { id: true, nameEn: true } },
        author: { select: { id: true, name: true } },
        coverMedia: { select: { url: true } },
        _count: { select: { revisions: true } },
      },
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.blogPost.count({ where }),
    prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
    prisma.blogPost.count({ where: { status: 'DRAFT' } }),
    prisma.blogPost.count({ where: { status: 'REVIEW' } }),
    prisma.blogPost.count({ where: { status: 'SCHEDULED' } }),
    prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
    prisma.blogPost.count({ where: { status: 'ARCHIVED' } }),
  ]);

  const counts: Record<string, number> = {
    DRAFT: draftCount,
    REVIEW: reviewCount,
    SCHEDULED: scheduledCount,
    PUBLISHED: publishedCount,
    ARCHIVED: archivedCount,
    ALL: draftCount + reviewCount + scheduledCount + publishedCount + archivedCount,
  };

  return {
    posts,
    total,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    currentPage: page,
    categories,
    statusCounts: counts,
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const { posts, total, totalPages, currentPage, categories, statusCounts } =
    await getPosts(params);

  const buildQuery = (overrides: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    const merged = { ...params, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) qs.set(k, v);
    }
    return qs.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">
            Manage blog content, drafts, scheduling, and publishing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/media">
              <ImageIcon className="mr-2 h-4 w-4" />
              Media
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/blog/ai">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Tools
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/blog/new">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries(statusConfig).map(([key, config]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all hover:shadow-md ${params.status === key ? 'ring-2 ring-ce-primary' : ''}`}
          >
            <Link
              href={`?${buildQuery({ status: params.status === key ? undefined : key, page: undefined })}`}
            >
              <CardContent className="flex items-center gap-3 py-4">
                <config.icon
                  className={`h-6 w-6 ${config.color.includes('emerald') ? 'text-emerald-600' : config.color.includes('amber') ? 'text-amber-600' : config.color.includes('blue') ? 'text-blue-600' : 'text-slate-500'}`}
                />
                <div>
                  <div className="text-xl font-bold">{statusCounts[key] || 0}</div>
                  <div className="text-xs text-muted-foreground">{config.label}</div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <form className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search by title or slug..."
                defaultValue={params.q}
                className="pl-10"
              />
            </div>
            <select
              name="category"
              defaultValue={params.category || ''}
              className="h-10 min-w-[150px] rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameEn}
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={params.sort || ''}
              className="h-10 min-w-[120px] rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="updated">Recently Updated</option>
              <option value="published">Recently Published</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="featured"
                value="true"
                defaultChecked={params.featured === 'true'}
                className="h-4 w-4"
              />
              Featured only
            </label>
            <Button type="submit">Filter</Button>
            <Button type="button" variant="ghost" asChild>
              <Link href="/admin/blog">Reset</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Posts Table with Bulk Actions */}
      <BlogPostsTable
        posts={posts.map((p) => ({
          ...p,
          publishedAt: p.publishedAt?.toISOString() || null,
          scheduledAt: p.scheduledAt?.toISOString() || null,
          createdAt: p.createdAt.toISOString(),
        }))}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
        params={params}
      />
    </div>
  );
}
