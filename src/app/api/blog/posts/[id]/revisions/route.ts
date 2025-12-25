import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

const MAX_REVISIONS = 30;

// GET /api/blog/posts/:id/revisions - Get revision history
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    const revisions = await prisma.blogPostRevision.findMany({
      where: { postId: id, locale },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(revisions);
  } catch (error) {
    console.error('Error fetching revisions:', error);
    return NextResponse.json({ error: 'Failed to fetch revisions' }, { status: 500 });
  }
}

// POST /api/blog/posts/:id/revisions - Create revision (autosave/manual)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { locale, title, excerpt, contentJson, contentHtml, message } = body;

    if (!locale) {
      return NextResponse.json({ error: 'Locale is required' }, { status: 400 });
    }

    // Create new revision
    const revision = await prisma.blogPostRevision.create({
      data: {
        postId: id,
        locale,
        title,
        excerpt,
        snapshotJson: contentJson,
        snapshotHtml: contentHtml,
        message: message || 'Autosave',
        createdBy: session.user.id,
      },
    });

    // Cleanup old revisions (keep only MAX_REVISIONS)
    const revisionCount = await prisma.blogPostRevision.count({
      where: { postId: id, locale },
    });

    if (revisionCount > MAX_REVISIONS) {
      const oldRevisions = await prisma.blogPostRevision.findMany({
        where: { postId: id, locale },
        orderBy: { createdAt: 'asc' },
        take: revisionCount - MAX_REVISIONS,
        select: { id: true },
      });

      await prisma.blogPostRevision.deleteMany({
        where: {
          id: { in: oldRevisions.map((r) => r.id) },
        },
      });
    }

    return NextResponse.json(revision, { status: 201 });
  } catch (error) {
    console.error('Error creating revision:', error);
    return NextResponse.json({ error: 'Failed to create revision' }, { status: 500 });
  }
}
