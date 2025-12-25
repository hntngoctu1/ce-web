import { BlogPostEditor } from '@/components/blog/blog-post-editor';
import { prisma } from '@/lib/db';

async function getCategories() {
  return prisma.blogCategory.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
}

export default async function NewBlogPostPage() {
  const categories = await getCategories();

  return <BlogPostEditor post={null} categories={categories} isNew={true} />;
}
