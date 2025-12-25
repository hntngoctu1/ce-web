import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { profileUpdateSchema } from '@/lib/validation/customer';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      customerProfile: {
        select: {
          customerType: true,
          companyName: true,
          taxId: true,
          companyEmail: true,
          loyaltyPoints: true,
          address: true,
          city: true,
          province: true,
          postalCode: true,
          country: true,
        },
      },
    },
  });

  // User must exist if session is valid, but keep safe.
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = profileUpdateSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        phone: data.phone,
        customerProfile: {
          upsert: {
            create: {
              customerType: data.customerType ?? 'PERSONAL',
              companyName: data.companyName,
              taxId: data.taxId,
              companyEmail: data.companyEmail,
            },
            update: {
              customerType: data.customerType,
              companyName: data.companyName,
              taxId: data.taxId,
              companyEmail: data.companyEmail,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        customerProfile: {
          select: {
            customerType: true,
            companyName: true,
            taxId: true,
            companyEmail: true,
            loyaltyPoints: true,
          },
        },
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('Profile update error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
