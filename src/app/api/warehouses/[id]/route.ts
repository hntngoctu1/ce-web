import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export async function PATCH(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await _.json();
    const data = updateSchema.parse(body);

    const warehouse = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.warehouse.updateMany({ data: { isDefault: false } });
      }

      return tx.warehouse.update({
        where: { id: params.id },
        data: {
          name: data.name ?? undefined,
          address: data.address ?? undefined,
          isDefault: data.isDefault ?? undefined,
        },
      });
    });

    return NextResponse.json({ warehouse });
  } catch (error) {
    console.error('Update warehouse error', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to update warehouse' }, { status: 500 });
  }
}
