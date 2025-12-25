/**
 * Order Repository
 * 
 * Database access layer for orders.
 * All Prisma queries for orders should go through this repository.
 */

import type { Prisma } from '@prisma/client';
import { prisma, type PrismaTransaction } from '@/shared/database';
import type { 
  OrderWithItems, 
  OrderListItem, 
  OrderFilterOptions,
  OrderSortOption,
} from '../domain/types';

/**
 * Order repository class
 */
export class OrderRepository {
  private db: PrismaTransaction | typeof prisma;

  constructor(tx?: PrismaTransaction) {
    this.db = tx ?? prisma;
  }

  /**
   * Find order by ID
   */
  async findById(id: string): Promise<OrderWithItems | null> {
    return this.db.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  /**
   * Find order by order code
   */
  async findByOrderCode(orderCode: string): Promise<OrderWithItems | null> {
    return this.db.order.findUnique({
      where: { orderCode },
      include: { items: true },
    });
  }

  /**
   * Find orders with pagination and filters
   */
  async findMany(options: {
    filters?: OrderFilterOptions;
    sort?: OrderSortOption;
    page?: number;
    pageSize?: number;
  }): Promise<{ orders: OrderListItem[]; total: number }> {
    const { filters = {}, sort = 'newest', page = 1, pageSize = 20 } = options;
    const skip = (page - 1) * pageSize;

    const where = this.buildWhereClause(filters);
    const orderBy = this.buildOrderBy(sort);

    const [orders, total] = await Promise.all([
      this.db.order.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          items: { select: { quantity: true } },
        },
      }),
      this.db.order.count({ where }),
    ]);

    return {
      orders: orders.map((o) => this.toListItem(o)),
      total,
    };
  }

  /**
   * Find orders by user ID
   */
  async findByUserId(userId: string, limit = 50): Promise<OrderWithItems[]> {
    return this.db.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { items: true },
    });
  }

  /**
   * Create order with items
   */
  async create(data: Prisma.OrderCreateInput): Promise<OrderWithItems> {
    return this.db.order.create({
      data,
      include: { items: true },
    });
  }

  /**
   * Update order
   */
  async update(id: string, data: Prisma.OrderUpdateInput): Promise<OrderWithItems> {
    return this.db.order.update({
      where: { id },
      data,
      include: { items: true },
    });
  }

  /**
   * Create order status history entry
   */
  async createStatusHistory(data: {
    orderId: string;
    fromStatus: string | null;
    toStatus: string;
    actorAdminId?: string | null;
    noteInternal?: string | null;
    noteCustomer?: string | null;
  }) {
    return this.db.orderStatusHistory.create({
      data: {
        orderId: data.orderId,
        fromStatus: data.fromStatus as any,
        toStatus: data.toStatus as any,
        actorAdminId: data.actorAdminId ?? null,
        noteInternal: data.noteInternal ?? null,
        noteCustomer: data.noteCustomer ?? null,
      },
    });
  }

  /**
   * Get order status history
   */
  async getStatusHistory(orderId: string) {
    return this.db.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Add payment to order
   */
  async addPayment(data: {
    orderId: string;
    amount: number;
    paymentMethod?: string;
    note?: string;
    actorAdminId?: string;
    paymentDate?: Date;
  }) {
    return this.db.payment.create({
      data: {
        orderId: data.orderId,
        amount: data.amount,
        paymentMethod: (data.paymentMethod ?? 'OTHER') as any,
        note: data.note ?? null,
        actorAdminId: data.actorAdminId ?? null,
        paymentDate: data.paymentDate ?? new Date(),
      },
    });
  }

  /**
   * Get payments for order
   */
  async getPayments(orderId: string) {
    return this.db.payment.findMany({
      where: { orderId },
      orderBy: { paymentDate: 'desc' },
      include: {
        actor: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Calculate total paid amount for order
   */
  async getTotalPaid(orderId: string): Promise<number> {
    const result = await this.db.payment.aggregate({
      where: { orderId },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }

  /**
   * Build where clause from filters
   */
  private buildWhereClause(filters: OrderFilterOptions): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};

    if (filters.q?.trim()) {
      const q = filters.q.trim();
      where.OR = [
        { orderCode: { contains: q } },
        { orderNumber: { contains: q } },
        { customerEmail: { contains: q } },
        { customerPhone: { contains: q } },
        { buyerCompanyName: { contains: q } },
      ];
    }

    if (filters.orderStatus && filters.orderStatus !== 'ALL') {
      where.orderStatus = filters.orderStatus as any;
    }

    if (filters.paymentState && filters.paymentState !== 'ALL') {
      where.paymentState = filters.paymentState as any;
    }

    if (filters.fulfillmentStatus && filters.fulfillmentStatus !== 'ALL') {
      where.fulfillmentStatus = filters.fulfillmentStatus as any;
    }

    if (filters.customerType && filters.customerType !== 'ALL') {
      where.buyerType = filters.customerType as any;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) {
        where.createdAt.gte = filters.from;
      }
      if (filters.to) {
        where.createdAt.lte = filters.to;
      }
    }

    return where;
  }

  /**
   * Build orderBy from sort option
   */
  private buildOrderBy(sort: OrderSortOption): Prisma.OrderOrderByWithRelationInput {
    switch (sort) {
      case 'oldest':
        return { createdAt: 'asc' };
      case 'updated_desc':
        return { updatedAt: 'desc' };
      case 'total_desc':
        return { total: 'desc' };
      case 'total_asc':
        return { total: 'asc' };
      case 'newest':
      default:
        return { createdAt: 'desc' };
    }
  }

  /**
   * Transform to list item
   */
  private toListItem(order: any): OrderListItem {
    return {
      id: order.id,
      orderCode: order.orderCode,
      orderNumber: order.orderNumber,
      userId: order.userId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      buyerType: order.buyerType,
      buyerCompanyName: order.buyerCompanyName,
      subtotal: order.subtotal,
      total: order.total,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentState: order.paymentState,
      orderStatus: order.orderStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      updatedAt: order.updatedAt,
      createdAt: order.createdAt,
      itemsCount: order.items?.reduce((acc: number, it: any) => acc + (it.quantity || 0), 0) ?? 0,
    };
  }
}

/**
 * Default repository instance
 */
export const orderRepository = new OrderRepository();

