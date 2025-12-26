import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n📝 BLOG CHECK\n');
  
  const posts = await prisma.blogPost.findMany({
    take: 5,
    select: { 
      id: true, 
      slug: true, 
      status: true,
      titleEn: true,
    },
  });
  
  console.log(`Total posts: ${posts.length}`);
  posts.forEach(p => {
    console.log(`  - ${p.slug} (${p.status}): ${p.titleEn?.substring(0, 50)}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);

