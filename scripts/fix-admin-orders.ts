/**
 * Fix Admin Orders
 * Link orders with hntngoctu emails to admin user
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔧 FIXING ADMIN ORDERS\n');

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, email: true },
  });

  if (!admin) {
    console.log('❌ No admin user found');
    return;
  }

  console.log(`👤 Admin user: ${admin.email} (${admin.id})\n`);

  // Find orders with hntngoctu emails (likely admin's personal email)
  const ordersToLink = await prisma.order.findMany({
    where: {
      OR: [
        { customerEmail: { contains: 'hntngoctu' } },
        { customerEmail: admin.email },
      ],
      userId: null, // Only guest orders
    },
    select: { id: true, orderNumber: true, customerEmail: true },
  });

  console.log(`📦 Found ${ordersToLink.length} orders to link:\n`);

  for (const order of ordersToLink) {
    await prisma.order.update({
      where: { id: order.id },
      data: { userId: admin.id },
    });
    console.log(`✅ Linked: ${order.orderNumber} (${order.customerEmail}) → admin`);
  }

  // Also create customer profile for admin if doesn't exist
  const adminProfile = await prisma.customerProfile.findUnique({
    where: { userId: admin.id },
  });

  if (!adminProfile) {
    await prisma.customerProfile.create({
      data: {
        userId: admin.id,
        customerType: 'PERSONAL',
        loyaltyPoints: 100, // Give some initial points
      },
    });
    console.log('\n✅ Created customer profile for admin with 100 loyalty points');
  }

  // Summary
  const adminOrders = await prisma.order.count({ where: { userId: admin.id } });
  console.log(`\n📊 Admin now has ${adminOrders} orders linked`);

  await prisma.$disconnect();
}

main().catch(console.error);

