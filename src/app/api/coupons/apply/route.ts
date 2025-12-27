import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/shared/database';
import { handleError, successResponse } from '@/shared/api';
import { AppError } from '@/shared/errors';
import { Decimal } from '@prisma/client/runtime/library';

// Calculate discount for cart
const applySchema = z.object({
  code: z.string().transform((v) => v.toUpperCase()),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      price: z.number().min(0),
      groupId: z.string().optional(),
    })
  ),
  subtotal: z.number().min(0),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const { code, items, subtotal } = applySchema.parse(body);

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code },
      include: {
        products: { select: { productId: true } },
        categories: { select: { categoryId: true } },
        customers: { select: { userId: true } },
      },
    });

    if (!coupon) {
      throw AppError.notFound('Mã giảm giá không tồn tại');
    }

    // Validate coupon status
    const now = new Date();
    
    if (coupon.status !== 'ACTIVE') {
      throw AppError.validation('Mã giảm giá không còn hoạt động');
    }

    if (coupon.startsAt > now) {
      throw AppError.validation('Mã giảm giá chưa có hiệu lực');
    }

    if (coupon.expiresAt && coupon.expiresAt < now) {
      throw AppError.validation('Mã giảm giá đã hết hạn');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw AppError.validation('Mã giảm giá đã hết lượt sử dụng');
    }

    // Check user-specific limits
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

    // Check minimum order amount
    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      throw AppError.validation(
        `Đơn hàng tối thiểu ${Number(coupon.minOrderAmount).toLocaleString('vi-VN')} VND để sử dụng mã này`
      );
    }

    // Check minimum quantity
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    if (coupon.minQuantity && totalQuantity < coupon.minQuantity) {
      throw AppError.validation(
        `Cần mua tối thiểu ${coupon.minQuantity} sản phẩm để sử dụng mã này`
      );
    }

    // Check target type restrictions
    let eligibleItems = items;
    let eligibleSubtotal = subtotal;

    switch (coupon.targetType) {
      case 'SPECIFIC_PRODUCTS':
        const productIds = coupon.products.map((p) => p.productId);
        eligibleItems = items.filter((item) => productIds.includes(item.productId));
        if (eligibleItems.length === 0) {
          throw AppError.validation('Mã giảm giá không áp dụng cho sản phẩm trong giỏ hàng');
        }
        eligibleSubtotal = eligibleItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        break;

      case 'SPECIFIC_CATEGORIES':
        const categoryIds = coupon.categories.map((c) => c.categoryId);
        eligibleItems = items.filter(
          (item) => item.groupId && categoryIds.includes(item.groupId)
        );
        if (eligibleItems.length === 0) {
          throw AppError.validation('Mã giảm giá không áp dụng cho danh mục sản phẩm trong giỏ hàng');
        }
        eligibleSubtotal = eligibleItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        break;

      case 'SPECIFIC_CUSTOMERS':
        if (!session?.user?.id) {
          throw AppError.validation('Vui lòng đăng nhập để sử dụng mã này');
        }
        const customerIds = coupon.customers.map((c) => c.userId);
        if (!customerIds.includes(session.user.id)) {
          throw AppError.validation('Mã giảm giá không áp dụng cho tài khoản của bạn');
        }
        break;

      case 'FIRST_ORDER':
        if (!session?.user?.id) {
          throw AppError.validation('Vui lòng đăng nhập để sử dụng mã này');
        }
        const orderCount = await prisma.order.count({
          where: { userId: session.user.id },
        });
        if (orderCount > 0) {
          throw AppError.validation('Mã giảm giá chỉ áp dụng cho đơn hàng đầu tiên');
        }
        break;
    }

    // Calculate discount
    let discountAmount = 0;

    switch (coupon.discountType) {
      case 'PERCENTAGE':
        discountAmount = (eligibleSubtotal * Number(coupon.discountValue)) / 100;
        if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
          discountAmount = Number(coupon.maxDiscount);
        }
        break;

      case 'FIXED_AMOUNT':
        discountAmount = Math.min(Number(coupon.discountValue), eligibleSubtotal);
        break;

      case 'FREE_SHIPPING':
        // Will be handled at checkout
        discountAmount = 0;
        break;

      default:
        discountAmount = Number(coupon.discountValue);
    }

    // Round discount
    discountAmount = Math.round(discountAmount);

    return successResponse({
      couponId: coupon.id,
      code: coupon.code,
      name: coupon.name,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discountAmount,
      eligibleSubtotal,
      message: discountAmount > 0
        ? `Đã áp dụng giảm ${discountAmount.toLocaleString('vi-VN')} VND`
        : coupon.discountType === 'FREE_SHIPPING'
          ? 'Đã áp dụng miễn phí vận chuyển'
          : 'Mã giảm giá đã được áp dụng',
    });
  } catch (error) {
    return handleError(error);
  }
}

