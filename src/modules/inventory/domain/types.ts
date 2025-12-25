/**
 * Inventory Domain Types
 */

import type {
  Warehouse,
  WarehouseLocation,
  InventoryItem,
  StockDocument,
  StockDocumentLine,
  StockMovement,
  StockDocumentType,
  StockDocumentStatus,
  Prisma,
} from '@prisma/client';

// Re-export Prisma types
export type {
  Warehouse,
  WarehouseLocation,
  InventoryItem,
  StockDocument,
  StockDocumentLine,
  StockMovement,
  StockDocumentType,
  StockDocumentStatus,
};

/**
 * Stock document with lines
 */
export interface StockDocumentWithLines extends StockDocument {
  lines: StockDocumentLine[];
  warehouse: Warehouse;
  targetWarehouse?: Warehouse | null;
}

/**
 * Inventory item with product info
 */
export interface InventoryItemWithProduct extends InventoryItem {
  product: {
    id: string;
    sku: string | null;
    nameEn: string;
    nameVi: string;
  };
  warehouse: Warehouse;
}

/**
 * Stock document creation input
 */
export interface CreateStockDocumentInput {
  type: StockDocumentType;
  warehouseId: string;
  targetWarehouseId?: string;
  referenceType?: 'ORDER' | 'PO' | 'MANUAL';
  referenceId?: string;
  note?: string;
  lines: {
    productId: string;
    qty: number;
    unitCost?: number;
    sourceLocationId?: string;
    targetLocationId?: string;
  }[];
}

/**
 * Stock document list filters
 */
export interface StockDocumentFilters {
  type?: StockDocumentType | 'ALL';
  status?: StockDocumentStatus | 'ALL';
  warehouseId?: string;
  from?: Date;
  to?: Date;
}

/**
 * Inventory adjustment input
 */
export interface InventoryAdjustmentInput {
  productId: string;
  warehouseId: string;
  locationId?: string;
  qtyChange: number;
  reason: string;
}

/**
 * Movement plan for applying stock changes
 */
export interface MovementPlan {
  documentId: string;
  lineId: string;
  productId: string;
  warehouseId: string;
  locationId?: string;
  movementType: StockDocumentType;
  qtyChangeOnHand: Prisma.Decimal;
  qtyChangeReserved?: Prisma.Decimal;
  idempotencyKey: string;
  createdBy?: string | null;
}

/**
 * Stock level summary
 */
export interface StockLevel {
  productId: string;
  productSku: string | null;
  productName: string;
  warehouseId: string;
  warehouseCode: string;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  reorderPointQty: number;
  isLowStock: boolean;
}

/**
 * Stock operation result
 */
export interface StockOperationResult {
  success: boolean;
  documentId?: string;
  movementsApplied?: number;
  error?: string;
}

