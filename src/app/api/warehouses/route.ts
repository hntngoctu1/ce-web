import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ensureDefaultWarehouse } from '@/lib/warehouse';

const locationSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  isDefault: z.boolean().optional(),
});

const createWarehouseSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  address: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
  locations: z.array(locationSchema).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureDefaultWarehouse(prisma);

  const warehouses = await prisma.warehouse.findMany({
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    include: { locations: true },
  });

  return NextResponse.json({ warehouses });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const data = createWarehouseSchema.parse(json);

    const existingCode = await prisma.warehouse.findUnique({ where: { code: data.code } });
    if (existingCode) {
      return NextResponse.json({ error: 'Code already exists' }, { status: 400 });
    }

    if (data.isDefault) {
      await prisma.warehouse.updateMany({ data: { isDefault: false } });
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        code: data.code,
        name: data.name,
        address: data.address || null,
        isDefault: data.isDefault ?? false,
        locations: data.locations?.length
          ? {
              create: data.locations.map((loc, idx) => ({
                code: loc.code,
                name: loc.name,
                isDefault: idx === 0 ? (loc.isDefault ?? true) : (loc.isDefault ?? false),
              })),
            }
          : undefined,
      },
      include: { locations: true },
    });

    return NextResponse.json({ warehouse }, { status: 201 });
  } catch (error) {
    console.error('Create warehouse error', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create warehouse' }, { status: 500 });
  }
}
