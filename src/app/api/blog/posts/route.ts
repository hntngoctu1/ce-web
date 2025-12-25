import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { BlogPostStatus, Prisma } from '@prisma/client';
import { logAudit } from '@/lib/audit-log';
import { createBlogPostSchema, generateSlug, validate } from '@/lib/validation';

const ITEMS_PER_PAGE = 20;

// GET /api/blog/posts - List posts with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as BlogPostStatus | null;
    const categoryId = searchParams.get('category');
    const authorId = searchParams.get('author');
    const featured = searchParams.get('featured');
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sort = searchParams.get('sort') || 'newest';

    const where: Prisma.BlogPostWhereInput = {};

    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (featured === 'true') where.isFeatured = true;

    if (q) {
      // Note: SQLite doesn't support mode: 'insensitive'
      where.OR = [
        { titleEn: { contains: q } },
        { titleVi: { contains: q } },
        { slug: { contains: q } },
      ];
    }

    const orderBy: Prisma.BlogPostOrderByWithRelationInput =
      sort === 'oldest'
        ? { createdAt: 'asc' }
        : sort === 'updated'
          ? { updatedAt: 'desc' }
          : sort === 'published'
            ? { publishedAt: 'desc' }
            : { createdAt: 'desc' };

    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Count posts by status using simple count queries (avoids groupBy issues)
    const [posts, total, draftCount, reviewCount, scheduledCount, publishedCount, archivedCount] =
      await Promise.all([
        prisma.blogPost.findMany({
          where,
          include: {
            category: { select: { id: true, nameEn: true, nameVi: true } },
            author: { select: { id: true, name: true, email: true } },
            coverMedia: { select: { id: true, url: true } },
            translations: { select: { locale: true, title: true, slug: true } },
            _count: { select: { revisions: true } },
          },
          orderBy,
          skip,
          take: ITEMS_PER_PAGE,
        }),
        prisma.blogPost.count({ where }),
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
    };

    return NextResponse.json({
      posts,
      total,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
      currentPage: page,
      statusCounts: counts,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/blog/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Auto-generate slug if not provided
    if (!body.slug && body.titleEn) {
      body.slug = generateSlug(body.titleEn);
    }

    // Validate input
    const validation = validate(createBlogPostSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const {
      titleEn,
      titleVi,
      slug,
      excerptEn,
      excerptVi,
      categoryId,
      coverImage,
      coverImageId,
      isFeatured,
      visibility,
      translations,
    } = validation.data!;

    // Check slug uniqueness on base post
    const existingSlug = await prisma.blogPost.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug already exists. Please choose a different one.' },
        { status: 400 }
      );
    }

    // Validate translation slugs uniqueness per locale
    if (translations && Array.isArray(translations)) {
      for (const t of translations) {
        const existingTranslation = await prisma.blogPostTranslation.findUnique({
          where: { slug_locale: { slug: t.slug, locale: t.locale } },
        });
        if (existingTranslation) {
          return NextResponse.json(
            { error: `Slug "${t.slug}" already exists for ${t.locale.toUpperCase()}` },
            { status: 400 }
          );
        }
      }
    }

    // Create post with translations
    const post = await prisma.blogPost.create({
      data: {
        titleEn,
        titleVi: titleVi || titleEn,
        slug,
        excerptEn,
        excerptVi,
        categoryId: categoryId || null,
        coverImage: coverImage || undefined,
        coverImageId: coverImageId || null,
        isFeatured: isFeatured || false,
        visibility: visibility || 'PUBLIC',
        status: 'DRAFT',
        authorId: session.user.id,
        translations: translations?.length
          ? {
              create: translations.map((t) => ({
                locale: t.locale,
                title: t.title,
                slug: t.slug,
                excerpt: t.excerpt,
                contentJson: t.contentJson,
                contentHtml: t.contentHtml,
                seoTitle: t.seoTitle,
                seoDescription: t.seoDescription,
                seoKeywords: t.seoKeywords,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        author: { select: { id: true, name: true } },
        translations: true,
      },
    });

    // Audit log
    await logAudit(
      'blog.create',
      session.user.id,
      'BlogPost',
      post.id,
      {
        title: titleEn,
        slug,
      },
      request
    );

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
