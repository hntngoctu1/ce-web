import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { addressInputSchema } from '@/lib/validation/customer';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const addresses = await prisma.customerAddress.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
  });

  return NextResponse.json({ addresses });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = addressInputSchema.parse(body);

    const address = await prisma.$transaction(async (tx) => {
      // If setting default, clear others for this kind.
      if (data.isDefault) {
        await tx.customerAddress.updateMany({
          where: { userId: session.user.id, kind: data.kind, isDefault: true },
          data: { isDefault: false },
        });
      }

      return await tx.customerAddress.create({
        data: {
          userId: session.user.id,
          kind: data.kind,
          label: data.label,

          recipientName: data.recipientName,
          recipientEmail: data.recipientEmail,
          recipientPhone: data.recipientPhone,

          companyName: data.companyName,
          taxId: data.taxId,

          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          ward: data.ward,
          district: data.district,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          country: data.country,

          isDefault: !!data.isDefault,
        },
      });
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    console.error('Create address error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}
