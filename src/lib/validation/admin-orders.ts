import { z } from 'zod';

export const orderStatusSchema = z.enum([
  'DRAFT',
  'PENDING_CONFIRMATION',
  'CONFIRMED',
  'PACKING',
  'SHIPPED',
  'DELIVERED',
  'CANCELED',
  'RETURN_REQUESTED',
  'RETURNED',
  'FAILED',
]);

export const paymentStateSchema = z.enum(['UNPAID', 'PAID', 'REFUNDED', 'PARTIAL']);

export const fulfillmentStatusSchema = z.enum([
  'UNFULFILLED',
  'PACKING',
  'SHIPPED',
  'DELIVERED',
  'RETURNED',
]);

export const updateOrderStatusSchema = z.object({
  newStatus: orderStatusSchema,
  noteInternal: z.string().max(2000).optional(),
  noteCustomer: z.string().max(2000).optional(),
  notifyCustomer: z.boolean().optional().default(false),
  force: z.boolean().optional().default(false),
  cancelReason: z.string().max(500).optional(),
});

export const updatePaymentSchema = z.object({
  paymentState: paymentStateSchema,
  transactionRef: z.string().max(200).optional().nullable(),
});

export const updateShippingSchema = z.object({
  carrier: z.string().max(100).optional().nullable(),
  trackingCode: z.string().max(100).optional().nullable(),
  markShipped: z.boolean().optional().default(false),
  markDelivered: z.boolean().optional().default(false),
  force: z.boolean().optional().default(false),
});

export const addNoteSchema = z.object({
  noteInternal: z.string().max(2000).optional(),
  noteCustomer: z.string().max(2000).optional(),
});

export const bulkStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  newStatus: orderStatusSchema,
  noteInternal: z.string().max(2000).optional(),
  noteCustomer: z.string().max(2000).optional(),
  force: z.boolean().optional().default(false),
});
