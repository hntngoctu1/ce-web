/**
 * Order State Machine Tests
 */

import { describe, it, expect } from 'vitest';
import {
  ORDER_STATUS_FLOW,
  isAllowedTransition,
  getAllowedNextStatuses,
  canModifyOrder,
  canCancelOrder,
  getFulfillmentStatus,
  getLegacyStatus,
  getStockActionForTransition,
} from './state-machine';

describe('Order State Machine', () => {
  describe('ORDER_STATUS_FLOW', () => {
    it('should define transitions for all statuses', () => {
      const allStatuses = [
        'DRAFT',
        'PENDING_CONFIRMATION',
        'CONFIRMED',
        'PACKING',
        'SHIPPED',
        'DELIVERED',
        'RETURN_REQUESTED',
        'RETURNED',
        'CANCELED',
        'FAILED',
      ];

      allStatuses.forEach((status) => {
        expect(ORDER_STATUS_FLOW).toHaveProperty(status);
        expect(Array.isArray(ORDER_STATUS_FLOW[status as keyof typeof ORDER_STATUS_FLOW])).toBe(true);
      });
    });

    it('should have no transitions from terminal states', () => {
      expect(ORDER_STATUS_FLOW.RETURNED).toEqual([]);
      expect(ORDER_STATUS_FLOW.CANCELED).toEqual([]);
      expect(ORDER_STATUS_FLOW.FAILED).toEqual([]);
    });
  });

  describe('isAllowedTransition', () => {
    it('should allow same status transition', () => {
      expect(isAllowedTransition('DRAFT', 'DRAFT')).toBe(true);
      expect(isAllowedTransition('CONFIRMED', 'CONFIRMED')).toBe(true);
    });

    it('should allow valid forward transitions', () => {
      expect(isAllowedTransition('DRAFT', 'PENDING_CONFIRMATION')).toBe(true);
      expect(isAllowedTransition('PENDING_CONFIRMATION', 'CONFIRMED')).toBe(true);
      expect(isAllowedTransition('CONFIRMED', 'PACKING')).toBe(true);
      expect(isAllowedTransition('PACKING', 'SHIPPED')).toBe(true);
      expect(isAllowedTransition('SHIPPED', 'DELIVERED')).toBe(true);
    });

    it('should allow cancellation from early stages', () => {
      expect(isAllowedTransition('DRAFT', 'CANCELED')).toBe(true);
      expect(isAllowedTransition('PENDING_CONFIRMATION', 'CANCELED')).toBe(true);
      expect(isAllowedTransition('CONFIRMED', 'CANCELED')).toBe(true);
      expect(isAllowedTransition('PACKING', 'CANCELED')).toBe(true);
    });

    it('should not allow cancellation after shipping', () => {
      expect(isAllowedTransition('SHIPPED', 'CANCELED')).toBe(false);
      expect(isAllowedTransition('DELIVERED', 'CANCELED')).toBe(false);
    });

    it('should allow return flow', () => {
      expect(isAllowedTransition('SHIPPED', 'RETURN_REQUESTED')).toBe(true);
      expect(isAllowedTransition('DELIVERED', 'RETURN_REQUESTED')).toBe(true);
      expect(isAllowedTransition('RETURN_REQUESTED', 'RETURNED')).toBe(true);
    });

    it('should not allow backward transitions', () => {
      expect(isAllowedTransition('CONFIRMED', 'PENDING_CONFIRMATION')).toBe(false);
      expect(isAllowedTransition('SHIPPED', 'PACKING')).toBe(false);
      expect(isAllowedTransition('DELIVERED', 'SHIPPED')).toBe(false);
    });

    it('should not allow transitions from terminal states', () => {
      expect(isAllowedTransition('CANCELED', 'PENDING_CONFIRMATION')).toBe(false);
      expect(isAllowedTransition('RETURNED', 'DELIVERED')).toBe(false);
      expect(isAllowedTransition('FAILED', 'CONFIRMED')).toBe(false);
    });
  });

  describe('getAllowedNextStatuses', () => {
    it('should return valid next statuses', () => {
      expect(getAllowedNextStatuses('DRAFT')).toContain('PENDING_CONFIRMATION');
      expect(getAllowedNextStatuses('PENDING_CONFIRMATION')).toContain('CONFIRMED');
      expect(getAllowedNextStatuses('CONFIRMED')).toContain('PACKING');
    });

    it('should return empty array for terminal states', () => {
      expect(getAllowedNextStatuses('CANCELED')).toEqual([]);
      expect(getAllowedNextStatuses('RETURNED')).toEqual([]);
    });
  });

  describe('canModifyOrder', () => {
    it('should allow modification for active orders', () => {
      expect(canModifyOrder('DRAFT')).toBe(true);
      expect(canModifyOrder('PENDING_CONFIRMATION')).toBe(true);
      expect(canModifyOrder('CONFIRMED')).toBe(true);
      expect(canModifyOrder('PACKING')).toBe(true);
      expect(canModifyOrder('SHIPPED')).toBe(true);
    });

    it('should not allow modification for final states', () => {
      expect(canModifyOrder('DELIVERED')).toBe(false);
      expect(canModifyOrder('RETURNED')).toBe(false);
      expect(canModifyOrder('CANCELED')).toBe(false);
      expect(canModifyOrder('FAILED')).toBe(false);
    });
  });

  describe('canCancelOrder', () => {
    it('should allow cancellation for early stages', () => {
      expect(canCancelOrder('DRAFT')).toBe(true);
      expect(canCancelOrder('PENDING_CONFIRMATION')).toBe(true);
      expect(canCancelOrder('CONFIRMED')).toBe(true);
      expect(canCancelOrder('PACKING')).toBe(true);
    });

    it('should not allow cancellation after shipping', () => {
      expect(canCancelOrder('SHIPPED')).toBe(false);
      expect(canCancelOrder('DELIVERED')).toBe(false);
    });
  });

  describe('getFulfillmentStatus', () => {
    it('should map order status to fulfillment status', () => {
      expect(getFulfillmentStatus('DRAFT')).toBe('UNFULFILLED');
      expect(getFulfillmentStatus('PACKING')).toBe('PACKING');
      expect(getFulfillmentStatus('SHIPPED')).toBe('SHIPPED');
      expect(getFulfillmentStatus('DELIVERED')).toBe('DELIVERED');
      expect(getFulfillmentStatus('RETURNED')).toBe('RETURNED');
    });
  });

  describe('getLegacyStatus', () => {
    it('should map to legacy status strings', () => {
      expect(getLegacyStatus('PENDING_CONFIRMATION')).toBe('PENDING');
      expect(getLegacyStatus('DELIVERED')).toBe('COMPLETED');
      expect(getLegacyStatus('CANCELED')).toBe('CANCELLED');
    });
  });

  describe('getStockActionForTransition', () => {
    it('should return RESERVE when confirming', () => {
      expect(getStockActionForTransition('PENDING_CONFIRMATION', 'CONFIRMED')).toBe('RESERVE');
    });

    it('should return DEDUCT when shipping', () => {
      expect(getStockActionForTransition('PACKING', 'SHIPPED')).toBe('DEDUCT');
    });

    it('should return RELEASE when canceling confirmed order', () => {
      expect(getStockActionForTransition('CONFIRMED', 'CANCELED')).toBe('RELEASE');
      expect(getStockActionForTransition('PACKING', 'CANCELED')).toBe('RELEASE');
    });

    it('should return RESTOCK when returning shipped order', () => {
      expect(getStockActionForTransition('SHIPPED', 'RETURNED')).toBe('RESTOCK');
      expect(getStockActionForTransition('DELIVERED', 'RETURNED')).toBe('RESTOCK');
    });

    it('should return null for transitions without stock impact', () => {
      expect(getStockActionForTransition('DRAFT', 'PENDING_CONFIRMATION')).toBeNull();
      expect(getStockActionForTransition('CONFIRMED', 'PACKING')).toBeNull();
    });
  });
});

