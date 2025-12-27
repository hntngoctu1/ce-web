import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/shared/database';
import { handleError, successResponse, createdResponse } from '@/shared/api';
import { AppError } from '@/shared/errors';

// GET - List coupons (Admin) or check single coupon (Customer)
const listSchema = z.object({
  code: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED', 'EXHAUSTED', 'all']).default('all'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = listSchema.parse(Object.fromEntries(searchParams));
    const session = await getServerSession(authOptions);

    // If code is provided, check single coupon validity
    if (params.code) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: params.code.toUpperCase() },
        include: {
          products: { select: { productId: true } },
          categories: { select: { categoryId: true } },
          customers: { select: { userId: true } },
        },
      });

      if (!coupon) {
        throw AppError.notFound('Mã giảm giá không tồn tại');
      }

      // Check validity
      const now = new Date();
      const isExpired = coupon.expiresAt && coupon.expiresAt < now;
      const isNotStarted = coupon.startsAt > now;
      const isExhausted = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;

      if (coupon.status !== 'ACTIVE' || isExpired || isNotStarted || isExhausted) {
        throw AppError.validation('Mã giảm giá không còn hiệu lực');
      }

      // Check user usage limit
      if (session?.user?.id) {
        const userUsageCount = await prisma.couponUsage.count({
          where: {
            couponId: coupon.id,
            userId: session.user.id,
          },
        });

        if (userUsageCount >= coupon.usagePerUser) {
          throw AppError.validation('Bạn đã sử dụng hết số lần cho mã này');
        }
      }

      return successResponse({
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
        minQuantity: coupon.minQuantity,
        targetType: coupon.targetType,
        productIds: coupon.products.map((p) => p.productId),
        categoryIds: coupon.categories.map((c) => c.categoryId),
        isValid: true,
      });
    }

    // Admin only: List all coupons
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'EDITOR') {
      throw AppError.forbidden();
    }

    const where: any = {};
    if (params.status !== 'all') {
      where.status = params.status;
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          _count: { select: { usages: true } },
        },
      }),
      prisma.coupon.count({ where }),
    ]);

    return successResponse({
      coupons: coupons.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        discountType: c.discountType,
        discountValue: Number(c.discountValue),
        status: c.status,
        usedCount: c.usedCount,
        usageLimit: c.usageLimit,
        startsAt: c.startsAt.toISOString(),
        expiresAt: c.expiresAt?.toISOString(),
        createdAt: c.createdAt.toISOString(),
      })),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

// POST - Create coupon (Admin only)
const createSchema = z.object({
  code: z.string().min(3).max(50).transform((v) => v.toUpperCase()),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FIXED_PRICE', 'BUY_X_GET_Y', 'FREE_SHIPPING', 'BUNDLE']),
  discountValue: z.number().min(0),
  maxDiscount: z.number().min(0).optional(),
  minOrderAmount: z.number().min(0).optional(),
  minQuantity: z.number().min(1).optional(),
  usageLimit: z.number().min(1).optional(),
  usagePerUser: z.number().min(1).default(1),
  startsAt: z.string().transform((v) => new Date(v)),
  expiresAt: z.string().transform((v) => new Date(v)).optional(),
  targetType: z.enum(['ALL', 'SPECIFIC_PRODUCTS', 'SPECIFIC_CATEGORIES', 'SPECIFIC_CUSTOMERS', 'FIRST_ORDER', 'MINIMUM_AMOUNT']).default('ALL'),
  productIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  customerIds: z.array(z.string()).optional(),
  isStackable: z.boolean().default(false),
  priority: z.number().default(0),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'EDITOR') {
      throw AppError.forbidden();
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    // Check code uniqueness
    const existing = await prisma.coupon.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw AppError.validation('Mã giảm giá này đã tồn tại');
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxDiscount: data.maxDiscount,
        minOrderAmount: data.minOrderAmount,
        minQuantity: data.minQuantity,
        usageLimit: data.usageLimit,
        usagePerUser: data.usagePerUser,
        startsAt: data.startsAt,
        expiresAt: data.expiresAt,
        targetType: data.targetType,
        isStackable: data.isStackable,
        priority: data.priority,
        createdBy: session.user.id,
        products: data.productIds
          ? { create: data.productIds.map((id) => ({ productId: id })) }
          : undefined,
        categories: data.categoryIds
          ? { create: data.categoryIds.map((id) => ({ categoryId: id })) }
          : undefined,
        customers: data.customerIds
          ? { create: data.customerIds.map((id) => ({ userId: id })) }
          : undefined,
      },
    });

    return createdResponse({
      id: coupon.id,
      code: coupon.code,
      message: 'Đã tạo mã giảm giá thành công',
    });
  } catch (error) {
    return handleError(error);
  }
}

