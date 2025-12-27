/**
 * Link Guest Orders to Users by Email
 * Finds orders without userId and links them to matching user accounts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔗 LINKING GUEST ORDERS TO USER ACCOUNTS\n');

  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
  });

  console.log('👤 Found users:');
  users.forEach(u => console.log(`   - ${u.email}`));

  // Get guest orders
  const guestOrders = await prisma.order.findMany({
    where: { userId: null },
    select: { id: true, orderNumber: true, customerEmail: true },
  });

  console.log(`\n📦 Found ${guestOrders.length} guest orders\n`);

  let linked = 0;
  let notMatched = 0;

  for (const order of guestOrders) {
    // Find user with matching email
    const matchingUser = users.find(
      u => u.email.toLowerCase() === order.customerEmail?.toLowerCase()
    );

    if (matchingUser) {
      await prisma.order.update({
        where: { id: order.id },
        data: { userId: matchingUser.id },
      });
      console.log(`✅ Linked: ${order.orderNumber} → ${matchingUser.email}`);
      linked++;
    } else {
      console.log(`⏭️  No match: ${order.orderNumber} (${order.customerEmail})`);
      notMatched++;
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 LINK SUMMARY');
  console.log('═'.repeat(50));
  console.log(`   ✅ Linked: ${linked}`);
  console.log(`   ⏭️  Not matched: ${notMatched}`);

  // Verify
  const stillGuest = await prisma.order.count({ where: { userId: null } });
  const nowLinked = await prisma.order.count({ where: { userId: { not: null } } });
  console.log(`\n📈 After linking:`);
  console.log(`   Linked orders: ${nowLinked}`);
  console.log(`   Guest orders: ${stillGuest}`);
  console.log('═'.repeat(50) + '\n');

  await prisma.$disconnect();
}

main().catch(console.error);

