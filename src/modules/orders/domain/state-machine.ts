/**
 * Order State Machine
 * 
 * Defines valid state transitions and business rules for orders.
 * This is the single source of truth for order workflow logic.
 */

import type { OrderStatus, FulfillmentStatus } from '@prisma/client';
import type { StockAction } from './types';

/**
 * Valid order status transitions
 */
export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ['PENDING_CONFIRMATION', 'CANCELED'],
  PENDING_CONFIRMATION: ['CONFIRMED', 'CANCELED', 'FAILED'],
  CONFIRMED: ['PACKING', 'CANCELED', 'FAILED'],
  PACKING: ['SHIPPED', 'CANCELED', 'FAILED'],
  SHIPPED: ['DELIVERED', 'RETURN_REQUESTED'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED', 'DELIVERED'],
  RETURNED: [],
  CANCELED: [],
  FAILED: [],
};

/**
 * Check if a status transition is allowed
 */
export function isAllowedTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  return ORDER_STATUS_FLOW[from]?.includes(to) ?? false;
}

/**
 * Get allowed next statuses from current status
 */
export function getAllowedNextStatuses(current: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_FLOW[current] ?? [];
}

/**
 * Check if an order can be modified (not in final state)
 */
export function canModifyOrder(status: OrderStatus): boolean {
  return !['DELIVERED', 'RETURNED', 'CANCELED', 'FAILED'].includes(status);
}

/**
 * Check if an order can be canceled
 */
export function canCancelOrder(status: OrderStatus): boolean {
  return ORDER_STATUS_FLOW[status]?.includes('CANCELED') ?? false;
}

/**
 * Map OrderStatus to FulfillmentStatus
 */
export function getFulfillmentStatus(orderStatus: OrderStatus): FulfillmentStatus {
  const mapping: Record<OrderStatus, FulfillmentStatus> = {
    DRAFT: 'UNFULFILLED',
    PENDING_CONFIRMATION: 'UNFULFILLED',
    CONFIRMED: 'UNFULFILLED',
    PACKING: 'PACKING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    RETURN_REQUESTED: 'DELIVERED',
    RETURNED: 'RETURNED',
    CANCELED: 'UNFULFILLED',
    FAILED: 'UNFULFILLED',
  };
  return mapping[orderStatus] ?? 'UNFULFILLED';
}

/**
 * Map OrderStatus to legacy status string
 */
export function getLegacyStatus(orderStatus: OrderStatus): string {
  const mapping: Record<OrderStatus, string> = {
    DRAFT: 'DRAFT',
    PENDING_CONFIRMATION: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PACKING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'COMPLETED',
    RETURN_REQUESTED: 'RETURN_REQUESTED',
    RETURNED: 'RETURNED',
    CANCELED: 'CANCELLED',
    FAILED: 'FAILED',
  };
  return mapping[orderStatus] ?? 'PENDING';
}

/**
 * Determine stock action based on status transition
 */
export function getStockActionForTransition(
  from: OrderStatus,
  to: OrderStatus
): StockAction | null {
  // CONFIRMED: Reserve stock (ready to ship)
  if (to === 'CONFIRMED' && from !== 'CONFIRMED') {
    return 'RESERVE';
  }

  // SHIPPED: Deduct stock (items left warehouse)
  if (to === 'SHIPPED' && from !== 'SHIPPED') {
    return 'DEDUCT';
  }

  // CANCELED/FAILED: Release reserved stock (if was in CONFIRMED/PACKING state)
  if (
    (to === 'CANCELED' || to === 'FAILED') &&
    (from === 'CONFIRMED' || from === 'PACKING')
  ) {
    return 'RELEASE';
  }

  // RETURNED: Restock items (items came back after being shipped)
  if (
    to === 'RETURNED' &&
    (from === 'SHIPPED' || from === 'DELIVERED' || from === 'RETURN_REQUESTED')
  ) {
    return 'RESTOCK';
  }

  return null;
}

/**
 * Status labels for UI
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, { en: string; vi: string }> = {
  DRAFT: { en: 'Draft', vi: 'Nháp' },
  PENDING_CONFIRMATION: { en: 'Pending', vi: 'Chờ xác nhận' },
  CONFIRMED: { en: 'Confirmed', vi: 'Đã xác nhận' },
  PACKING: { en: 'Packing', vi: 'Đang đóng gói' },
  SHIPPED: { en: 'Shipped', vi: 'Đã gửi' },
  DELIVERED: { en: 'Delivered', vi: 'Đã giao' },
  RETURN_REQUESTED: { en: 'Return Requested', vi: 'Yêu cầu trả hàng' },
  RETURNED: { en: 'Returned', vi: 'Đã trả hàng' },
  CANCELED: { en: 'Canceled', vi: 'Đã hủy' },
  FAILED: { en: 'Failed', vi: 'Thất bại' },
};

/**
 * Status colors for UI (Tailwind classes)
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING_CONFIRMATION: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PACKING: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  RETURN_REQUESTED: 'bg-orange-100 text-orange-800',
  RETURNED: 'bg-red-100 text-red-800',
  CANCELED: 'bg-gray-100 text-gray-600',
  FAILED: 'bg-red-100 text-red-800',
};

