import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n👤 USERS:\n');
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });
  
  users.forEach(u => {
    console.log(`  - ${u.email} (${u.role})`);
    console.log(`    ID: ${u.id}`);
  });

  console.log('\n📝 SESSIONS:\n');
  const sessions = await prisma.session.findMany({
    select: { userId: true, expires: true },
  });
  console.log('Active sessions:', sessions.length);
  sessions.forEach(s => {
    console.log(`  - User: ${s.userId} | Expires: ${s.expires}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);

