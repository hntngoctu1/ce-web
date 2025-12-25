import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { logInventoryAudit } from '@/lib/inventory-audit';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN'].includes(session.user.role ?? '')) {
      return NextResponse.json({ error: 'Admin only' }, { status: 401 });
    }

    const { id } = await params;

    const doc = await prisma.stockDocument.findUnique({
      where: { id },
      include: {
        movements: true,
        lines: true,
      },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (doc.status === 'VOID') {
      return NextResponse.json({ error: 'Document already voided' }, { status: 400 });
    }

    if (doc.status === 'DRAFT') {
      // Just mark as void, no movements to reverse
      await prisma.stockDocument.update({
        where: { id },
        data: { status: 'VOID' },
      });

      await logInventoryAudit(prisma, {
        entityType: 'StockDocument',
        entityId: id,
        action: 'VOID_DRAFT',
        after: { status: 'VOID' },
        createdBy: session.user.id,
      });

      return NextResponse.json({ success: true, message: 'Draft voided' });
    }

    // For POSTED documents, we need to reverse the movements
    await prisma.$transaction(async (tx) => {
      // Create reversal movements
      for (const mv of doc.movements) {
        const reversalKey = `void:${mv.idempotencyKey}`;

        // Check if reversal already exists (idempotency)
        const existingReversal = await tx.stockMovement.findUnique({
          where: { idempotencyKey: reversalKey },
        });

        if (existingReversal) continue;

        // Get current inventory
        const inventory = await tx.inventoryItem.findUnique({
          where: {
            productId_warehouseId_locationId: {
              productId: mv.productId,
              warehouseId: mv.warehouseId,
              locationId: mv.locationId ?? null,
            },
          },
        });

        if (!inventory) continue;

        // Calculate reversed quantities
        const reversedOnHand = new Prisma.Decimal(mv.qtyChangeOnHand).neg();
        const reversedReserved = new Prisma.Decimal(mv.qtyChangeReserved).neg();

        const newOnHand = new Prisma.Decimal(inventory.onHandQty).add(reversedOnHand);
        const newReserved = new Prisma.Decimal(inventory.reservedQty).add(reversedReserved);
        const newAvailable = newOnHand.sub(newReserved);

        // Create reversal movement
        await tx.stockMovement.create({
          data: {
            documentId: doc.id,
            lineId: mv.lineId,
            productId: mv.productId,
            warehouseId: mv.warehouseId,
            locationId: mv.locationId,
            movementType: mv.movementType,
            qtyChangeOnHand: reversedOnHand,
            qtyChangeReserved: reversedReserved,
            balanceOnHandAfter: newOnHand,
            balanceReservedAfter: newReserved,
            idempotencyKey: reversalKey,
            createdBy: session.user.id,
          },
        });

        // Update inventory
        await tx.inventoryItem.update({
          where: {
            productId_warehouseId_locationId: {
              productId: mv.productId,
              warehouseId: mv.warehouseId,
              locationId: mv.locationId ?? null,
            },
          },
          data: {
            onHandQty: newOnHand,
            reservedQty: newReserved,
            availableQty: newAvailable,
          },
        });

        // Sync Product.stockQuantity for backward compatibility
        const totalInventory = await tx.inventoryItem.aggregate({
          where: { productId: mv.productId },
          _sum: { availableQty: true },
        });

        await tx.product.update({
          where: { id: mv.productId },
          data: {
            stockQuantity: Number(totalInventory._sum.availableQty || 0),
          },
        });
      }

      // Mark document as void
      await tx.stockDocument.update({
        where: { id },
        data: { status: 'VOID' },
      });
    });

    await logInventoryAudit(prisma, {
      entityType: 'StockDocument',
      entityId: id,
      action: 'VOID_POSTED',
      before: { status: 'POSTED', movementsCount: doc.movements.length },
      after: { status: 'VOID' },
      createdBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Document voided and movements reversed',
    });
  } catch (error) {
    console.error('Void document error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
