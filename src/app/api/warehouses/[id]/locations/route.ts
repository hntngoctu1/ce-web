import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { writeInventoryAuditLog } from '@/lib/inventory-audit';

const createLocationSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).default('Default'),
  isDefault: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN'].includes(session.user.role ?? '')) {
      return NextResponse.json({ error: 'Admin only' }, { status: 401 });
    }

    const { id } = await params;

    const locations = await prisma.warehouseLocation.findMany({
      where: { warehouseId: id },
      orderBy: [{ isDefault: 'desc' }, { code: 'asc' }],
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN'].includes(session.user.role ?? '')) {
      return NextResponse.json({ error: 'Admin only' }, { status: 401 });
    }

    const { id: warehouseId } = await params;

    // Check warehouse exists
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createLocationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { code, name, isDefault } = parsed.data;

    // Check for duplicate code in same warehouse
    const existing = await prisma.warehouseLocation.findUnique({
      where: { warehouseId_code: { warehouseId, code } },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Location code "${code}" already exists in this warehouse` },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.warehouseLocation.updateMany({
        where: { warehouseId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const location = await prisma.warehouseLocation.create({
      data: {
        warehouseId,
        code,
        name,
        isDefault: isDefault ?? false,
      },
    });

    await writeInventoryAuditLog(prisma, {
      entityType: 'WarehouseLocation',
      entityId: location.id,
      action: 'CREATE',
      after: location,
      createdBy: session.user.id,
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error('Create location error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
