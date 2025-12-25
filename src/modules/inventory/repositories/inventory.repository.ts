/**
 * Inventory Repository
 * 
 * Database access layer for inventory operations.
 */

import type { Prisma } from '@prisma/client';
import { prisma, type PrismaTransaction } from '@/shared/database';
import type {
  StockDocumentWithLines,
  StockDocumentFilters,
  InventoryItemWithProduct,
  StockLevel,
  StockDocumentType,
  StockDocumentStatus,
} from '../domain/types';

/**
 * Inventory Repository class
 */
export class InventoryRepository {
  private db: PrismaTransaction | typeof prisma;

  constructor(tx?: PrismaTransaction) {
    this.db = tx ?? prisma;
  }

  // ==================== WAREHOUSES ====================

  /**
   * Find warehouse by ID
   */
  async findWarehouseById(id: string) {
    return this.db.warehouse.findUnique({ where: { id } });
  }

  /**
   * Find warehouse by code
   */
  async findWarehouseByCode(code: string) {
    return this.db.warehouse.findUnique({ where: { code } });
  }

  /**
   * Get default warehouse
   */
  async getDefaultWarehouse() {
    return this.db.warehouse.findFirst({
      where: { isDefault: true },
    });
  }

  /**
   * List all warehouses
   */
  async listWarehouses() {
    return this.db.warehouse.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        locations: true,
        _count: { select: { inventoryItems: true } },
      },
    });
  }

  /**
   * Create warehouse
   */
  async createWarehouse(data: Prisma.WarehouseCreateInput) {
    return this.db.warehouse.create({ data });
  }

  // ==================== INVENTORY ITEMS ====================

  /**
   * Find inventory item by product and warehouse
   */
  async findInventoryItem(productId: string, warehouseId: string, locationId?: string) {
    return this.db.inventoryItem.findFirst({
      where: {
        productId,
        warehouseId,
        locationId: locationId ?? null,
      },
    });
  }

  /**
   * Get or create inventory item
   */
  async getOrCreateInventoryItem(
    productId: string,
    warehouseId: string,
    locationId?: string
  ) {
    const existing = await this.findInventoryItem(productId, warehouseId, locationId);
    if (existing) return existing;

    return this.db.inventoryItem.create({
      data: {
        productId,
        warehouseId,
        locationId: locationId ?? null,
        onHandQty: 0,
        reservedQty: 0,
        availableQty: 0,
      },
    });
  }

  /**
   * Update inventory quantities
   */
  async updateInventoryQty(
    id: string,
    changes: {
      onHandQty?: Prisma.Decimal;
      reservedQty?: Prisma.Decimal;
    }
  ) {
    const item = await this.db.inventoryItem.findUnique({ where: { id } });
    if (!item) return null;

    const newOnHand = changes.onHandQty ?? item.onHandQty;
    const newReserved = changes.reservedQty ?? item.reservedQty;
    const newAvailable = newOnHand.sub(newReserved);

    return this.db.inventoryItem.update({
      where: { id },
      data: {
        onHandQty: newOnHand,
        reservedQty: newReserved,
        availableQty: newAvailable,
      },
    });
  }

  /**
   * List inventory items with filters
   */
  async listInventoryItems(options: {
    warehouseId?: string;
    productId?: string;
    status?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: InventoryItemWithProduct[]; total: number }> {
    const { page = 1, pageSize = 50 } = options;
    const skip = (page - 1) * pageSize;

    const where: Prisma.InventoryItemWhereInput = {};

    if (options.warehouseId) {
      where.warehouseId = options.warehouseId;
    }

    if (options.productId) {
      where.productId = options.productId;
    }

    if (options.status === 'out_of_stock') {
      where.availableQty = { lte: 0 };
    } else if (options.status === 'in_stock') {
      where.availableQty = { gt: 0 };
    }
    // low_stock requires post-processing

    if (options.search) {
      where.product = {
        OR: [
          { sku: { contains: options.search } },
          { nameEn: { contains: options.search } },
          { nameVi: { contains: options.search } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      this.db.inventoryItem.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          product: {
            select: { id: true, sku: true, nameEn: true, nameVi: true },
          },
          warehouse: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.db.inventoryItem.count({ where }),
    ]);

    return {
      items: items as InventoryItemWithProduct[],
      total,
    };
  }

  // ==================== STOCK DOCUMENTS ====================

  /**
   * Find stock document by ID
   */
  async findDocumentById(id: string): Promise<StockDocumentWithLines | null> {
    return this.db.stockDocument.findUnique({
      where: { id },
      include: {
        lines: true,
        warehouse: true,
        targetWarehouse: true,
      },
    }) as Promise<StockDocumentWithLines | null>;
  }

  /**
   * Find stock document by code
   */
  async findDocumentByCode(code: string): Promise<StockDocumentWithLines | null> {
    return this.db.stockDocument.findUnique({
      where: { code },
      include: {
        lines: true,
        warehouse: true,
        targetWarehouse: true,
      },
    }) as Promise<StockDocumentWithLines | null>;
  }

  /**
   * List stock documents with filters
   */
  async listDocuments(options: {
    filters?: StockDocumentFilters;
    page?: number;
    pageSize?: number;
  }) {
    const { filters = {}, page = 1, pageSize = 20 } = options;
    const skip = (page - 1) * pageSize;

    const where: Prisma.StockDocumentWhereInput = {};

    if (filters.type && filters.type !== 'ALL') {
      where.type = filters.type;
    }

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters.warehouseId) {
      where.warehouseId = filters.warehouseId;
    }

    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }

    const [documents, total] = await Promise.all([
      this.db.stockDocument.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          warehouse: { select: { code: true, name: true } },
          targetWarehouse: { select: { code: true, name: true } },
          lines: { select: { qty: true } },
        },
      }),
      this.db.stockDocument.count({ where }),
    ]);

    return { documents, total };
  }

  /**
   * Create stock document with lines
   */
  async createDocument(data: {
    code: string;
    type: StockDocumentType;
    warehouseId: string;
    targetWarehouseId?: string;
    referenceType?: string;
    referenceId?: string;
    note?: string;
    createdBy?: string;
    lines: {
      productId: string;
      qty: Prisma.Decimal;
      unitCost?: Prisma.Decimal;
      sourceLocationId?: string;
      targetLocationId?: string;
    }[];
  }) {
    return this.db.stockDocument.create({
      data: {
        code: data.code,
        type: data.type,
        status: 'DRAFT',
        warehouseId: data.warehouseId,
        targetWarehouseId: data.targetWarehouseId ?? null,
        referenceType: data.referenceType as any ?? null,
        referenceId: data.referenceId ?? null,
        note: data.note ?? null,
        createdBy: data.createdBy ?? null,
        lines: {
          create: data.lines.map((line) => ({
            productId: line.productId,
            qty: line.qty,
            unitCost: line.unitCost ?? null,
            sourceLocationId: line.sourceLocationId ?? null,
            targetLocationId: line.targetLocationId ?? null,
          })),
        },
      },
      include: {
        lines: true,
        warehouse: true,
      },
    });
  }

  /**
   * Update document status
   */
  async updateDocumentStatus(
    id: string,
    status: StockDocumentStatus,
    postedBy?: string
  ) {
    const data: Prisma.StockDocumentUpdateInput = { status };
    if (status === 'POSTED') {
      data.postedAt = new Date();
      data.postedBy = postedBy ?? null;
    }
    return this.db.stockDocument.update({
      where: { id },
      data,
    });
  }

  // ==================== STOCK MOVEMENTS ====================

  /**
   * Check if movement exists (idempotency)
   */
  async movementExists(idempotencyKey: string): Promise<boolean> {
    const count = await this.db.stockMovement.count({
      where: { idempotencyKey },
    });
    return count > 0;
  }

  /**
   * Create stock movement
   */
  async createMovement(data: {
    documentId: string;
    lineId?: string;
    productId: string;
    warehouseId: string;
    locationId?: string;
    movementType: StockDocumentType;
    qtyChangeOnHand: Prisma.Decimal;
    qtyChangeReserved?: Prisma.Decimal;
    balanceOnHandAfter: Prisma.Decimal;
    balanceReservedAfter: Prisma.Decimal;
    idempotencyKey: string;
    createdBy?: string;
  }) {
    return this.db.stockMovement.create({
      data: {
        documentId: data.documentId,
        lineId: data.lineId ?? null,
        productId: data.productId,
        warehouseId: data.warehouseId,
        locationId: data.locationId ?? null,
        movementType: data.movementType,
        qtyChangeOnHand: data.qtyChangeOnHand,
        qtyChangeReserved: data.qtyChangeReserved ?? 0,
        balanceOnHandAfter: data.balanceOnHandAfter,
        balanceReservedAfter: data.balanceReservedAfter,
        idempotencyKey: data.idempotencyKey,
        createdBy: data.createdBy ?? null,
      },
    });
  }

  /**
   * Get movements for document
   */
  async getDocumentMovements(documentId: string) {
    return this.db.stockMovement.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' },
      include: {
        product: { select: { sku: true, nameEn: true } },
      },
    });
  }

  // ==================== HELPERS ====================

  /**
   * Generate document code
   */
  async generateDocumentCode(type: StockDocumentType): Promise<string> {
    const prefix = type.slice(0, 3).toUpperCase();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Count existing documents this month
    const startOfMonth = new Date(year, date.getMonth(), 1);
    const endOfMonth = new Date(year, date.getMonth() + 1, 0, 23, 59, 59);

    const count = await this.db.stockDocument.count({
      where: {
        type,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `${prefix}-${year}${month}-${sequence}`;
  }
}

/**
 * Default repository instance
 */
export const inventoryRepository = new InventoryRepository();

