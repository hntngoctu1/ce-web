/**
 * Order Service
 * 
 * Business logic layer for order operations.
 * Orchestrates repository calls, transactions, and audit logging.
 */

import { prisma, withTransaction, type PrismaTransaction } from '@/shared/database';
import { AppError, ErrorCode } from '@/shared/errors';
import { audit } from '@/shared/logging';
import type { UserContext } from '@/shared/types';
import { OrderRepository } from '../repositories/order.repository';
import {
  isAllowedTransition,
  getFulfillmentStatus,
  getLegacyStatus,
  getStockActionForTransition,
  canCancelOrder,
} from '../domain/state-machine';
import type {
  OrderWithItems,
  OrderListItem,
  OrderFilterOptions,
  OrderSortOption,
  UpdateOrderStatusInput,
  StatusTransitionResult,
  OrderStatus,
} from '../domain/types';

// Import warehouse functions for stock operations
import { executeOrderStockAction, ensureDefaultWarehouse } from '@/lib/warehouse';

interface OrderServiceContext {
  user?: UserContext;
  ip?: string;
  userAgent?: string;
}

/**
 * Order Service class
 */
export class OrderService {
  private context: OrderServiceContext;

  constructor(context: OrderServiceContext = {}) {
    this.context = context;
  }

  /**
   * Get order by ID
   */
  async getById(id: string): Promise<OrderWithItems | null> {
    const repo = new OrderRepository();
    return repo.findById(id);
  }

  /**
   * Get order by order code
   */
  async getByOrderCode(orderCode: string): Promise<OrderWithItems | null> {
    const repo = new OrderRepository();
    return repo.findByOrderCode(orderCode);
  }

  /**
   * List orders with pagination and filters
   */
  async list(options: {
    filters?: OrderFilterOptions;
    sort?: OrderSortOption;
    page?: number;
    pageSize?: number;
  }): Promise<{ orders: OrderListItem[]; total: number }> {
    const repo = new OrderRepository();
    return repo.findMany(options);
  }

  /**
   * Get orders for a specific user
   */
  async getByUserId(userId: string): Promise<OrderWithItems[]> {
    const repo = new OrderRepository();
    return repo.findByUserId(userId);
  }

  /**
   * Update order status with validation and stock operations
   */
  async updateStatus(
    orderId: string,
    input: UpdateOrderStatusInput
  ): Promise<StatusTransitionResult> {
    const { newStatus, noteInternal, noteCustomer, cancelReason, force } = input;

    // Execute status transition in transaction
    const result = await withTransaction(async (tx) => {
      const repo = new OrderRepository(tx);
      const order = await repo.findById(orderId);

      if (!order) {
        throw AppError.notFound('Order', orderId);
      }

      const fromStatus = order.orderStatus;
      const toStatus = newStatus;

      // Validate transition
      if (!isAllowedTransition(fromStatus, toStatus) && !force) {
        throw new AppError(
          ErrorCode.ORDER_INVALID_TRANSITION,
          `Cannot transition from ${fromStatus} to ${toStatus}`,
          [{ from: fromStatus, to: toStatus }]
        );
      }

      // No change and no notes
      if (fromStatus === toStatus && !noteInternal && !noteCustomer) {
        return { orderId, fromStatus, toStatus, changed: false };
      }

      // Cancel requires reason
      if (toStatus === 'CANCELED' && (!cancelReason || cancelReason.trim().length < 3)) {
        throw AppError.validation('Cancel reason is required', [
          { field: 'cancelReason', message: 'Must be at least 3 characters' },
        ]);
      }

      // Build update data
      const now = new Date();
      const fulfillmentStatus = getFulfillmentStatus(toStatus);
      const legacyStatus = getLegacyStatus(toStatus);

      const updateData: Record<string, unknown> = {
        orderStatus: toStatus,
        fulfillmentStatus,
        status: legacyStatus,
      };

      if (toStatus === 'SHIPPED') {
        updateData.shippedAt = now;
      }
      if (toStatus === 'DELIVERED') {
        updateData.deliveredAt = now;
      }
      if (toStatus === 'CANCELED') {
        updateData.canceledAt = now;
        updateData.cancelReason = cancelReason?.trim() || null;
        updateData.fulfillmentStatus = 'UNFULFILLED';
      }

      // Update order
      await repo.update(orderId, updateData);

      // Create status history
      await repo.createStatusHistory({
        orderId,
        fromStatus,
        toStatus,
        actorAdminId: this.context.user?.userId ?? null,
        noteInternal: noteInternal?.trim() || null,
        noteCustomer: noteCustomer?.trim() || null,
      });

      return { orderId, fromStatus, toStatus, changed: true, order };
    });

    // Audit log
    if (result.changed) {
      await audit({
        action: 'ORDER_STATUS_CHANGED',
        entityType: 'Order',
        entityId: orderId,
        before: { status: result.fromStatus },
        after: { status: result.toStatus },
        userId: this.context.user?.userId,
        ip: this.context.ip,
        userAgent: this.context.userAgent,
      });

      // Execute stock operations (outside transaction for better error handling)
      const stockAction = getStockActionForTransition(
        result.fromStatus as OrderStatus,
        result.toStatus as OrderStatus
      );

      if (stockAction && result.order?.items?.length) {
        try {
          await this.executeStockAction(orderId, result.order, stockAction);
        } catch (stockError) {
          // Log but don't fail - stock can be adjusted manually
          console.error('Auto stock operation failed:', stockError);
        }
      }
    }

    return {
      success: true,
      orderId,
      fromStatus: result.fromStatus as OrderStatus,
      toStatus: result.toStatus as OrderStatus,
      stockAction: result.changed
        ? (getStockActionForTransition(
            result.fromStatus as OrderStatus,
            result.toStatus as OrderStatus
          ) ?? undefined)
        : undefined,
    };
  }

  /**
   * Add payment to order
   */
  async addPayment(
    orderId: string,
    input: {
      amount: number;
      paymentMethod?: string;
      note?: string;
      paymentDate?: Date;
    }
  ): Promise<void> {
    await withTransaction(async (tx) => {
      const repo = new OrderRepository(tx);
      const order = await repo.findById(orderId);

      if (!order) {
        throw AppError.notFound('Order', orderId);
      }

      // Validate payment amount
      const totalPaid = await repo.getTotalPaid(orderId);
      const orderTotal = Number(order.total);
      const outstanding = orderTotal - totalPaid;

      if (input.amount > outstanding) {
        throw new AppError(
          ErrorCode.PAYMENT_EXCEEDS_OUTSTANDING,
          `Payment amount ${input.amount} exceeds outstanding balance ${outstanding}`,
          [{ amount: input.amount, outstanding }]
        );
      }

      // Add payment
      await repo.addPayment({
        orderId,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        note: input.note,
        actorAdminId: this.context.user?.userId,
        paymentDate: input.paymentDate,
      });

      // Update order payment state
      const newTotalPaid = totalPaid + input.amount;
      let paymentState: 'UNPAID' | 'PARTIAL' | 'PAID' = 'UNPAID';
      if (newTotalPaid >= orderTotal) {
        paymentState = 'PAID';
      } else if (newTotalPaid > 0) {
        paymentState = 'PARTIAL';
      }

      await repo.update(orderId, {
        paidAmount: newTotalPaid,
        outstandingAmount: orderTotal - newTotalPaid,
        paymentState,
        paymentStatus: paymentState === 'PAID' ? 'PAID' : 'PENDING',
      });
    });

    // Audit log
    await audit({
      action: 'ORDER_PAYMENT_ADDED',
      entityType: 'Payment',
      entityId: orderId,
      after: { amount: input.amount, paymentMethod: input.paymentMethod },
      userId: this.context.user?.userId,
      ip: this.context.ip,
      userAgent: this.context.userAgent,
    });
  }

  /**
   * Get order status history
   */
  async getStatusHistory(orderId: string) {
    const repo = new OrderRepository();
    return repo.getStatusHistory(orderId);
  }

  /**
   * Get order payments
   */
  async getPayments(orderId: string) {
    const repo = new OrderRepository();
    return repo.getPayments(orderId);
  }

  /**
   * Execute stock action for order
   */
  private async executeStockAction(
    orderId: string,
    order: OrderWithItems,
    action: 'RESERVE' | 'DEDUCT' | 'RELEASE' | 'RESTOCK'
  ): Promise<void> {
    const defaultWarehouse = await ensureDefaultWarehouse(prisma);
    const stockItems = order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      productName: item.productName,
    }));

    await executeOrderStockAction(prisma, {
      orderId,
      action,
      items: stockItems,
      warehouseId: defaultWarehouse.id,
      createdBy: this.context.user?.userId ?? null,
    });
  }
}

/**
 * Create order service with context
 */
export function createOrderService(context: OrderServiceContext = {}): OrderService {
  return new OrderService(context);
}

/**
 * Default service instance (without context)
 */
export const orderService = new OrderService();

