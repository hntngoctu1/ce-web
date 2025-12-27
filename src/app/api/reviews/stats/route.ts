import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/shared/database';
import { handleError, successResponse } from '@/shared/api';
import { AppError } from '@/shared/errors';

const statsSchema = z.object({
  productId: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { productId } = statsSchema.parse(Object.fromEntries(searchParams));

    // Try to get cached stats first
    let stats = await prisma.productReviewStats.findUnique({
      where: { productId },
    });

    // If no cached stats, compute them
    if (!stats) {
      const aggregation = await prisma.review.aggregate({
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

      // Create stats entry
      stats = await prisma.productReviewStats.create({
        data: {
          productId,
          totalReviews: aggregation._count,
          averageRating: aggregation._avg.overallRating || 0,
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

    // Calculate distribution percentages
    const total = stats.totalReviews || 1;
    const distribution = [
      { rating: 5, count: stats.rating5Count, percentage: Math.round((stats.rating5Count / total) * 100) },
      { rating: 4, count: stats.rating4Count, percentage: Math.round((stats.rating4Count / total) * 100) },
      { rating: 3, count: stats.rating3Count, percentage: Math.round((stats.rating3Count / total) * 100) },
      { rating: 2, count: stats.rating2Count, percentage: Math.round((stats.rating2Count / total) * 100) },
      { rating: 1, count: stats.rating1Count, percentage: Math.round((stats.rating1Count / total) * 100) },
    ];

    return successResponse({
      totalReviews: stats.totalReviews,
      averageRating: Number(stats.averageRating),
      distribution,
      verifiedCount: stats.verifiedCount,
      withMediaCount: stats.withMediaCount,
    });
  } catch (error) {
    return handleError(error);
  }
}

