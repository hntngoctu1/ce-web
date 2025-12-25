import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const warehouseId = searchParams.get('warehouseId') || undefined;
  const q = searchParams.get('q') || undefined;
  const status = searchParams.get('status') || undefined; // low_stock | out_of_stock
  const page = parseInt(searchParams.get('page') || '1', 10);
  const take = parseInt(searchParams.get('pageSize') || '20', 10);
  const skip = (page - 1) * take;

  const where: Prisma.InventoryItemWhereInput = {};
  if (warehouseId) where.warehouseId = warehouseId;
  if (q) {
    where.product = {
      OR: [
        { nameEn: { contains: q, mode: 'insensitive' } },
        { nameVi: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ],
    };
  }

  if (status === 'out_of_stock') {
    where.availableQty = { lte: new Prisma.Decimal(0) };
  }
  if (status === 'low_stock') {
    where.AND = [
      { availableQty: { gt: new Prisma.Decimal(0) } },
      { reorderPointQty: { gt: new Prisma.Decimal(0) } },
      {
        availableQty: {
          lt: Prisma.Decimal.max(new Prisma.Decimal(0), new Prisma.Decimal('999999999')),
        },
      },
    ];
  }

  const [items, total] = await prisma.$transaction([
    prisma.inventoryItem.findMany({
      where,
      include: {
        product: {
          select: { id: true, nameEn: true, sku: true, brandId: true },
        },
        warehouse: { select: { id: true, code: true, name: true } },
        location: { select: { id: true, code: true, name: true } },
      },
      orderBy: [{ updatedAt: 'desc' }],
      skip,
      take,
    }),
    prisma.inventoryItem.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    pageSize: take,
    totalPages: Math.ceil(total / take),
  });
}
