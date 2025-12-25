import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const groups = await prisma.productGroup.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Product groups API error:', error);
    return NextResponse.json({ error: 'Failed to fetch product groups' }, { status: 500 });
  }
}
