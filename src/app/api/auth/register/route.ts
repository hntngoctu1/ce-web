import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';
import {
  customerTypeSchema,
  emailSchema,
  phoneSchema,
  taxIdSchema,
} from '@/lib/validation/customer';

const registerSchema = z
  .object({
    name: z.string().min(2),
    email: emailSchema,
    phone: phoneSchema,
    password: z.string().min(6),

    // Phase 3 (B2B/B2C) - optional, backward compatible
    customerType: customerTypeSchema.optional(),
    companyName: z.string().min(2).max(200).optional(),
    taxId: taxIdSchema.optional(),
    companyEmail: emailSchema.optional(),
  })
  .superRefine((val, ctx) => {
    const inferredType =
      val.customerType ?? (val.companyName || val.taxId ? 'BUSINESS' : 'PERSONAL');

    if (inferredType === 'BUSINESS') {
      if (!val.companyName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companyName'],
          message: 'Company name is required for BUSINESS',
        });
      }
      if (!val.taxId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['taxId'],
          message: 'Tax ID is required for BUSINESS',
        });
      }
    }
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    const customerType =
      data.customerType ?? (data.companyName || data.taxId ? 'BUSINESS' : 'PERSONAL');

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: 'CUSTOMER',
        customerProfile: {
          create: {
            // Default profile fields
            loyaltyPoints: 0,
            customerType,
            companyName: data.companyName,
            taxId: data.taxId,
            companyEmail: data.companyEmail,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
