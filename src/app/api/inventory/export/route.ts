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
  const status = searchParams.get('status') || undefined;

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
  if (status === 'low_stock') {
    where.AND = [
      { availableQty: { gt: new Prisma.Decimal(0) } },
      { reorderPointQty: { gt: new Prisma.Decimal(0) } },
      { availableQty: { lt: new Prisma.Decimal(1000000000) } },
    ];
  }

  const items = await prisma.inventoryItem.findMany({
    where,
    include: {
      product: { select: { nameEn: true, sku: true } },
      warehouse: { select: { code: true, name: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 5000,
  });

  const headers = [
    'Product',
    'SKU',
    'Warehouse',
    'OnHand',
    'Reserved',
    'Available',
    'ReorderPoint',
    'ReorderQty',
    'UpdatedAt',
  ];

  const escape = (val: unknown) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = items.map((i) =>
    [
      i.product.nameEn,
      i.product.sku ?? '',
      `${i.warehouse.code} - ${i.warehouse.name}`,
      i.onHandQty,
      i.reservedQty,
      i.availableQty,
      i.reorderPointQty,
      i.reorderQty,
      i.updatedAt.toISOString(),
    ]
      .map(escape)
      .join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="inventory.csv"',
    },
  });
}
