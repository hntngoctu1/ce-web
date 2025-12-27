import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/shared/database';
import { handleError, successResponse, createdResponse } from '@/shared/api';
import { AppError } from '@/shared/errors';

// GET - List reviews with filters and pagination
const listSchema = z.object({
  productId: z.string(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  sortBy: z.enum(['newest', 'helpful', 'rating_high', 'rating_low']).default('newest'),
  rating: z.coerce.number().min(1).max(5).optional(),
  verified: z.coerce.boolean().optional(),
  withMedia: z.coerce.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = listSchema.parse(Object.fromEntries(searchParams));

    const session = await getServerSession(authOptions);

    // Build where clause
    const where: any = {
      productId: params.productId,
      status: 'APPROVED', // Only show approved reviews
    };

    if (params.rating) {
      where.overallRating = params.rating;
    }

    if (params.verified) {
      where.isVerifiedPurchase = true;
    }

    if (params.withMedia) {
      where.media = { some: {} };
    }

    // Build order by
    let orderBy: any = { createdAt: 'desc' };
    switch (params.sortBy) {
      case 'helpful':
        orderBy = { helpfulCount: 'desc' };
        break;
      case 'rating_high':
        orderBy = { overallRating: 'desc' };
        break;
      case 'rating_low':
        orderBy = { overallRating: 'asc' };
        break;
    }

    // Fetch reviews
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          user: {
            select: { name: true, image: true },
          },
          media: {
            orderBy: { order: 'asc' },
          },
          votes: session?.user?.id
            ? {
                where: { userId: session.user.id },
                select: { isHelpful: true },
              }
            : false,
        },
      }),
      prisma.review.count({ where }),
    ]);

    // Transform reviews
    const transformedReviews = reviews.map((r) => ({
      id: r.id,
      overallRating: r.overallRating,
      qualityRating: r.qualityRating,
      valueRating: r.valueRating,
      title: r.title,
      content: r.content,
      pros: r.pros,
      cons: r.cons,
      isVerifiedPurchase: r.isVerifiedPurchase,
      isAnonymous: r.isAnonymous,
      helpfulCount: r.helpfulCount,
      notHelpfulCount: r.notHelpfulCount,
      sellerResponse: r.sellerResponse,
      sellerRespondedAt: r.sellerRespondedAt?.toISOString(),
      createdAt: r.createdAt.toISOString(),
      user: r.user,
      media: r.media.map((m) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        thumbnail: m.thumbnail,
      })),
      userVote: Array.isArray(r.votes) && r.votes[0]
        ? r.votes[0].isHelpful
          ? 'helpful'
          : 'not_helpful'
        : null,
    }));

    return successResponse({
      reviews: transformedReviews,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
      hasMore: params.page * params.limit < total,
    });
  } catch (error) {
    return handleError(error);
  }
}

// POST - Create a new review
const createSchema = z.object({
  productId: z.string(),
  orderId: z.string().optional(),
  overallRating: z.number().min(1).max(5),
  qualityRating: z.number().min(0).max(5).optional(),
  valueRating: z.number().min(0).max(5).optional(),
  title: z.string().max(200).optional(),
  content: z.string().min(20).max(5000),
  pros: z.string().max(500).optional(),
  cons: z.string().max(500).optional(),
  isAnonymous: z.boolean().default(false),
  media: z
    .array(
      z.object({
        type: z.enum(['IMAGE', 'VIDEO']),
        url: z.string().url(),
        thumbnail: z.string().url().optional(),
        caption: z.string().max(200).optional(),
        order: z.number().default(0),
      })
    )
    .max(10)
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw AppError.authRequired();
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { id: true, nameEn: true },
    });

    if (!product) {
      throw AppError.notFound('Sản phẩm không tồn tại');
    }

    // Check for verified purchase
    let isVerifiedPurchase = false;
    if (data.orderId) {
      const orderItem = await prisma.orderItem.findFirst({
        where: {
          productId: data.productId,
          order: {
            id: data.orderId,
            userId: session.user.id,
            orderStatus: 'DELIVERED',
          },
        },
      });
      isVerifiedPurchase = !!orderItem;
    } else {
      // Check if user has any delivered order with this product
      const hasOrder = await prisma.orderItem.findFirst({
        where: {
          productId: data.productId,
          order: {
            userId: session.user.id,
            orderStatus: 'DELIVERED',
          },
        },
      });
      isVerifiedPurchase = !!hasOrder;
    }

    // Check for duplicate review
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: data.productId,
        userId: session.user.id,
        orderId: data.orderId || null,
      },
    });

    if (existingReview) {
      throw AppError.validation('Bạn đã đánh giá sản phẩm này rồi');
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: session.user.id,
        orderId: data.orderId || null,
        overallRating: data.overallRating,
        qualityRating: data.qualityRating || null,
        valueRating: data.valueRating || null,
        title: data.title || null,
        content: data.content,
        pros: data.pros || null,
        cons: data.cons || null,
        isVerifiedPurchase,
        isAnonymous: data.isAnonymous,
        status: 'PENDING', // Require moderation
        media: data.media
          ? {
              create: data.media.map((m, i) => ({
                type: m.type,
                url: m.url,
                thumbnail: m.thumbnail || null,
                caption: m.caption || null,
                order: m.order ?? i,
              })),
            }
          : undefined,
      },
      include: {
        media: true,
      },
    });

    // Update product review stats (async, don't block response)
    updateProductReviewStats(data.productId).catch(console.error);

    return createdResponse({
      id: review.id,
      message: 'Đánh giá đã được gửi và đang chờ duyệt',
    });
  } catch (error) {
    return handleError(error);
  }
}

// Helper: Update product review stats
async function updateProductReviewStats(productId: string) {
  const stats = await prisma.review.aggregate({
    where: { productId, status: 'APPROVED' },
    _count: true,
    _avg: { overallRating: true },
  });

  const distribution = await prisma.review.groupBy({
    by: ['overallRating'],
    where: { productId, status: 'APPROVED' },
    _count: true,
  });

  const verifiedCount = await prisma.review.count({
    where: { productId, status: 'APPROVED', isVerifiedPurchase: true },
  });

  const withMediaCount = await prisma.review.count({
    where: { productId, status: 'APPROVED', media: { some: {} } },
  });

  // Upsert stats
  await prisma.productReviewStats.upsert({
    where: { productId },
    update: {
      totalReviews: stats._count,
      averageRating: stats._avg.overallRating || 0,
      rating5Count: distribution.find((d) => d.overallRating === 5)?._count || 0,
      rating4Count: distribution.find((d) => d.overallRating === 4)?._count || 0,
      rating3Count: distribution.find((d) => d.overallRating === 3)?._count || 0,
      rating2Count: distribution.find((d) => d.overallRating === 2)?._count || 0,
      rating1Count: distribution.find((d) => d.overallRating === 1)?._count || 0,
      verifiedCount,
      withMediaCount,
    },
    create: {
      productId,
      totalReviews: stats._count,
      averageRating: stats._avg.overallRating || 0,
      rating5Count: distribution.find((d) => d.overallRating === 5)?._count || 0,
      rating4Count: distribution.find((d) => d.overallRating === 4)?._count || 0,
      rating3Count: distribution.find((d) => d.overallRating === 3)?._count || 0,
      rating2Count: distribution.find((d) => d.overallRating === 2)?._count || 0,
      rating1Count: distribution.find((d) => d.overallRating === 1)?._count || 0,
      verifiedCount,
      withMediaCount,
    },
  });
}

