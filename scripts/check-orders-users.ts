import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n👤 ALL USERS:\n');
  const users = await prisma.user.findMany({ 
    select: { id: true, email: true, role: true } 
  });
  users.forEach(u => console.log(`  - ${u.email} | ${u.role} | ID: ${u.id}`));

  console.log('\n📦 ALL ORDERS (last 15):\n');
  const orders = await prisma.order.findMany({
    select: { 
      id: true, 
      orderNumber: true, 
      userId: true, 
      customerEmail: true,
      orderStatus: true 
    },
    orderBy: { createdAt: 'desc' },
    take: 15
  });
  
  orders.forEach(o => {
    console.log(`  Order: ${o.orderNumber}`);
    console.log(`    userId: ${o.userId || 'NULL - Guest Order'}`);
    console.log(`    email: ${o.customerEmail}`);
    console.log(`    status: ${o.orderStatus}`);
    console.log('');
  });

  // Check admin orders specifically
  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@ce.com.vn' } });
  if (adminUser) {
    const adminOrders = await prisma.order.count({ where: { userId: adminUser.id } });
    console.log(`\n🔍 Orders linked to admin@ce.com.vn (${adminUser.id}): ${adminOrders}`);
  }

  // Check customer orders
  const customerUser = await prisma.user.findFirst({ where: { email: 'customer@example.com' } });
  if (customerUser) {
    const customerOrders = await prisma.order.count({ where: { userId: customerUser.id } });
    console.log(`🔍 Orders linked to customer@example.com (${customerUser.id}): ${customerOrders}`);
  }

  // Count by userId
  const guestOrders = await prisma.order.count({ where: { userId: null } });
  const linkedOrders = await prisma.order.count({ where: { userId: { not: null } } });
  console.log(`🔍 Guest orders (no userId): ${guestOrders}`);
  console.log(`🔍 Linked orders (has userId): ${linkedOrders}`);

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 DIAGNOSIS:');
  if (guestOrders > 0) {
    console.log('⚠️  There are guest orders not linked to any user');
    console.log('   These need to be linked by matching email');
  }
  console.log('═'.repeat(50) + '\n');

  await prisma.$disconnect();
}

main().catch(console.error);

