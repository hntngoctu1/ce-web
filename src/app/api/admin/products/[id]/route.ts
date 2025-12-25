import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const productSchema = z.object({
  nameEn: z.string().min(1),
  nameVi: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().optional().nullable(),
  shortDescEn: z.string().optional().nullable(),
  shortDescVi: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  descriptionVi: z.string().optional().nullable(),
  price: z.number().min(0),
  salePrice: z.number().min(0).optional().nullable(),
  groupId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  industryId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        alt: z.string().optional().nullable(),
        isPrimary: z.boolean().optional(),
      })
    )
    .optional()
    .default([]),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        specs: { orderBy: { order: 'asc' } },
        group: true,
        brand: true,
        industry: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = productSchema.parse(body);

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check for duplicate slug (excluding current product)
    const duplicateSlug = await prisma.product.findFirst({
      where: {
        slug: data.slug,
        id: { not: id },
      },
    });

    if (duplicateSlug) {
      return NextResponse.json(
        { error: 'A product with this slug already exists' },
        { status: 400 }
      );
    }

    const images = (data.images || []).filter((i) => Boolean(i?.url));
    const hasPrimary = images.some((i) => i.isPrimary);

    const product = await prisma.$transaction(async (tx) => {
      // Replace images fully to keep ordering simple + deterministic.
      await tx.productImage.deleteMany({ where: { productId: id } });

      return tx.product.update({
        where: { id },
        data: {
          ...data,
          images: undefined,
          sku: data.sku || null,
          shortDescEn: data.shortDescEn || null,
          shortDescVi: data.shortDescVi || null,
          descriptionEn: data.descriptionEn || null,
          descriptionVi: data.descriptionVi || null,
          salePrice: data.salePrice || null,
          groupId: data.groupId || null,
          brandId: data.brandId || null,
          industryId: data.industryId || null,
          ...(images.length
            ? {
                images: {
                  create: images.map((img, idx) => ({
                    url: img.url,
                    alt: img.alt || null,
                    order: idx,
                    isPrimary: img.isPrimary ?? (!hasPrimary && idx === 0),
                  })),
                },
              }
            : {}),
        },
        include: { images: { orderBy: { order: 'asc' } } },
      });
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
