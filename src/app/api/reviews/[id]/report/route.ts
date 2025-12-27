import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/shared/database';
import { handleError, successResponse } from '@/shared/api';
import { AppError } from '@/shared/errors';

const reportSchema = z.object({
  reason: z.enum(['spam', 'inappropriate', 'fake', 'other']),
  details: z.string().max(1000).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw AppError.authRequired();
    }

    const body = await request.json();
    const { reason, details } = reportSchema.parse(body);
    const reviewId = params.id;

    // Check review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true },
    });

    if (!review) {
      throw AppError.notFound('Đánh giá không tồn tại');
    }

    // Cannot report own review
    if (review.userId === session.user.id) {
      throw AppError.validation('Không thể báo cáo đánh giá của chính mình');
    }

    // Check for existing report
    const existingReport = await prisma.reviewReport.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId: session.user.id,
        },
      },
    });

    if (existingReport) {
      throw AppError.validation('Bạn đã báo cáo đánh giá này rồi');
    }

    // Create report
    await prisma.reviewReport.create({
      data: {
        reviewId,
        userId: session.user.id,
        reason,
        details,
      },
    });

    // Update report count
    const reportCount = await prisma.reviewReport.count({
      where: { reviewId },
    });

    await prisma.review.update({
      where: { id: reviewId },
      data: { reportCount },
    });

    // Auto-flag if too many reports
    if (reportCount >= 3) {
      await prisma.review.update({
        where: { id: reviewId },
        data: { status: 'FLAGGED' },
      });
    }

    return successResponse({
      message: 'Báo cáo đã được gửi',
    });
  } catch (error) {
    return handleError(error);
  }
}

