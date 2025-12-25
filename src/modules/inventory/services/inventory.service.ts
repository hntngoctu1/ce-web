/**
 * Inventory Service
 * 
 * Business logic for inventory and stock document operations.
 */

import { Prisma } from '@prisma/client';
import { prisma, withTransaction, type PrismaTransaction } from '@/shared/database';
import { AppError, ErrorCode } from '@/shared/errors';
import { audit } from '@/shared/logging';
import type { UserContext } from '@/shared/types';
import { InventoryRepository } from '../repositories/inventory.repository';
import {
  isAllowedDocumentTransition,
  canPostDocument,
  canVoidDocument,
  getQuantitySign,
  getReservedQtyChange,
} from '../domain/state-machine';
import type {
  StockDocumentWithLines,
  CreateStockDocumentInput,
  StockDocumentFilters,
  StockOperationResult,
  StockDocumentType,
  MovementPlan,
} from '../domain/types';

interface InventoryServiceContext {
  user?: UserContext;
  ip?: string;
  userAgent?: string;
}

/**
 * Inventory Service class
 */
export class InventoryService {
  private context: InventoryServiceContext;

  constructor(context: InventoryServiceContext = {}) {
    this.context = context;
  }

  // ==================== WAREHOUSES ====================

  /**
   * List all warehouses
   */
  async listWarehouses() {
    const repo = new InventoryRepository();
    return repo.listWarehouses();
  }

  /**
   * Get or create default warehouse
   */
  async ensureDefaultWarehouse() {
    const repo = new InventoryRepository();
    let warehouse = await repo.getDefaultWarehouse();

    if (!warehouse) {
      warehouse = await repo.createWarehouse({
        code: 'MAIN',
        name: 'Main Warehouse',
        isDefault: true,
      });
    }

    return warehouse;
  }

  // ==================== INVENTORY ITEMS ====================

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
  }) {
    const repo = new InventoryRepository();
    return repo.listInventoryItems(options);
  }

  /**
   * Get stock level for a product
   */
  async getProductStockLevel(productId: string, warehouseId?: string) {
    const repo = new InventoryRepository();
    
    if (warehouseId) {
      return repo.findInventoryItem(productId, warehouseId);
    }

    // Get from all warehouses
    const { items } = await repo.listInventoryItems({ productId, pageSize: 100 });
    return items;
  }

  // ==================== STOCK DOCUMENTS ====================

  /**
   * Get document by ID
   */
  async getDocumentById(id: string): Promise<StockDocumentWithLines | null> {
    const repo = new InventoryRepository();
    return repo.findDocumentById(id);
  }

  /**
   * List stock documents with filters
   */
  async listDocuments(options: {
    filters?: StockDocumentFilters;
    page?: number;
    pageSize?: number;
  }) {
    const repo = new InventoryRepository();
    return repo.listDocuments(options);
  }

  /**
   * Create a new stock document (draft)
   */
  async createDocument(input: CreateStockDocumentInput): Promise<StockDocumentWithLines> {
    const result = await withTransaction(async (tx) => {
      const repo = new InventoryRepository(tx);

      // Validate warehouse exists
      const warehouse = await repo.findWarehouseById(input.warehouseId);
      if (!warehouse) {
        throw AppError.notFound('Warehouse', input.warehouseId);
      }

      // Validate target warehouse for transfers
      if (input.type === 'TRANSFER') {
        if (!input.targetWarehouseId) {
          throw AppError.validation('Target warehouse is required for transfers', [
            { field: 'targetWarehouseId', message: 'Required' },
          ]);
        }
        const targetWarehouse = await repo.findWarehouseById(input.targetWarehouseId);
        if (!targetWarehouse) {
          throw AppError.notFound('Target Warehouse', input.targetWarehouseId);
        }
      }

      // Validate lines
      if (input.lines.length === 0) {
        throw AppError.validation('At least one line is required', [
          { field: 'lines', message: 'Required' },
        ]);
      }

      // For ISSUE/DEDUCT, validate quantities
      if (['ISSUE', 'DEDUCT'].includes(input.type)) {
        for (const line of input.lines) {
          if (line.qty <= 0) {
            throw AppError.validation('Quantity must be positive for issue documents', [
              { field: 'qty', message: 'Must be positive' },
            ]);
          }
        }
      }

      // Generate document code
      const code = await repo.generateDocumentCode(input.type);

      // Create document with lines
      const document = await repo.createDocument({
        code,
        type: input.type,
        warehouseId: input.warehouseId,
        targetWarehouseId: input.targetWarehouseId,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        note: input.note,
        createdBy: this.context.user?.userId,
        lines: input.lines.map((line) => ({
          productId: line.productId,
          qty: new Prisma.Decimal(line.qty),
          unitCost: line.unitCost ? new Prisma.Decimal(line.unitCost) : undefined,
          sourceLocationId: line.sourceLocationId,
          targetLocationId: line.targetLocationId,
        })),
      });

      return document as StockDocumentWithLines;
    });

    // Audit log
    await audit({
      action: 'STOCK_DOCUMENT_CREATED',
      entityType: 'StockDocument',
      entityId: result.id,
      after: { code: result.code, type: result.type },
      userId: this.context.user?.userId,
      ip: this.context.ip,
      userAgent: this.context.userAgent,
    });

    return result;
  }

  /**
   * Post a stock document (apply movements)
   */
  async postDocument(documentId: string): Promise<StockOperationResult> {
    const result = await withTransaction(async (tx) => {
      const repo = new InventoryRepository(tx);
      const document = await repo.findDocumentById(documentId);

      if (!document) {
        throw AppError.notFound('Stock Document', documentId);
      }

      if (!canPostDocument(document.status)) {
        throw new AppError(
          ErrorCode.INVENTORY_DOCUMENT_ALREADY_POSTED,
          `Document ${document.code} is already ${document.status}`,
          [{ status: document.status }]
        );
      }

      // Apply movements for each line
      let movementsApplied = 0;

      for (const line of document.lines) {
        const applied = await this.applyMovement(tx, repo, {
          documentId: document.id,
          lineId: line.id,
          productId: line.productId,
          warehouseId: document.warehouseId,
          movementType: document.type,
          qty: line.qty,
          createdBy: this.context.user?.userId,
        });

        if (applied) {
          movementsApplied++;
        }

        // Handle transfer: also create movement for target warehouse
        if (document.type === 'TRANSFER' && document.targetWarehouseId) {
          const appliedTarget = await this.applyMovement(tx, repo, {
            documentId: document.id,
            lineId: line.id,
            productId: line.productId,
            warehouseId: document.targetWarehouseId,
            movementType: 'GRN', // Target receives goods
            qty: line.qty,
            createdBy: this.context.user?.userId,
            idempotencySuffix: ':target',
          });
          if (appliedTarget) {
            movementsApplied++;
          }
        }
      }

      // Update document status
      await repo.updateDocumentStatus(documentId, 'POSTED', this.context.user?.userId);

      return { documentId, movementsApplied };
    });

    // Audit log
    await audit({
      action: 'STOCK_DOCUMENT_POSTED',
      entityType: 'StockDocument',
      entityId: documentId,
      after: { movementsApplied: result.movementsApplied },
      userId: this.context.user?.userId,
      ip: this.context.ip,
      userAgent: this.context.userAgent,
    });

    return {
      success: true,
      documentId: result.documentId,
      movementsApplied: result.movementsApplied,
    };
  }

  /**
   * Void a stock document
   */
  async voidDocument(documentId: string): Promise<void> {
    await withTransaction(async (tx) => {
      const repo = new InventoryRepository(tx);
      const document = await repo.findDocumentById(documentId);

      if (!document) {
        throw AppError.notFound('Stock Document', documentId);
      }

      if (!canVoidDocument(document.status)) {
        throw new AppError(
          ErrorCode.INVENTORY_DOCUMENT_VOID_NOT_ALLOWED,
          `Document ${document.code} cannot be voided (status: ${document.status})`,
          [{ status: document.status }]
        );
      }

      // If document was posted, reverse the movements
      if (document.status === 'POSTED') {
        for (const line of document.lines) {
          await this.applyReverseMovement(tx, repo, document, line);
        }
      }

      // Update document status
      await repo.updateDocumentStatus(documentId, 'VOID');
    });

    // Audit log
    await audit({
      action: 'STOCK_DOCUMENT_VOIDED',
      entityType: 'StockDocument',
      entityId: documentId,
      userId: this.context.user?.userId,
      ip: this.context.ip,
      userAgent: this.context.userAgent,
    });
  }

  // ==================== PRIVATE HELPERS ====================

  /**
   * Apply a single movement with idempotency
   */
  private async applyMovement(
    tx: PrismaTransaction,
    repo: InventoryRepository,
    params: {
      documentId: string;
      lineId: string;
      productId: string;
      warehouseId: string;
      movementType: StockDocumentType;
      qty: Prisma.Decimal;
      createdBy?: string | null;
      idempotencySuffix?: string;
    }
  ): Promise<boolean> {
    const idempotencyKey = `doc:${params.documentId}:line:${params.lineId}:type:${params.movementType}${params.idempotencySuffix ?? ''}`;

    // Check idempotency
    const exists = await repo.movementExists(idempotencyKey);
    if (exists) {
      return false; // Already applied
    }

    // Get or create inventory item
    const inventoryItem = await repo.getOrCreateInventoryItem(
      params.productId,
      params.warehouseId
    );

    // Calculate quantity changes
    const qtySign = getQuantitySign(params.movementType);
    const reservedSign = getReservedQtyChange(params.movementType);

    let qtyChangeOnHand: Prisma.Decimal;
    let qtyChangeReserved = new Prisma.Decimal(0);

    if (params.movementType === 'ADJUSTMENT') {
      // Adjustment: qty can be positive or negative
      qtyChangeOnHand = params.qty;
    } else if (qtySign === 0) {
      // Reserve/Release: only affects reserved
      qtyChangeOnHand = new Prisma.Decimal(0);
      qtyChangeReserved = params.qty.abs().mul(reservedSign);
    } else {
      // GRN/Issue/etc: affects on-hand
      qtyChangeOnHand = params.qty.abs().mul(qtySign);
    }

    // Calculate new balances
    const newOnHand = inventoryItem.onHandQty.add(qtyChangeOnHand);
    const newReserved = inventoryItem.reservedQty.add(qtyChangeReserved);

    // Validate: on-hand cannot go negative for non-adjustment
    if (params.movementType !== 'ADJUSTMENT' && newOnHand.isNegative()) {
      throw new AppError(
        ErrorCode.INVENTORY_INSUFFICIENT_STOCK,
        `Insufficient stock for product ${params.productId}`,
        [{ productId: params.productId, available: inventoryItem.onHandQty.toString() }]
      );
    }

    // Create movement record
    await repo.createMovement({
      documentId: params.documentId,
      lineId: params.lineId,
      productId: params.productId,
      warehouseId: params.warehouseId,
      movementType: params.movementType,
      qtyChangeOnHand,
      qtyChangeReserved,
      balanceOnHandAfter: newOnHand,
      balanceReservedAfter: newReserved,
      idempotencyKey,
      createdBy: params.createdBy ?? undefined,
    });

    // Update inventory item
    await repo.updateInventoryQty(inventoryItem.id, {
      onHandQty: newOnHand,
      reservedQty: newReserved,
    });

    return true;
  }

  /**
   * Apply reverse movement for voiding posted document
   */
  private async applyReverseMovement(
    tx: PrismaTransaction,
    repo: InventoryRepository,
    document: StockDocumentWithLines,
    line: { id: string; productId: string; qty: Prisma.Decimal }
  ): Promise<void> {
    // Determine reverse movement type
    const reverseType = this.getReverseMovementType(document.type);
    
    await this.applyMovement(tx, repo, {
      documentId: document.id,
      lineId: line.id,
      productId: line.productId,
      warehouseId: document.warehouseId,
      movementType: reverseType,
      qty: line.qty,
      createdBy: this.context.user?.userId,
      idempotencySuffix: ':void',
    });
  }

  /**
   * Get reverse movement type
   */
  private getReverseMovementType(originalType: StockDocumentType): StockDocumentType {
    switch (originalType) {
      case 'GRN':
      case 'RESTOCK':
        return 'ISSUE';
      case 'ISSUE':
      case 'DEDUCT':
        return 'RESTOCK';
      case 'RESERVE':
        return 'RELEASE';
      case 'RELEASE':
        return 'RESERVE';
      default:
        return 'ADJUSTMENT';
    }
  }
}

/**
 * Create inventory service with context
 */
export function createInventoryService(context: InventoryServiceContext = {}): InventoryService {
  return new InventoryService(context);
}

/**
 * Default service instance
 */
export const inventoryService = new InventoryService();

