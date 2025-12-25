/**
 * Inventory Validators (Zod Schemas)
 */

import { z } from 'zod';

/**
 * Stock document type enum
 */
export const StockDocumentTypeSchema = z.enum([
  'GRN',
  'ISSUE',
  'ADJUSTMENT',
  'TRANSFER',
  'RESERVE',
  'RELEASE',
  'DEDUCT',
  'RESTOCK',
]);

/**
 * Stock document status enum
 */
export const StockDocumentStatusSchema = z.enum([
  'DRAFT',
  'POSTED',
  'VOID',
]);

/**
 * Reference type enum
 */
export const StockReferenceTypeSchema = z.enum([
  'ORDER',
  'PO',
  'MANUAL',
]);

/**
 * Stock document line input schema
 */
export const StockDocumentLineInputSchema = z.object({
  productId: z.string().min(1),
  qty: z.number(),
  unitCost: z.number().min(0).optional(),
  sourceLocationId: z.string().optional(),
  targetLocationId: z.string().optional(),
});

/**
 * Create stock document input schema
 */
export const CreateStockDocumentInputSchema = z.object({
  type: StockDocumentTypeSchema,
  warehouseId: z.string().min(1),
  targetWarehouseId: z.string().optional(),
  referenceType: StockReferenceTypeSchema.optional(),
  referenceId: z.string().optional(),
  note: z.string().max(1000).optional(),
  lines: z.array(StockDocumentLineInputSchema).min(1),
});

/**
 * Stock document list query schema
 */
export const StockDocumentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  type: z.string().optional(),
  status: z.string().optional(),
  warehouseId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

/**
 * Inventory adjustment input schema
 */
export const InventoryAdjustmentInputSchema = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  locationId: z.string().optional(),
  qtyChange: z.number().refine((val) => val !== 0, 'Quantity change cannot be zero'),
  reason: z.string().min(3).max(500),
});

/**
 * Warehouse creation schema
 */
export const CreateWarehouseSchema = z.object({
  code: z.string().min(1).max(50).regex(/^[A-Z0-9_-]+$/i, 'Code must be alphanumeric'),
  name: z.string().min(1).max(255),
  address: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
});

/**
 * Warehouse location creation schema
 */
export const CreateWarehouseLocationSchema = z.object({
  warehouseId: z.string().min(1),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  isDefault: z.boolean().optional().default(false),
});

/**
 * Inventory list query schema
 */
export const InventoryListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  warehouseId: z.string().optional(),
  productId: z.string().optional(),
  status: z.enum(['all', 'in_stock', 'low_stock', 'out_of_stock']).optional(),
  q: z.string().optional(),
});

