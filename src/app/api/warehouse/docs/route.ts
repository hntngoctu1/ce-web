import { NextRequest, NextResponse } from 'next/server';
import { Prisma, StockDocumentStatus, StockDocumentType } from '@prisma/client';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ensureDefaultWarehouse, generateDocumentCode } from '@/lib/warehouse';

const lineSchema = z.object({
  productId: z.string().min(1),
  qty: z.number(), // Allow negative for adjustment OUT
  sourceLocationId: z.string().optional().nullable(),
  targetLocationId: z.string().optional().nullable(),
  direction: z.enum(['IN', 'OUT']).optional(), // For ADJUSTMENT type
});

const createDocSchema = z.object({
  type: z.enum(['GRN', 'ISSUE', 'ADJUSTMENT', 'TRANSFER']),
  warehouseId: z.string().optional(),
  targetWarehouseId: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  lines: z.array(lineSchema).min(1),
}).refine(
  (data) => {
    // For non-ADJUSTMENT types, qty must be positive
    if (data.type !== 'ADJUSTMENT') {
      return data.lines.every((line) => line.qty > 0);
    }
    // For ADJUSTMENT, qty can be any non-zero value
    return data.lines.every((line) => line.qty !== 0);
  },
  { message: 'Quantity must be valid for the document type' }
);

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || undefined;
  const status = searchParams.get('status') || undefined;
  const q = searchParams.get('q') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const take = parseInt(searchParams.get('pageSize') || '20', 10);
  const skip = (page - 1) * take;

  const where: Prisma.StockDocumentWhereInput = {};
  if (type) where.type = type as StockDocumentType;
  if (status) where.status = status as StockDocumentStatus;
  if (q) {
    where.OR = [
      { code: { contains: q } },
      { note: { contains: q } },
    ];
  }

  const [docs, total] = await prisma.$transaction([
    prisma.stockDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        warehouse: true,
        targetWarehouse: true,
        lines: {
          include: { product: { select: { id: true, nameEn: true, sku: true } } },
        },
      },
    }),
    prisma.stockDocument.count({ where }),
  ]);

  return NextResponse.json({
    docs,
    total,
    page,
    pageSize: take,
    totalPages: Math.ceil(total / take),
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const data = createDocSchema.parse(json);

    const warehouse = data.warehouseId
      ? await prisma.warehouse.findUnique({ where: { id: data.warehouseId } })
      : await ensureDefaultWarehouse(prisma);

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 400 });
    }

    let targetWarehouseId: string | null = null;
    if (data.type === 'TRANSFER') {
      if (!data.targetWarehouseId) {
        return NextResponse.json(
          { error: 'Target warehouse is required for TRANSFER' },
          { status: 400 }
        );
      }
      const target = await prisma.warehouse.findUnique({ where: { id: data.targetWarehouseId } });
      if (!target)
        return NextResponse.json({ error: 'Target warehouse not found' }, { status: 400 });
      if (target.id === warehouse.id) {
        return NextResponse.json(
          { error: 'Source and target warehouse must differ' },
          { status: 400 }
        );
      }
      targetWarehouseId = target.id;
    }

    const code = generateDocumentCode(data.type);

    const doc = await prisma.stockDocument.create({
      data: {
        code,
        type: data.type,
        status: 'DRAFT',
        warehouseId: warehouse.id,
        targetWarehouseId,
        note: data.note || null,
        createdBy: session.user.id,
        lines: {
          create: data.lines.map((line) => {
            // For ADJUSTMENT, use absolute qty value, direction determines sign
            const absQty = Math.abs(line.qty);
            // Store direction as part of metadata or derive from signed qty
            const effectiveDirection = line.direction || (line.qty >= 0 ? 'IN' : 'OUT');
            
            return {
              productId: line.productId,
              qty: new Prisma.Decimal(absQty),
              skuSnapshot: '',
              nameSnapshot: '',
              sourceLocationId: line.sourceLocationId || null,
              targetLocationId: line.targetLocationId || null,
              // Store direction in metadata JSON field if available
              // or use the sign of qty in post route
              metadata: data.type === 'ADJUSTMENT' ? { direction: effectiveDirection } : undefined,
            };
          }),
        },
      },
      include: { lines: true },
    });

    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (error) {
    console.error('Create stock document error', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
