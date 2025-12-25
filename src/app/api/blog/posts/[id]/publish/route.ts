import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit-log';

// POST /api/blog/posts/:id/publish - Publish post immediately
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Validate: must have title and content
    if (!post.titleEn || (!post.contentEn && post.translations.length === 0)) {
      return NextResponse.json(
        { error: 'Cannot publish: title and content are required' },
        { status: 400 }
      );
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
        scheduledAt: null,
      },
      include: {
        category: true,
        author: { select: { id: true, name: true } },
        translations: true,
      },
    });

    // Create revision snapshot
    await prisma.blogPostRevision.create({
      data: {
        postId: id,
        locale: 'en',
        title: post.titleEn,
        excerpt: post.excerptEn,
        snapshotJson: post.contentEn,
        message: 'Published',
        createdBy: session.user.id,
      },
    });

    // Audit log
    await logAudit(
      'blog.publish',
      session.user.id,
      'BlogPost',
      id,
      {
        title: post.titleEn,
        slug: post.slug,
      },
      request
    );

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error publishing post:', error);
    return NextResponse.json({ error: 'Failed to publish post' }, { status: 500 });
  }
}
