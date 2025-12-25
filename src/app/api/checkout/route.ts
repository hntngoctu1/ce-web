import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import {
  buyerInfoSchema,
  emailSchema,
  phoneSchema,
  addressInputSchema,
} from '@/lib/validation/customer';
import { allocateOrderCode } from '@/lib/orders/order-code';

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  price: z.number().min(0),
});

// Backward compatible checkout payload: keep legacy flat fields, but allow structured buyerInfo/address snapshots too.
const checkoutSchema = z.object({
  // Legacy flat fields (still accepted)
  name: z.string().min(2),
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().min(5),
  city: z.string().min(2),

  // New structured fields (optional for now; UI will be updated in Phase 4)
  buyerInfo: buyerInfoSchema.optional(),
  shipping: addressInputSchema.partial().optional(),
  billing: addressInputSchema.partial().optional(),

  notes: z.string().optional(),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER']),
  items: z.array(orderItemSchema).min(1),
  subtotal: z.number().min(0),
  total: z.number().min(0),
});

function stripEmptyStrings<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripEmptyStrings) as any;
  if (value && typeof value === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(value as any)) {
      const vv = stripEmptyStrings(v as any);
      if (typeof vv === 'string') {
        const trimmed = vv.trim();
        if (trimmed === '') continue; // drop empty string keys
        out[k] = trimmed;
      } else if (vv !== undefined) {
        out[k] = vv;
      }
    }
    return out;
  }
  if (typeof value === 'string') return value.trim() as any;
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const sanitized = stripEmptyStrings(body);
    const data = checkoutSchema.parse(sanitized);

    // Verify user exists in database to avoid FK constraint violations
    let validUserId: string | null = null;
    if (session?.user?.id) {
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true },
      });
      validUserId = userExists?.id || null;
    }

    // Best-effort snapshot: If logged in and buyerInfo missing, infer from CustomerProfile (keeps old UI working for B2B users).
    const profile = validUserId
      ? await prisma.customerProfile.findUnique({
          where: { userId: validUserId },
          select: { customerType: true, companyName: true, taxId: true, companyEmail: true },
        })
      : null;

    const buyerInfo =
      data.buyerInfo ??
      (profile
        ? {
            customerType: profile.customerType,
            companyName: profile.companyName ?? undefined,
            taxId: profile.taxId ?? undefined,
            companyEmail: profile.companyEmail ?? undefined,
          }
        : { customerType: 'PERSONAL' as const });

    const shippingSnapshot = {
      ...data.shipping,
      // Ensure essential fields exist even for legacy payload
      recipientName: data.shipping?.recipientName ?? data.name,
      recipientEmail: data.shipping?.recipientEmail ?? data.email,
      recipientPhone: data.shipping?.recipientPhone ?? data.phone,
      addressLine1: data.shipping?.addressLine1 ?? data.address,
      city: data.shipping?.city ?? data.city,
      country: data.shipping?.country ?? 'Vietnam',
    };

    const billingSnapshot = data.billing
      ? {
          ...data.billing,
          recipientName: data.billing.recipientName ?? data.name,
          recipientEmail: data.billing.recipientEmail ?? data.email,
          recipientPhone: data.billing.recipientPhone ?? data.phone,
          country: data.billing.country ?? 'Vietnam',
        }
      : undefined;

    const order = await prisma.$transaction(async (tx) => {
      // Allocate human-friendly order code (CE-YYYY-000123)
      const { orderCode } = await allocateOrderCode(tx as any);

      // Snapshot product details (avoid relying on future product changes)
      // Also verify products exist to avoid FK constraint violations
      const itemsCreate = await Promise.all(
        data.items.map(async (item) => {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true, nameEn: true, sku: true },
          });

          return {
            // Only set productId if product exists, otherwise null to avoid FK violation
            productId: product?.id || null,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            productName: product?.nameEn || 'Unknown Product',
            productSku: product?.sku || null,
          };
        })
      );

      const created = await tx.order.create({
        data: {
          // Keep legacy field, but set to the human-friendly code for new orders
          orderNumber: orderCode,
          orderCode,
          userId: validUserId,

          customerName: data.name,
          customerEmail: data.email,
          customerPhone: data.phone,
          shippingAddress: `${data.address}, ${data.city}`,

          buyerType: buyerInfo.customerType,
          buyerCompanyName: buyerInfo.companyName,
          buyerTaxId: buyerInfo.taxId,
          buyerCompanyEmail: buyerInfo.companyEmail,
          buyerSnapshot: JSON.stringify({
            ...buyerInfo,
            name: data.name,
            email: data.email,
            phone: data.phone,
          }),

          shippingSnapshot: JSON.stringify(shippingSnapshot),
          billingSnapshot: billingSnapshot ? JSON.stringify(billingSnapshot) : null,

          // Pricing
          subtotal: data.subtotal,
          total: data.total,
          totalAmount: data.total,
          paidAmount: 0,
          outstandingAmount: data.total,
          currency: 'VND',

          orderDate: new Date(),
          dueDate:
            buyerInfo.customerType === 'BUSINESS'
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              : null,
          customerKind: buyerInfo.customerType === 'BUSINESS' ? 'BUSINESS' : 'INDIVIDUAL',
          accountingStatus: 'PENDING_PAYMENT',

          // Legacy status fields (used by existing UI)
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: data.paymentMethod,

          // V2 workflow fields (admin module)
          orderStatus: 'PENDING_CONFIRMATION',
          paymentState: 'UNPAID',
          fulfillmentStatus: 'UNFULFILLED',

          notes: data.notes,

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

      // Update customer loyalty points if logged in with valid user
      if (validUserId) {
        // 1 point per 10,000 VND (example)
        const pointsEarned = Math.floor(data.total / 10000);

        // Backward compatible: older users may not have a profile row yet
        await tx.customerProfile.upsert({
          where: { userId: validUserId },
          update: { loyaltyPoints: { increment: pointsEarned } },
          create: {
            userId: validUserId,
            loyaltyPoints: pointsEarned,
          },
        });
      }

      return created;
    });

    // TODO (Phase 4): Send confirmation email + log notification

    return NextResponse.json(
      { orderNumber: order.orderNumber, orderId: order.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Checkout error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
