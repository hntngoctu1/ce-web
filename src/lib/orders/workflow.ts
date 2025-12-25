import type { OrderStatus, PaymentState, FulfillmentStatus } from '@prisma/client';

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ['PENDING_CONFIRMATION', 'CANCELED'],
  PENDING_CONFIRMATION: ['CONFIRMED', 'CANCELED', 'FAILED'],
  CONFIRMED: ['PACKING', 'CANCELED', 'FAILED'],
  PACKING: ['SHIPPED', 'CANCELED', 'FAILED'],
  SHIPPED: ['DELIVERED', 'RETURN_REQUESTED'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED'],
  RETURNED: [],
  CANCELED: [],
  FAILED: [],
};

export function isAllowedTransition(from: OrderStatus, to: OrderStatus) {
  if (from === to) return true;
  return ORDER_STATUS_FLOW[from]?.includes(to) ?? false;
}

export function legacyStatusFromOrderStatus(status: OrderStatus): string {
  // Existing customer dashboard expects PENDING/SHIPPED/DELIVERED (+ we also use CANCELLED in new dashboard list).
  if (status === 'SHIPPED') return 'SHIPPED';
  if (status === 'DELIVERED') return 'DELIVERED';
  if (status === 'CANCELED' || status === 'FAILED') return 'CANCELLED';
  return 'PENDING';
}

export function legacyPaymentStatusFromPaymentState(state: PaymentState): string {
  if (state === 'PAID') return 'PAID';
  if (state === 'REFUNDED') return 'REFUNDED';
  if (state === 'PARTIAL') return 'PARTIAL';
  return 'PENDING';
}

export function fulfillmentFromOrderStatus(status: OrderStatus): FulfillmentStatus {
  if (status === 'PACKING') return 'PACKING';
  if (status === 'SHIPPED') return 'SHIPPED';
  if (status === 'DELIVERED') return 'DELIVERED';
  if (status === 'RETURNED') return 'RETURNED';
  return 'UNFULFILLED';
}
