import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/shared/database';
import { handleError, successResponse } from '@/shared/api';
import { AppError } from '@/shared/errors';

const voteSchema = z.object({
  isHelpful: z.boolean(),
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
    const { isHelpful } = voteSchema.parse(body);
    const reviewId = params.id;

    // Check review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true },
    });

    if (!review) {
      throw AppError.notFound('Đánh giá không tồn tại');
    }

    // Cannot vote on own review
    if (review.userId === session.user.id) {
      throw AppError.validation('Không thể bình chọn đánh giá của chính mình');
    }

    // Upsert vote
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId: session.user.id,
        },
      },
    });

    if (existingVote) {
      if (existingVote.isHelpful === isHelpful) {
        // Remove vote if same
        await prisma.reviewVote.delete({
          where: { id: existingVote.id },
        });
      } else {
        // Update vote
        await prisma.reviewVote.update({
          where: { id: existingVote.id },
          data: { isHelpful },
        });
      }
    } else {
      // Create new vote
      await prisma.reviewVote.create({
        data: {
          reviewId,
          userId: session.user.id,
          isHelpful,
        },
      });
    }

    // Update counts
    const [helpfulCount, notHelpfulCount] = await Promise.all([
      prisma.reviewVote.count({ where: { reviewId, isHelpful: true } }),
      prisma.reviewVote.count({ where: { reviewId, isHelpful: false } }),
    ]);

    await prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount, notHelpfulCount },
    });

    return successResponse({
      helpfulCount,
      notHelpfulCount,
    });
  } catch (error) {
    return handleError(error);
  }
}

