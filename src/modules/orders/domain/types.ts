/**
 * Orders Domain Types
 */

import type { 
  Order, 
  OrderItem, 
  OrderStatus, 
  PaymentState, 
  FulfillmentStatus,
  CustomerType,
  PaymentMethod,
} from '@prisma/client';

// Re-export Prisma types
export type { 
  Order, 
  OrderItem, 
  OrderStatus, 
  PaymentState, 
  FulfillmentStatus,
  CustomerType,
  PaymentMethod,
};

/**
 * Order with items
 */
export interface OrderWithItems extends Order {
  items: OrderItem[];
}

/**
 * Order list item (for admin list view)
 */
export interface OrderListItem {
  id: string;
  orderCode: string | null;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  buyerType: CustomerType;
  buyerCompanyName: string | null;
  subtotal: number;
  total: number;
  currency: string;
  paymentMethod: string | null;
  paymentStatus: string;
  paymentState: PaymentState;
  orderStatus: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  updatedAt: Date;
  createdAt: Date;
  itemsCount: number;
}

/**
 * Order creation input
 */
export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  billingAddress?: string;
  buyerType?: CustomerType;
  buyerCompanyName?: string;
  buyerTaxId?: string;
  paymentMethod?: PaymentMethod;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    productName: string;
    productSku?: string;
  }[];
  subtotal: number;
  discount?: number;
  tax?: number;
  shippingCost?: number;
  total: number;
  notes?: string;
  userId?: string;
}

/**
 * Order status update input
 */
export interface UpdateOrderStatusInput {
  newStatus: OrderStatus;
  noteInternal?: string;
  noteCustomer?: string;
  cancelReason?: string;
  force?: boolean;
}

/**
 * Order filter options
 */
export interface OrderFilterOptions {
  q?: string;
  orderStatus?: OrderStatus | 'ALL';
  paymentState?: PaymentState | 'ALL';
  fulfillmentStatus?: FulfillmentStatus | 'ALL';
  customerType?: CustomerType | 'ALL';
  from?: Date;
  to?: Date;
  userId?: string;
}

/**
 * Order sort options
 */
export type OrderSortOption = 
  | 'newest' 
  | 'oldest' 
  | 'updated_desc' 
  | 'total_desc' 
  | 'total_asc';

/**
 * Stock action for order transitions
 */
export type StockAction = 'RESERVE' | 'DEDUCT' | 'RELEASE' | 'RESTOCK';

/**
 * Order status transition result
 */
export interface StatusTransitionResult {
  success: boolean;
  orderId: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  stockAction?: StockAction;
  error?: string;
}

