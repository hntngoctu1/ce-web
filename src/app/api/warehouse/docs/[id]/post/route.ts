import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { applyMovementsWithTransaction } from '@/lib/warehouse';
import { writeInventoryAuditLog } from '@/lib/inventory-audit';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const doc = await prisma.stockDocument.findUnique({
    where: { id: params.id },
    include: { lines: true, warehouse: true },
  });

  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (doc.status === 'POSTED') {
    return NextResponse.json({ document: doc });
  }

  if (doc.lines.length === 0) {
    return NextResponse.json({ error: 'Document has no lines' }, { status: 400 });
  }

  const movements =
    doc.type === 'TRANSFER'
      ? doc.lines.flatMap((line) => {
          const qty = new Prisma.Decimal(line.qty);
          const srcMove = {
            documentId: doc.id,
            lineId: line.id,
            productId: line.productId,
            warehouseId: doc.warehouseId,
            movementType: doc.type,
            qtyChangeOnHand: qty.neg(),
            idempotencyKey: `doc:${doc.id}:line:${line.id}:post:src`,
            createdBy: session.user.id,
          };
          const tgtMove = {
            documentId: doc.id,
            lineId: line.id,
            productId: line.productId,
            warehouseId: doc.targetWarehouseId!,
            movementType: doc.type,
            qtyChangeOnHand: qty,
            idempotencyKey: `doc:${doc.id}:line:${line.id}:post:tgt`,
            createdBy: session.user.id,
          };
          return [srcMove, tgtMove];
        })
      : doc.lines.map((line) => {
          const qty = new Prisma.Decimal(line.qty);
          const movementType = doc.type;
          const qtyChangeOnHand =
            movementType === 'ISSUE' || movementType === 'DEDUCT'
              ? qty.neg()
              : movementType === 'ADJUSTMENT'
                ? qty
                : qty;

          return {
            documentId: doc.id,
            lineId: line.id,
            productId: line.productId,
            warehouseId: doc.warehouseId,
            movementType,
            qtyChangeOnHand,
            idempotencyKey: `doc:${doc.id}:line:${line.id}:post`,
            createdBy: session.user.id,
          };
        });

  try {
    await applyMovementsWithTransaction(prisma, {
      movements,
      allowNegative: doc.type === 'ADJUSTMENT',
    });

    const updated = await prisma.stockDocument.update({
      where: { id: doc.id },
      data: {
        status: 'POSTED',
        postedAt: new Date(),
        postedBy: session.user.id,
      },
      include: { lines: true, warehouse: true, targetWarehouse: true },
    });

    await writeInventoryAuditLog(prisma, {
      entityType: 'stock_document',
      entityId: doc.id,
      action: 'POST',
      before: { status: doc.status },
      after: { status: 'POSTED' },
      createdBy: session.user.id,
    });

    return NextResponse.json({ document: updated });
  } catch (error) {
    console.error('Post document error', error);
    return NextResponse.json(
      { error: 'Failed to post document', details: String(error) },
      { status: 400 }
    );
  }
}
