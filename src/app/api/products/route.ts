import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  group: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  featured: z.enum(['true', 'false']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = querySchema.parse({
      group: searchParams.get('group') || undefined,
      q: searchParams.get('q') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 12,
      featured: searchParams.get('featured') || undefined,
    });

    const skip = (query.page - 1) * query.limit;

    const where: Record<string, unknown> = {
      isActive: true,
    };

    // Filter by group
    if (query.group) {
      const group = await prisma.productGroup.findUnique({
        where: { slug: query.group },
      });
      if (group) {
        where.groupId = group.id;
      }
    }

    // Filter featured
    if (query.featured === 'true') {
      where.isFeatured = true;
    }

    // Search query
    if (query.q) {
      where.OR = [
        { nameEn: { contains: query.q, mode: 'insensitive' } },
        { nameVi: { contains: query.q, mode: 'insensitive' } },
        { shortDescEn: { contains: query.q, mode: 'insensitive' } },
        { shortDescVi: { contains: query.q, mode: 'insensitive' } },
        { sku: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
          group: {
            select: { slug: true, nameEn: true, nameVi: true },
          },
          brand: {
            select: { name: true },
          },
        },
        orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: query.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
