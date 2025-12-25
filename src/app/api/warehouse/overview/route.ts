import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [inventoryAgg, lowCount, outCount, movementToday] = await Promise.all([
    prisma.inventoryItem.aggregate({
      _sum: {
        onHandQty: true,
        reservedQty: true,
        availableQty: true,
      },
    }),
    prisma.inventoryItem.count({
      where: {
        availableQty: { gt: new Prisma.Decimal(0) },
        reorderPointQty: { gt: new Prisma.Decimal(0) },
        availableQty: { lt: new Prisma.Decimal(1000000000) },
      },
    }),
    prisma.inventoryItem.count({
      where: { availableQty: { lte: new Prisma.Decimal(0) } },
    }),
    prisma.stockMovement.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  return NextResponse.json({
    totals: {
      onHand: inventoryAgg._sum.onHandQty || 0,
      reserved: inventoryAgg._sum.reservedQty || 0,
      available: inventoryAgg._sum.availableQty || 0,
    },
    lowStock: lowCount,
    outOfStock: outCount,
    movementsToday: movementToday,
  });
}
