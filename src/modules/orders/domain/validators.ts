/**
 * Order Validators (Zod Schemas)
 */

import { z } from 'zod';

/**
 * Order status enum
 */
export const OrderStatusSchema = z.enum([
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
]);

/**
 * Payment state enum
 */
export const PaymentStateSchema = z.enum([
  'UNPAID',
  'PAID',
  'REFUNDED',
  'PARTIAL',
]);

/**
 * Fulfillment status enum
 */
export const FulfillmentStatusSchema = z.enum([
  'UNFULFILLED',
  'PACKING',
  'SHIPPED',
  'DELIVERED',
  'RETURNED',
]);

/**
 * Customer type enum
 */
export const CustomerTypeSchema = z.enum(['PERSONAL', 'BUSINESS']);

/**
 * Payment method enum
 */
export const PaymentMethodSchema = z.enum([
  'COD',
  'BANK_TRANSFER',
  'CASH',
  'CARD',
  'MANUAL_ADJUSTMENT',
  'OTHER',
]);

/**
 * Order item input schema
 */
export const OrderItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  productName: z.string().min(1),
  productSku: z.string().optional(),
});

/**
 * Create order input schema
 */
export const CreateOrderInputSchema = z.object({
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().optional(),
  billingAddress: z.string().optional(),
  buyerType: CustomerTypeSchema.optional().default('PERSONAL'),
  buyerCompanyName: z.string().optional(),
  buyerTaxId: z.string().optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  items: z.array(OrderItemInputSchema).min(1),
  subtotal: z.number().min(0),
  discount: z.number().min(0).optional().default(0),
  tax: z.number().min(0).optional().default(0),
  shippingCost: z.number().min(0).optional().default(0),
  total: z.number().min(0),
  notes: z.string().optional(),
  userId: z.string().optional(),
});

/**
 * Update order status schema
 */
export const UpdateOrderStatusInputSchema = z.object({
  newStatus: OrderStatusSchema,
  noteInternal: z.string().max(1000).optional(),
  noteCustomer: z.string().max(1000).optional(),
  cancelReason: z.string().max(500).optional(),
  force: z.boolean().optional().default(false),
});

/**
 * Order list query schema
 */
export const OrderListQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  orderStatus: z.string().optional(),
  paymentState: z.string().optional(),
  fulfillmentStatus: z.string().optional(),
  customerType: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'updated_desc', 'total_desc', 'total_asc']).default('newest'),
});

/**
 * Add payment schema
 */
export const AddPaymentSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: PaymentMethodSchema.optional().default('OTHER'),
  note: z.string().max(500).optional(),
  paymentDate: z.string().datetime().optional(),
});

/**
 * Update shipping schema
 */
export const UpdateShippingSchema = z.object({
  carrier: z.string().max(100).optional(),
  trackingCode: z.string().max(100).optional(),
});

