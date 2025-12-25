import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        images: { orderBy: { order: 'asc' } },
        specs: { orderBy: { order: 'asc' } },
        group: true,
        brand: true,
        industry: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get related products
    const relatedProducts = product.groupId
      ? await prisma.product.findMany({
          where: {
            groupId: product.groupId,
            isActive: true,
            id: { not: product.id },
          },
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
          },
          take: 4,
        })
      : [];

    return NextResponse.json({
      product,
      relatedProducts,
    });
  } catch (error) {
    console.error('Product API error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
