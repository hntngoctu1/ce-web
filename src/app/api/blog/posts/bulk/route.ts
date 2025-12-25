import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit-log';

type BulkAction = 'publish' | 'unpublish' | 'archive' | 'delete';

// Validate postIds - must be non-empty strings (CUID format)
function validatePostIds(postIds: unknown): postIds is string[] {
  if (!Array.isArray(postIds)) return false;
  if (postIds.length === 0) return false;
  if (postIds.length > 100) return false; // Limit bulk operations
  return postIds.every((id) => typeof id === 'string' && id.length > 0 && id.length < 50);
}

// POST /api/blog/posts/bulk - Bulk actions on posts
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, postIds } = body as { action: BulkAction; postIds: unknown };

    // Validate action
    const validActions: BulkAction[] = ['publish', 'unpublish', 'archive', 'delete'];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Allowed: publish, unpublish, archive, delete' },
        { status: 400 }
      );
    }

    // Validate postIds
    if (!validatePostIds(postIds)) {
      return NextResponse.json(
        { error: 'Invalid postIds. Must be an array of 1-100 valid IDs' },
        { status: 400 }
      );
    }

    // Only admin can delete
    if (action === 'delete' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admin can delete posts' }, { status: 403 });
    }

    let result: { count: number };

    switch (action) {
      case 'publish':
        // Validate posts have required content before publishing
        const postsToPublish = await prisma.blogPost.findMany({
          where: { id: { in: postIds } },
          select: {
            id: true,
            titleEn: true,
            contentEn: true,
            translations: { select: { contentJson: true } },
          },
        });

        const validPostIds = postsToPublish
          .filter((p) => p.titleEn && (p.contentEn || p.translations.some((t) => t.contentJson)))
          .map((p) => p.id);

        if (validPostIds.length === 0) {
          return NextResponse.json(
            { error: 'No posts can be published. All posts need title and content.' },
            { status: 400 }
          );
        }

        result = await prisma.blogPost.updateMany({
          where: { id: { in: validPostIds } },
          data: {
            status: 'PUBLISHED',
            isPublished: true,
            publishedAt: new Date(),
          },
        });

        if (validPostIds.length < postIds.length) {
          return NextResponse.json({
            success: true,
            action,
            affected: result.count,
            skipped: postIds.length - validPostIds.length,
            message: `${result.count} post(s) published. ${postIds.length - validPostIds.length} skipped (missing title/content).`,
          });
        }
        break;

      case 'unpublish':
        result = await prisma.blogPost.updateMany({
          where: { id: { in: postIds } },
          data: {
            status: 'DRAFT',
            isPublished: false,
          },
        });
        break;

      case 'archive':
        result = await prisma.blogPost.updateMany({
          where: { id: { in: postIds } },
          data: {
            status: 'ARCHIVED',
            isPublished: false,
          },
        });
        break;

      case 'delete':
        result = await prisma.blogPost.deleteMany({
          where: { id: { in: postIds } },
        });
        break;

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    // Audit log
    await logAudit(
      'blog.bulk_action',
      session.user.id,
      'BlogPost',
      undefined,
      {
        action,
        postIds,
        affected: result.count,
      },
      request
    );

    return NextResponse.json({
      success: true,
      action,
      affected: result.count,
      message: `${result.count} post(s) ${action}ed successfully`,
    });
  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json({ error: 'Failed to perform bulk action' }, { status: 500 });
  }
}
