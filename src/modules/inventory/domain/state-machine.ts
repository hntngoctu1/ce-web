/**
 * Stock Document State Machine
 * 
 * Defines valid state transitions for stock documents.
 */

import type { StockDocumentStatus, StockDocumentType } from '@prisma/client';

/**
 * Valid stock document status transitions
 */
export const STOCK_DOCUMENT_STATUS_FLOW: Record<StockDocumentStatus, StockDocumentStatus[]> = {
  DRAFT: ['POSTED', 'VOID'],
  POSTED: ['VOID'],
  VOID: [],
};

/**
 * Check if a status transition is allowed
 */
export function isAllowedDocumentTransition(
  from: StockDocumentStatus,
  to: StockDocumentStatus
): boolean {
  if (from === to) return true;
  return STOCK_DOCUMENT_STATUS_FLOW[from]?.includes(to) ?? false;
}

/**
 * Check if a document can be posted
 */
export function canPostDocument(status: StockDocumentStatus): boolean {
  return status === 'DRAFT';
}

/**
 * Check if a document can be voided
 */
export function canVoidDocument(status: StockDocumentStatus): boolean {
  return status === 'DRAFT' || status === 'POSTED';
}

/**
 * Document type affects inventory direction
 */
export type InventoryDirection = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUST';

/**
 * Get inventory direction for document type
 */
export function getInventoryDirection(type: StockDocumentType): InventoryDirection {
  switch (type) {
    case 'GRN':
    case 'RESTOCK':
    case 'RELEASE':
      return 'IN';
    case 'ISSUE':
    case 'DEDUCT':
    case 'RESERVE':
      return 'OUT';
    case 'TRANSFER':
      return 'TRANSFER';
    case 'ADJUSTMENT':
      return 'ADJUST';
    default:
      return 'ADJUST';
  }
}

/**
 * Get quantity sign for document type
 * Positive = adds to on-hand, Negative = removes from on-hand
 */
export function getQuantitySign(type: StockDocumentType): 1 | -1 | 0 {
  switch (type) {
    case 'GRN':
    case 'RESTOCK':
      return 1;
    case 'ISSUE':
    case 'DEDUCT':
      return -1;
    case 'RESERVE':
    case 'RELEASE':
      return 0; // Only affects reserved qty
    case 'ADJUSTMENT':
    case 'TRANSFER':
      return 0; // Sign determined by qty value
    default:
      return 0;
  }
}

/**
 * Get reserved quantity change for document type
 */
export function getReservedQtyChange(type: StockDocumentType): 1 | -1 | 0 {
  switch (type) {
    case 'RESERVE':
      return 1;  // Increase reserved
    case 'RELEASE':
    case 'DEDUCT':
      return -1; // Decrease reserved
    default:
      return 0;
  }
}

/**
 * Document type labels for UI
 */
export const DOCUMENT_TYPE_LABELS: Record<StockDocumentType, { en: string; vi: string }> = {
  GRN: { en: 'Goods Receipt', vi: 'Nhập kho' },
  ISSUE: { en: 'Goods Issue', vi: 'Xuất kho' },
  ADJUSTMENT: { en: 'Adjustment', vi: 'Điều chỉnh' },
  TRANSFER: { en: 'Transfer', vi: 'Chuyển kho' },
  RESERVE: { en: 'Reserve', vi: 'Giữ hàng' },
  RELEASE: { en: 'Release', vi: 'Hủy giữ' },
  DEDUCT: { en: 'Deduct', vi: 'Trừ kho' },
  RESTOCK: { en: 'Restock', vi: 'Hoàn kho' },
};

/**
 * Document status labels for UI
 */
export const DOCUMENT_STATUS_LABELS: Record<StockDocumentStatus, { en: string; vi: string }> = {
  DRAFT: { en: 'Draft', vi: 'Nháp' },
  POSTED: { en: 'Posted', vi: 'Đã duyệt' },
  VOID: { en: 'Void', vi: 'Đã hủy' },
};

/**
 * Document status colors for UI
 */
export const DOCUMENT_STATUS_COLORS: Record<StockDocumentStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  POSTED: 'bg-green-100 text-green-800',
  VOID: 'bg-red-100 text-red-800',
};

