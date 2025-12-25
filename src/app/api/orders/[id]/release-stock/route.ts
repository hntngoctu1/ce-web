import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { executeOrderStockAction, ensureDefaultWarehouse } from '@/lib/warehouse';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const defaultWarehouse = await ensureDefaultWarehouse(prisma);

    const result = await executeOrderStockAction(prisma, {
      orderId: order.id,
      action: 'RELEASE',
      items: order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        productName: item.productName,
      })),
      warehouseId: defaultWarehouse.id,
      createdBy: session.user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to release stock', details: result.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Stock released successfully',
      applied: result.applied,
      skipped: result.skipped,
    });
  } catch (error) {
    console.error('Release stock error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
