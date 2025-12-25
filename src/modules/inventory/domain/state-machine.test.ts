/**
 * Inventory State Machine Tests
 */

import { describe, it, expect } from 'vitest';
import {
  STOCK_DOCUMENT_STATUS_FLOW,
  isAllowedDocumentTransition,
  canPostDocument,
  canVoidDocument,
  getInventoryDirection,
  getQuantitySign,
  getReservedQtyChange,
} from './state-machine';

describe('Inventory State Machine', () => {
  describe('STOCK_DOCUMENT_STATUS_FLOW', () => {
    it('should define transitions for all document statuses', () => {
      expect(STOCK_DOCUMENT_STATUS_FLOW).toHaveProperty('DRAFT');
      expect(STOCK_DOCUMENT_STATUS_FLOW).toHaveProperty('POSTED');
      expect(STOCK_DOCUMENT_STATUS_FLOW).toHaveProperty('VOID');
    });

    it('should allow DRAFT to POSTED and VOID', () => {
      expect(STOCK_DOCUMENT_STATUS_FLOW.DRAFT).toContain('POSTED');
      expect(STOCK_DOCUMENT_STATUS_FLOW.DRAFT).toContain('VOID');
    });

    it('should allow POSTED to VOID only', () => {
      expect(STOCK_DOCUMENT_STATUS_FLOW.POSTED).toContain('VOID');
      expect(STOCK_DOCUMENT_STATUS_FLOW.POSTED).toHaveLength(1);
    });

    it('should have no transitions from VOID', () => {
      expect(STOCK_DOCUMENT_STATUS_FLOW.VOID).toEqual([]);
    });
  });

  describe('isAllowedDocumentTransition', () => {
    it('should allow same status transition', () => {
      expect(isAllowedDocumentTransition('DRAFT', 'DRAFT')).toBe(true);
      expect(isAllowedDocumentTransition('POSTED', 'POSTED')).toBe(true);
    });

    it('should allow DRAFT to POSTED', () => {
      expect(isAllowedDocumentTransition('DRAFT', 'POSTED')).toBe(true);
    });

    it('should allow DRAFT to VOID', () => {
      expect(isAllowedDocumentTransition('DRAFT', 'VOID')).toBe(true);
    });

    it('should allow POSTED to VOID', () => {
      expect(isAllowedDocumentTransition('POSTED', 'VOID')).toBe(true);
    });

    it('should not allow VOID to any other status', () => {
      expect(isAllowedDocumentTransition('VOID', 'DRAFT')).toBe(false);
      expect(isAllowedDocumentTransition('VOID', 'POSTED')).toBe(false);
    });

    it('should not allow POSTED to DRAFT', () => {
      expect(isAllowedDocumentTransition('POSTED', 'DRAFT')).toBe(false);
    });
  });

  describe('canPostDocument', () => {
    it('should allow posting DRAFT documents', () => {
      expect(canPostDocument('DRAFT')).toBe(true);
    });

    it('should not allow posting POSTED documents', () => {
      expect(canPostDocument('POSTED')).toBe(false);
    });

    it('should not allow posting VOID documents', () => {
      expect(canPostDocument('VOID')).toBe(false);
    });
  });

  describe('canVoidDocument', () => {
    it('should allow voiding DRAFT documents', () => {
      expect(canVoidDocument('DRAFT')).toBe(true);
    });

    it('should allow voiding POSTED documents', () => {
      expect(canVoidDocument('POSTED')).toBe(true);
    });

    it('should not allow voiding already VOID documents', () => {
      expect(canVoidDocument('VOID')).toBe(false);
    });
  });

  describe('getInventoryDirection', () => {
    it('should return IN for receipt documents', () => {
      expect(getInventoryDirection('GRN')).toBe('IN');
      expect(getInventoryDirection('RESTOCK')).toBe('IN');
      expect(getInventoryDirection('RELEASE')).toBe('IN');
    });

    it('should return OUT for issue documents', () => {
      expect(getInventoryDirection('ISSUE')).toBe('OUT');
      expect(getInventoryDirection('DEDUCT')).toBe('OUT');
      expect(getInventoryDirection('RESERVE')).toBe('OUT');
    });

    it('should return TRANSFER for transfer documents', () => {
      expect(getInventoryDirection('TRANSFER')).toBe('TRANSFER');
    });

    it('should return ADJUST for adjustment documents', () => {
      expect(getInventoryDirection('ADJUSTMENT')).toBe('ADJUST');
    });
  });

  describe('getQuantitySign', () => {
    it('should return 1 for receipt operations', () => {
      expect(getQuantitySign('GRN')).toBe(1);
      expect(getQuantitySign('RESTOCK')).toBe(1);
    });

    it('should return -1 for issue operations', () => {
      expect(getQuantitySign('ISSUE')).toBe(-1);
      expect(getQuantitySign('DEDUCT')).toBe(-1);
    });

    it('should return 0 for reserve/release (affects reserved only)', () => {
      expect(getQuantitySign('RESERVE')).toBe(0);
      expect(getQuantitySign('RELEASE')).toBe(0);
    });

    it('should return 0 for adjustment (sign from qty)', () => {
      expect(getQuantitySign('ADJUSTMENT')).toBe(0);
    });
  });

  describe('getReservedQtyChange', () => {
    it('should return 1 for RESERVE', () => {
      expect(getReservedQtyChange('RESERVE')).toBe(1);
    });

    it('should return -1 for RELEASE and DEDUCT', () => {
      expect(getReservedQtyChange('RELEASE')).toBe(-1);
      expect(getReservedQtyChange('DEDUCT')).toBe(-1);
    });

    it('should return 0 for other operations', () => {
      expect(getReservedQtyChange('GRN')).toBe(0);
      expect(getReservedQtyChange('ISSUE')).toBe(0);
      expect(getReservedQtyChange('ADJUSTMENT')).toBe(0);
    });
  });
});

