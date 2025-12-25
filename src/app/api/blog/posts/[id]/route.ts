import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit-log';

// GET /api/blog/posts/:id - Get single post
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, name: true, email: true } },
        coverMedia: true,
        translations: true,
        tags: { include: { tag: true } },
        revisions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { revisions: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// PATCH /api/blog/posts/:id - Update post
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Extract fields to update
    const {
      titleEn,
      titleVi,
      slug,
      excerptEn,
      excerptVi,
      contentEn,
      contentVi,
      categoryId,
      coverImage,
      coverImageId,
      isFeatured,
      visibility,
      status,
      translations,
      wordCount,
      readTimeMin,
    } = body;

    // Check slug uniqueness if changed
    if (slug && slug !== existingPost.slug) {
      const existingSlug = await prisma.blogPost.findUnique({ where: { slug } });
      if (existingSlug) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
      }
    }

    // Update post
    const updateData: Record<string, unknown> = {};

    if (titleEn !== undefined) updateData.titleEn = titleEn;
    if (titleVi !== undefined) updateData.titleVi = titleVi;
    if (slug !== undefined) updateData.slug = slug;
    if (excerptEn !== undefined) updateData.excerptEn = excerptEn;
    if (excerptVi !== undefined) updateData.excerptVi = excerptVi;
    if (contentEn !== undefined) updateData.contentEn = contentEn;
    if (contentVi !== undefined) updateData.contentVi = contentVi;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (coverImageId !== undefined) updateData.coverImageId = coverImageId || null;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (status !== undefined) updateData.status = status;
    if (wordCount !== undefined) updateData.wordCount = wordCount;
    if (readTimeMin !== undefined) updateData.readTimeMin = readTimeMin;

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        author: { select: { id: true, name: true } },
        translations: true,
        coverMedia: true,
      },
    });

    // Update translations if provided
    if (translations && Array.isArray(translations)) {
      for (const t of translations) {
        const existingTranslation = await prisma.blogPostTranslation.findUnique({
          where: { slug_locale: { slug: t.slug, locale: t.locale } },
        });
        if (existingTranslation && existingTranslation.postId !== id) {
          return NextResponse.json(
            { error: `Slug already exists for locale ${t.locale.toUpperCase()}` },
            { status: 400 }
          );
        }

        await prisma.blogPostTranslation.upsert({
          where: {
            postId_locale: { postId: id, locale: t.locale },
          },
          update: {
            title: t.title,
            slug: t.slug,
            excerpt: t.excerpt,
            contentJson: t.contentJson,
            contentHtml: t.contentHtml,
            seoTitle: t.seoTitle,
            seoDescription: t.seoDescription,
            seoKeywords: t.seoKeywords,
            ogImageId: t.ogImageId,
          },
          create: {
            postId: id,
            locale: t.locale,
            title: t.title,
            slug: t.slug,
            excerpt: t.excerpt,
            contentJson: t.contentJson,
            contentHtml: t.contentHtml,
            seoTitle: t.seoTitle,
            seoDescription: t.seoDescription,
            seoKeywords: t.seoKeywords,
            ogImageId: t.ogImageId,
          },
        });
      }
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE /api/blog/posts/:id - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get post info for audit log before deletion
    const post = await prisma.blogPost.findUnique({
      where: { id },
      select: { titleEn: true, slug: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.blogPost.delete({ where: { id } });

    // Audit log
    await logAudit(
      'blog.delete',
      session.user.id,
      'BlogPost',
      id,
      {
        title: post.titleEn,
        slug: post.slug,
      },
      request
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
