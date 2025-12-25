import { Prisma, PrismaClient, StockDocumentType } from '@prisma/client';
import { nanoid } from 'nanoid';

const DEFAULT_WAREHOUSE_CODE = 'MAIN';

export type StockMovementPlan = {
  documentId: string;
  lineId?: string | null;
  productId: string;
  warehouseId: string;
  locationId?: string | null;
  movementType: StockDocumentType;
  qtyChangeOnHand: Prisma.Decimal;
  qtyChangeReserved?: Prisma.Decimal;
  createdBy?: string | null;
  idempotencyKey: string;
};

export async function ensureDefaultWarehouse(prisma: PrismaClient) {
  const existingDefault = await prisma.warehouse.findFirst({
    where: { isDefault: true },
  });

  if (existingDefault) return existingDefault;

  const existingMain = await prisma.warehouse.findUnique({
    where: { code: DEFAULT_WAREHOUSE_CODE },
  });

  if (existingMain) {
    if (!existingMain.isDefault) {
      return prisma.warehouse.update({
        where: { id: existingMain.id },
        data: { isDefault: true },
      });
    }
    return existingMain;
  }

  return prisma.warehouse.create({
    data: {
      code: DEFAULT_WAREHOUSE_CODE,
      name: 'Main Warehouse',
      isDefault: true,
    },
  });
}

async function getOrCreateInventoryItem(
  tx: Prisma.TransactionClient,
  params: { productId: string; warehouseId: string; locationId?: string | null }
) {
  const { productId, warehouseId, locationId } = params;
  const existing = await tx.inventoryItem.findFirst({
    where: {
      productId,
      warehouseId,
      locationId: locationId ?? null,
    },
  });

  if (existing) return existing;

  return tx.inventoryItem.create({
    data: {
      productId,
      warehouseId,
      locationId: locationId ?? null,
      onHandQty: new Prisma.Decimal(0),
      reservedQty: new Prisma.Decimal(0),
      availableQty: new Prisma.Decimal(0),
    },
  });
}

export async function applyMovementsWithTransaction(
  prisma: PrismaClient,
  {
    movements,
    allowNegative = false,
  }: {
    movements: StockMovementPlan[];
    allowNegative?: boolean;
  }
) {
  return prisma.$transaction(async (tx) => {
    const results = [];

    for (const mv of movements) {
      // Idempotency: if exists, skip
      const existing = await tx.stockMovement.findUnique({
        where: { idempotencyKey: mv.idempotencyKey },
      });
      if (existing) {
        results.push(existing);
        continue;
      }

      const inventory = await getOrCreateInventoryItem(tx, {
        productId: mv.productId,
        warehouseId: mv.warehouseId,
        locationId: mv.locationId ?? undefined,
      });

      const qtyChangeReserved = mv.qtyChangeReserved ?? new Prisma.Decimal(0);
      const newOnHand = new Prisma.Decimal(inventory.onHandQty).add(mv.qtyChangeOnHand);
      const newReserved = new Prisma.Decimal(inventory.reservedQty).add(qtyChangeReserved);
      const newAvailable = new Prisma.Decimal(newOnHand).sub(newReserved);

      if (!allowNegative && (newOnHand.lt(0) || newAvailable.lt(0))) {
        throw new Error('Insufficient stock for movement');
      }

      const movement = await tx.stockMovement.create({
        data: {
          documentId: mv.documentId,
          lineId: mv.lineId || null,
          productId: mv.productId,
          warehouseId: mv.warehouseId,
          locationId: mv.locationId || null,
          movementType: mv.movementType,
          qtyChangeOnHand: mv.qtyChangeOnHand,
          qtyChangeReserved,
          balanceOnHandAfter: newOnHand,
          balanceReservedAfter: newReserved,
          idempotencyKey: mv.idempotencyKey,
          createdBy: mv.createdBy || null,
        },
      });

      await tx.inventoryItem.update({
        where: { id: inventory.id },
        data: {
          onHandQty: newOnHand,
          reservedQty: newReserved,
          availableQty: newAvailable,
        },
      });

      // Sync Product.stockQuantity for backward compatibility
      // Sum all inventory items for this product across all warehouses
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

      results.push(movement);
    }

    return results;
  });
}

export function generateDocumentCode(prefix: string) {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const random = nanoid(6).toUpperCase();
  return `${prefix}-${y}${m}${d}-${random}`;
}

export function movementPlanFromLine(params: {
  documentId: string;
  lineId: string;
  productId: string;
  warehouseId: string;
  movementType: StockDocumentType;
  qty: Prisma.Decimal;
  createdBy?: string | null;
}) {
  const qtyChangeOnHand =
    params.movementType === 'ISSUE' || params.movementType === 'DEDUCT'
      ? params.qty.neg()
      : params.movementType === 'ADJUSTMENT'
        ? params.qty
        : params.qty;

  return {
    documentId: params.documentId,
    lineId: params.lineId,
    productId: params.productId,
    warehouseId: params.warehouseId,
    movementType: params.movementType,
    qtyChangeOnHand,
    idempotencyKey: `doc:${params.documentId}:line:${params.lineId}:type:${params.movementType}`,
    createdBy: params.createdBy,
  };
}

// ==================== ORDER STOCK OPERATIONS ====================

export type OrderStockAction = 'RESERVE' | 'DEDUCT' | 'RELEASE' | 'RESTOCK';

export type OrderLineItem = {
  productId: string | null;
  quantity: number;
  productName: string;
};

/**
 * Execute stock operation for an order.
 * - RESERVE: increase reservedQty (when order confirmed, before ship)
 * - DEDUCT: decrease onHandQty and reservedQty (when shipped)
 * - RELEASE: decrease reservedQty (when cancelled before ship)
 * - RESTOCK: increase onHandQty (when returned after ship)
 *
 * Uses idempotency key: order:{orderId}:{action}:{itemIndex}
 */
export async function executeOrderStockAction(
  prisma: PrismaClient,
  params: {
    orderId: string;
    action: OrderStockAction;
    items: OrderLineItem[];
    warehouseId: string;
    createdBy?: string | null;
  }
): Promise<{ success: boolean; skipped: number; applied: number; errors: string[] }> {
  const { orderId, action, items, warehouseId, createdBy } = params;

  // Create a stock document for audit trail
  const docType = action as StockDocumentType;
  const docCode = generateDocumentCode(action.slice(0, 3));

  const document = await prisma.stockDocument.create({
    data: {
      code: docCode,
      type: docType,
      status: 'POSTED',
      warehouseId,
      referenceType: 'ORDER',
      referenceId: orderId,
      note: `Auto ${action} for order ${orderId}`,
      createdBy,
      postedBy: createdBy,
      postedAt: new Date(),
    },
  });

  const movements: StockMovementPlan[] = [];
  const errors: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.productId) continue;

    const idempotencyKey = `order:${orderId}:${action}:${i}:${item.productId}`;
    const qty = new Prisma.Decimal(item.quantity);

    let qtyChangeOnHand = new Prisma.Decimal(0);
    let qtyChangeReserved = new Prisma.Decimal(0);

    switch (action) {
      case 'RESERVE':
        // Reserve: increase reservedQty only (no change to onHand)
        qtyChangeReserved = qty;
        break;
      case 'DEDUCT':
        // Deduct: decrease onHand and reserved (item shipped)
        qtyChangeOnHand = qty.neg();
        qtyChangeReserved = qty.neg();
        break;
      case 'RELEASE':
        // Release: decrease reservedQty only (order cancelled before ship)
        qtyChangeReserved = qty.neg();
        break;
      case 'RESTOCK':
        // Restock: increase onHand (item returned after ship)
        qtyChangeOnHand = qty;
        break;
    }

    movements.push({
      documentId: document.id,
      lineId: null,
      productId: item.productId,
      warehouseId,
      locationId: null,
      movementType: docType,
      qtyChangeOnHand,
      qtyChangeReserved,
      idempotencyKey,
      createdBy,
    });
  }

  if (movements.length === 0) {
    return { success: true, skipped: 0, applied: 0, errors: [] };
  }

  try {
    const results = await applyMovementsWithTransaction(prisma, {
      movements,
      allowNegative: action === 'RELEASE', // Allow negative for release if reserved was 0
    });

    const skipped = results.filter((r, i) => {
      // Check if this was an existing movement (idempotency skip)
      return (
        movements[i] &&
        r.idempotencyKey === movements[i].idempotencyKey &&
        r.createdAt < new Date(Date.now() - 1000)
      );
    }).length;

    return {
      success: true,
      skipped,
      applied: results.length - skipped,
      errors: [],
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    return { success: false, skipped: 0, applied: 0, errors };
  }
}
