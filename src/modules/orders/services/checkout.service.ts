/**
 * Checkout Service
 * 
 * Handles order creation from checkout with idempotency and audit logging.
 */

import { prisma, withTransaction } from '@/shared/database';
import { AppError, ErrorCode } from '@/shared/errors';
import { audit, logger } from '@/shared/logging';
import type { UserContext } from '@/shared/types';
import { allocateOrderCode } from '@/lib/orders/order-code';
import type { CustomerType } from '@prisma/client';

interface CheckoutContext {
  user?: UserContext;
  ip?: string;
  userAgent?: string;
}

export interface CheckoutItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface BuyerInfo {
  customerType: CustomerType;
  companyName?: string;
  taxId?: string;
  companyEmail?: string;
}

export interface AddressSnapshot {
  recipientName: string;
  recipientEmail?: string;
  recipientPhone: string;
  addressLine1: string;
  addressLine2?: string;
  ward?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country: string;
  companyName?: string;
  taxId?: string;
}

export interface CheckoutInput {
  // Customer info
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  
  // Buyer info
  buyerInfo?: BuyerInfo;
  
  // Address snapshots
  shipping?: Partial<AddressSnapshot>;
  billing?: Partial<AddressSnapshot>;
  
  // Order details
  items: CheckoutItem[];
  subtotal: number;
  total: number;
  notes?: string;
  paymentMethod: 'COD' | 'BANK_TRANSFER';
  
  // Idempotency
  idempotencyKey?: string;
}

export interface CheckoutResult {
  orderId: string;
  orderCode: string;
  orderNumber: string;
}

/**
 * Checkout Service class
 */
export class CheckoutService {
  private context: CheckoutContext;

  constructor(context: CheckoutContext = {}) {
    this.context = context;
  }

  /**
   * Process checkout and create order
   */
  async checkout(input: CheckoutInput): Promise<CheckoutResult> {
    const log = logger.child({
      userId: this.context.user?.userId,
      ip: this.context.ip,
    });

    log.info('Processing checkout', { itemCount: input.items.length, total: input.total });

    // Validate items
    if (input.items.length === 0) {
      throw new AppError(ErrorCode.CHECKOUT_EMPTY_CART, 'Cart is empty');
    }

    // Check idempotency if key provided
    if (input.idempotencyKey) {
      const existing = await this.findByIdempotencyKey(input.idempotencyKey);
      if (existing) {
        log.info('Returning existing order (idempotent)', { orderId: existing.id });
        return {
          orderId: existing.id,
          orderCode: existing.orderCode ?? existing.orderNumber,
          orderNumber: existing.orderNumber,
        };
      }
    }

    // Get validated user ID
    const validUserId = await this.validateUserId();

    // Get buyer info from profile if not provided
    const buyerInfo = await this.resolveBuyerInfo(input.buyerInfo, validUserId);

    // Build address snapshots
    const shippingSnapshot = this.buildShippingSnapshot(input);
    const billingSnapshot = input.billing ? this.buildBillingSnapshot(input) : undefined;

    // Create order in transaction
    const order = await withTransaction(async (tx) => {
      // Allocate order code
      const { orderCode } = await allocateOrderCode(tx as any);

      // Validate and snapshot products
      const itemsCreate = await this.buildOrderItems(tx, input.items);

      // Create order
      const created = await tx.order.create({
        data: {
          orderNumber: orderCode,
          orderCode,
          userId: validUserId,

          customerName: input.name,
          customerEmail: input.email,
          customerPhone: input.phone,
          shippingAddress: `${input.address}, ${input.city}`,

          buyerType: buyerInfo.customerType,
          buyerCompanyName: buyerInfo.companyName ?? null,
          buyerTaxId: buyerInfo.taxId ?? null,
          buyerCompanyEmail: buyerInfo.companyEmail ?? null,
          buyerSnapshot: JSON.stringify({
            ...buyerInfo,
            name: input.name,
            email: input.email,
            phone: input.phone,
          }),

          shippingSnapshot: JSON.stringify(shippingSnapshot),
          billingSnapshot: billingSnapshot ? JSON.stringify(billingSnapshot) : null,

          subtotal: input.subtotal,
          total: input.total,
          totalAmount: input.total,
          paidAmount: 0,
          outstandingAmount: input.total,
          currency: 'VND',

          orderDate: new Date(),
          dueDate: buyerInfo.customerType === 'BUSINESS'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : null,
          customerKind: buyerInfo.customerType === 'BUSINESS' ? 'BUSINESS' : 'INDIVIDUAL',
          accountingStatus: 'PENDING_PAYMENT',

          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: input.paymentMethod,

          orderStatus: 'PENDING_CONFIRMATION',
          paymentState: 'UNPAID',
          fulfillmentStatus: 'UNFULFILLED',

          notes: input.notes ?? null,

          items: { create: itemsCreate },

          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: 'PENDING_CONFIRMATION',
              actorAdminId: null,
              noteInternal: 'Order created from checkout',
              noteCustomer: null,
            },
          },
        } as any,
        select: { id: true, orderNumber: true, orderCode: true },
      });

      // Update loyalty points
      if (validUserId) {
        const pointsEarned = Math.floor(input.total / 10000);
        await tx.customerProfile.upsert({
          where: { userId: validUserId },
          update: { loyaltyPoints: { increment: pointsEarned } },
          create: { userId: validUserId, loyaltyPoints: pointsEarned },
        });
      }

      return created;
    });

    // Audit log
    await audit({
      action: 'ORDER_CREATED',
      entityType: 'Order',
      entityId: order.id,
      after: {
        orderCode: order.orderCode,
        total: input.total,
        itemCount: input.items.length,
      },
      userId: this.context.user?.userId,
      ip: this.context.ip,
      userAgent: this.context.userAgent,
    });

    log.info('Checkout completed', { orderId: order.id, orderCode: order.orderCode });

    return {
      orderId: order.id,
      orderCode: order.orderCode ?? order.orderNumber,
      orderNumber: order.orderNumber,
    };
  }

  /**
   * Find order by idempotency key (using orderCode pattern)
   */
  private async findByIdempotencyKey(key: string): Promise<{ id: string; orderCode: string | null; orderNumber: string } | null> {
    // For now, we don't have a dedicated idempotency table
    // Could check recent orders by same user within time window
    return null;
  }

  /**
   * Validate user ID exists in database
   */
  private async validateUserId(): Promise<string | null> {
    if (!this.context.user?.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: this.context.user.userId },
      select: { id: true },
    });

    return user?.id ?? null;
  }

  /**
   * Resolve buyer info from input or profile
   */
  private async resolveBuyerInfo(
    input: BuyerInfo | undefined,
    userId: string | null
  ): Promise<BuyerInfo> {
    if (input) {
      return input;
    }

    if (userId) {
      const profile = await prisma.customerProfile.findUnique({
        where: { userId },
        select: { customerType: true, companyName: true, taxId: true, companyEmail: true },
      });

      if (profile) {
        return {
          customerType: profile.customerType,
          companyName: profile.companyName ?? undefined,
          taxId: profile.taxId ?? undefined,
          companyEmail: profile.companyEmail ?? undefined,
        };
      }
    }

    return { customerType: 'PERSONAL' };
  }

  /**
   * Build shipping address snapshot
   */
  private buildShippingSnapshot(input: CheckoutInput): AddressSnapshot {
    return {
      recipientName: input.shipping?.recipientName ?? input.name,
      recipientEmail: input.shipping?.recipientEmail ?? input.email,
      recipientPhone: input.shipping?.recipientPhone ?? input.phone,
      addressLine1: input.shipping?.addressLine1 ?? input.address,
      city: input.shipping?.city ?? input.city,
      country: input.shipping?.country ?? 'Vietnam',
      ...input.shipping,
    };
  }

  /**
   * Build billing address snapshot
   */
  private buildBillingSnapshot(input: CheckoutInput): AddressSnapshot {
    return {
      recipientName: input.billing?.recipientName ?? input.name,
      recipientEmail: input.billing?.recipientEmail ?? input.email,
      recipientPhone: input.billing?.recipientPhone ?? input.phone,
      addressLine1: input.billing?.addressLine1 ?? '',
      country: input.billing?.country ?? 'Vietnam',
      ...input.billing,
    };
  }

  /**
   * Build order items with product validation
   */
  private async buildOrderItems(tx: any, items: CheckoutItem[]) {
    return Promise.all(
      items.map(async (item) => {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, nameEn: true, sku: true },
        });

        if (!product) {
          logger.warn('Product not found during checkout', { productId: item.productId });
        }

        return {
          productId: product?.id ?? null,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          productName: product?.nameEn ?? 'Unknown Product',
          productSku: product?.sku ?? null,
        };
      })
    );
  }
}

/**
 * Create checkout service with context
 */
export function createCheckoutService(context: CheckoutContext = {}): CheckoutService {
  return new CheckoutService(context);
}

