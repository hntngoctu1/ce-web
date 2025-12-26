/**
 * Checkout API Route
 * 
 * Creates a new order from cart checkout.
 * Supports both guest and authenticated checkout.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import {
  createdResponse,
  handleError,
  parseBody,
} from '@/shared';
import { rateLimit, RATE_LIMITS } from '@/shared/security';
import { createCheckoutService } from '@/modules/orders';
import {
  buyerInfoSchema,
  emailSchema,
  phoneSchema,
  addressInputSchema,
} from '@/lib/validation/customer';

// ==================== Validation Schema ====================

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  price: z.number().min(0),
});

const checkoutSchema = z.object({
  // Customer info (required)
  name: z.string().min(2),
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().min(5),
  city: z.string().min(2),

  // Buyer info (optional - for B2B)
  buyerInfo: buyerInfoSchema.optional(),
  
  // Address snapshots (optional)
  shipping: addressInputSchema.partial().optional(),
  billing: addressInputSchema.partial().optional(),

  // Order details
  notes: z.string().optional(),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER']),
  items: z.array(orderItemSchema).min(1),
  subtotal: z.number().min(0),
  total: z.number().min(0),
  
  // Idempotency key (optional)
  idempotencyKey: z.string().optional(),
});

// ==================== Helper ====================

function stripEmptyStrings<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripEmptyStrings) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const vv = stripEmptyStrings(v);
      if (typeof vv === 'string') {
        const trimmed = vv.trim();
        if (trimmed === '') continue;
        out[k] = trimmed;
      } else if (vv !== undefined) {
        out[k] = vv;
      }
    }
    return out as T;
  }
  if (typeof value === 'string') return value.trim() as T;
  return value;
}

// ==================== Route Handler ====================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimited = rateLimit(request, RATE_LIMITS.CHECKOUT);
    if (rateLimited) return rateLimited;

    // Get session (optional - guest checkout allowed)
    const session = await auth();

    // Parse and validate request body
    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body' } },
        { status: 400 }
      );
    }
    
    const sanitizedBody = stripEmptyStrings(rawBody);
    const data = checkoutSchema.parse(sanitizedBody);

    // Create service with context
    const checkoutService = createCheckoutService({
      user: session?.user ? {
        userId: session.user.id ?? '',
        email: session.user.email ?? '',
        role: session.user.role ?? 'CUSTOMER',
        name: session.user.name,
      } : undefined,
      ip: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    // Process checkout
    const result = await checkoutService.checkout({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      buyerInfo: data.buyerInfo,
      shipping: data.shipping,
      billing: data.billing,
      items: data.items,
      subtotal: data.subtotal,
      total: data.total,
      notes: data.notes,
      paymentMethod: data.paymentMethod,
      idempotencyKey: data.idempotencyKey,
    });

    // Return standardized response
    return createdResponse({
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      orderCode: result.orderCode,
    });

  } catch (error) {
    // Handle Zod validation errors specially for backward compatibility
    if (error instanceof z.ZodError) {
      return handleError(error);
    }
    return handleError(error);
  }
}
