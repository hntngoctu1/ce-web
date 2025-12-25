import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const schema = z.object({
  items: z
    .array(
      z.object({
        inventoryItemId: z.string().min(1),
        reorderPointQty: z.number().min(0),
        reorderQty: z.number().min(0),
      })
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    await prisma.$transaction(
      data.items.map((item) =>
        prisma.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            reorderPointQty: new Prisma.Decimal(item.reorderPointQty),
            reorderQty: new Prisma.Decimal(item.reorderQty),
          },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('reorder bulk error', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to update reorder' }, { status: 500 });
  }
}
