import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const ITEMS_PER_PAGE = 24;

// GET /api/media - List media assets
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const folder = searchParams.get('folder');
    const mimeType = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1', 10);

    const where: Record<string, unknown> = {};

    if (q) {
      // SQLite doesn't support mode: 'insensitive'
      where.OR = [
        { fileName: { contains: q } },
        { altText: { contains: q } },
        { caption: { contains: q } },
      ];
    }

    if (folder) {
      where.folder = folder;
    }

    if (mimeType) {
      where.mimeType = { startsWith: mimeType };
    }

    const skip = (page - 1) * ITEMS_PER_PAGE;

    const [assets, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: ITEMS_PER_PAGE,
      }),
      prisma.mediaAsset.count({ where }),
    ]);

    return NextResponse.json({
      assets,
      total,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}
