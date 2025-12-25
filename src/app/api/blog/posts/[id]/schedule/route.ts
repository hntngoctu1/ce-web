import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// POST /api/blog/posts/:id/schedule - Schedule post for future publish
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { scheduledAt } = body;

    if (!scheduledAt) {
      return NextResponse.json({ error: 'Scheduled date is required' }, { status: 400 });
    }

    const scheduleDate = new Date(scheduledAt);
    if (scheduleDate <= new Date()) {
      return NextResponse.json({ error: 'Scheduled date must be in the future' }, { status: 400 });
    }

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
        { error: 'Cannot schedule: title and content are required' },
        { status: 400 }
      );
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        status: 'SCHEDULED',
        scheduledAt: scheduleDate,
      },
      include: {
        category: true,
        author: { select: { id: true, name: true } },
        translations: true,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error scheduling post:', error);
    return NextResponse.json({ error: 'Failed to schedule post' }, { status: 500 });
  }
}
