import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getAiProvider, getJobTypeLabel } from '@/lib/ai';
import type { AiJobType } from '@/lib/ai';

// GET /api/ai/jobs - List AI jobs
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const postId = searchParams.get('postId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 20;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (postId) where.postId = postId;

    const [jobs, total] = await Promise.all([
      prisma.aiContentJob.findMany({
        where,
        include: {
          post: { select: { id: true, titleEn: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.aiContentJob.count({ where }),
    ]);

    return NextResponse.json({
      jobs,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching AI jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// POST /api/ai/jobs - Create and execute AI job
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, input, postId, locale } = body as {
      type: AiJobType;
      input: Record<string, unknown>;
      postId?: string;
      locale?: string;
    };

    if (!type || !input) {
      return NextResponse.json({ error: 'Type and input are required' }, { status: 400 });
    }

    // Create job record
    const job = await prisma.aiContentJob.create({
      data: {
        type,
        status: 'RUNNING',
        input: JSON.stringify(input),
        postId: postId || null,
        locale: locale || null,
        createdBy: session.user.id,
      },
    });

    // Execute AI operation
    try {
      const provider = getAiProvider();
      let output: unknown;

      switch (type) {
        case 'GENERATE_DRAFT':
          output = await provider.generateDraft(
            input as Parameters<typeof provider.generateDraft>[0]
          );
          break;
        case 'TRANSLATE':
          output = await provider.translate(input as Parameters<typeof provider.translate>[0]);
          break;
        case 'SUMMARIZE':
          output = await provider.summarize(input as Parameters<typeof provider.summarize>[0]);
          break;
        case 'SEO_OPTIMIZE':
          output = await provider.seoOptimize(input as Parameters<typeof provider.seoOptimize>[0]);
          break;
        case 'REWRITE':
          output = await provider.rewrite(input as Parameters<typeof provider.rewrite>[0]);
          break;
        default:
          throw new Error(`Unknown job type: ${type}`);
      }

      // Update job as completed
      const updatedJob = await prisma.aiContentJob.update({
        where: { id: job.id },
        data: {
          status: 'DONE',
          output: JSON.stringify(output),
        },
      });

      return NextResponse.json({
        job: updatedJob,
        output,
        message: `${getJobTypeLabel(type)} completed successfully`,
      });
    } catch (aiError) {
      // Update job as failed
      await prisma.aiContentJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          error: aiError instanceof Error ? aiError.message : 'Unknown error',
        },
      });

      console.error('AI job failed:', aiError);
      return NextResponse.json(
        {
          error: 'AI operation failed',
          details: aiError instanceof Error ? aiError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating AI job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
