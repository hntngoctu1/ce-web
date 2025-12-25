import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { BlogPostEditor } from '@/components/blog/blog-post-editor';

interface BlogEditPageProps {
  params: Promise<{ id: string }>;
}

async function getPost(id: string) {
  if (id === 'new') {
    return null;
  }

  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
      coverMedia: true,
      translations: true,
      tags: { include: { tag: true } },
      revisions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  return post;
}

async function getCategories() {
  return prisma.blogCategory.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
}

export default async function BlogEditPage({ params }: BlogEditPageProps) {
  const { id } = await params;
  const [post, categories] = await Promise.all([getPost(id), getCategories()]);

  if (id !== 'new' && !post) {
    notFound();
  }

  return <BlogPostEditor post={post} categories={categories} isNew={id === 'new'} />;
}
