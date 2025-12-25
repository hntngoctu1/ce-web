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

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = productSchema.parse(body);

    // Check for duplicate slug
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A product with this slug already exists' },
        { status: 400 }
      );
    }

    const images = (data.images || []).filter((i) => Boolean(i?.url));
    const hasPrimary = images.some((i) => i.isPrimary);

    const product = await prisma.product.create({
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
        stockQuantity: 0, // Deprecated - use InventoryItem instead
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

    // Auto-create InventoryItem for the new product in default warehouse
    const defaultWarehouse = await prisma.warehouse.findFirst({ where: { isDefault: true } });
    if (defaultWarehouse) {
      await prisma.inventoryItem.create({
        data: {
          productId: product.id,
          warehouseId: defaultWarehouse.id,
          onHandQty: 0,
          reservedQty: 0,
          availableQty: 0,
          reorderPointQty: 0,
          reorderQty: 0,
        },
      });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
