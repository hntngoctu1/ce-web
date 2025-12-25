import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// POST /api/blog/posts/:id/archive - Archive post
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        isPublished: false,
      },
      include: {
        category: true,
        author: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error archiving post:', error);
    return NextResponse.json({ error: 'Failed to archive post' }, { status: 500 });
  }
}
