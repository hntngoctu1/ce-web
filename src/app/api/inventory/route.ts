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
        { nameEn: { contains: q } },
        { nameVi: { contains: q } },
        { sku: { contains: q } },
      ],
    };
  }

  if (status === 'out_of_stock') {
    where.availableQty = { lte: new Prisma.Decimal(0) };
  }
  // Note: Prisma doesn't support comparing two columns directly.
  // We fetch items with reorderPointQty > 0 and filter in application code,
  // or use raw SQL. For now, we fetch all with reorderPoint set and let UI filter.
  if (status === 'low_stock') {
    where.AND = [
      { availableQty: { gt: new Prisma.Decimal(0) } },
      { reorderPointQty: { gt: new Prisma.Decimal(0) } },
    ];
    // Post-processing will filter items where availableQty < reorderPointQty
  }

  // For low_stock, we need to fetch more items and filter in memory
  // since Prisma doesn't support column-to-column comparison
  const isLowStockFilter = status === 'low_stock';
  const fetchLimit = isLowStockFilter ? take * 10 : take; // Fetch more for filtering
  const fetchSkip = isLowStockFilter ? 0 : skip;

  const [rawItems, rawTotal] = await prisma.$transaction([
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
      skip: fetchSkip,
      take: fetchLimit,
    }),
    prisma.inventoryItem.count({ where }),
  ]);

  // Post-processing for low_stock: filter items where availableQty < reorderPointQty
  let items = rawItems;
  let total = rawTotal;

  if (isLowStockFilter) {
    const filtered = rawItems.filter((item) => {
      const available = Number(item.availableQty);
      const reorderPoint = Number(item.reorderPointQty);
      return available < reorderPoint;
    });
    total = filtered.length;
    items = filtered.slice(skip, skip + take);
  }

  return NextResponse.json({
    items,
    total,
    page,
    pageSize: take,
    totalPages: Math.ceil(total / take),
  });
}
