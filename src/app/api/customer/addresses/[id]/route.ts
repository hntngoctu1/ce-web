import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { addressInputSchema } from '@/lib/validation/customer';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

interface Params {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const address = await prisma.customerAddress.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!address) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ address });
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure ownership
    const existing = await prisma.customerAddress.findFirst({
      where: { id: params.id, userId: session.user.id },
      select: { id: true, kind: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const data = addressInputSchema.parse(body);

    const address = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.customerAddress.updateMany({
          where: { userId: session.user.id, kind: data.kind, isDefault: true },
          data: { isDefault: false },
        });
      }

      return await tx.customerAddress.update({
        where: { id: params.id },
        data: {
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

    return NextResponse.json({ address });
  } catch (error) {
    console.error('Update address error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.customerAddress.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true, kind: true, isDefault: true },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.customerAddress.delete({ where: { id: params.id } });

  // If deleted default, promote newest remaining address of same kind to default (best-effort).
  if (existing.isDefault) {
    const candidate = await prisma.customerAddress.findFirst({
      where: { userId: session.user.id, kind: existing.kind },
      orderBy: { updatedAt: 'desc' },
      select: { id: true },
    });

    if (candidate) {
      await prisma.customerAddress.update({
        where: { id: candidate.id },
        data: { isDefault: true },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
