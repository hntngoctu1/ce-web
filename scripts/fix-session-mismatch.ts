/**
 * Fix Session User ID Mismatch
 * Links orders created with old session user IDs to the correct users
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔧 FIXING SESSION USER ID MISMATCH\n');

  // Get all current users
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true },
  });

  console.log('👤 Current users in database:');
  users.forEach(u => console.log(`   - ${u.email} | ${u.role} | ${u.id}`));

  // Find orders with userIds that don't match any current user
  const allOrders = await prisma.order.findMany({
    where: { userId: { not: null } },
    select: { id: true, orderNumber: true, userId: true, customerEmail: true },
  });

  console.log(`\n📦 Orders with userId set: ${allOrders.length}`);

  const validUserIds = new Set(users.map(u => u.id));
  const invalidOrders = allOrders.filter(o => !validUserIds.has(o.userId!));

  console.log(`⚠️ Orders with invalid/old userId: ${invalidOrders.length}`);

  if (invalidOrders.length > 0) {
    console.log('\nFixing invalid orders:');
    for (const order of invalidOrders) {
      console.log(`   ${order.orderNumber} | old userId: ${order.userId}`);
      
      // Try to find matching user by email
      const matchingUser = users.find(u => 
        u.email.toLowerCase() === order.customerEmail?.toLowerCase()
      );

      // Or link to admin if email contains hntngoctu
      const adminUser = users.find(u => u.role === 'ADMIN');
      const isAdminEmail = order.customerEmail?.includes('hntngoctu');

      if (matchingUser) {
        await prisma.order.update({
          where: { id: order.id },
          data: { userId: matchingUser.id },
        });
        console.log(`     ✅ Linked to ${matchingUser.email}`);
      } else if (isAdminEmail && adminUser) {
        await prisma.order.update({
          where: { id: order.id },
          data: { userId: adminUser.id },
        });
        console.log(`     ✅ Linked to admin (${adminUser.email})`);
      } else {
        // Set to null (guest order) if no match
        await prisma.order.update({
          where: { id: order.id },
          data: { userId: null },
        });
        console.log(`     ⚠️ Set to guest order`);
      }
    }
  }

  // Also find orders with the old session user ID (from log)
  const oldSessionUserId = 'cmjk6b4ex0000u9zwm2nvvkmv';
  const ordersWithOldSession = await prisma.order.findMany({
    where: { userId: oldSessionUserId },
    select: { id: true, orderNumber: true, customerEmail: true },
  });

  if (ordersWithOldSession.length > 0) {
    console.log(`\n📋 Orders with old session ID (${oldSessionUserId}):`);
    const adminUser = users.find(u => u.role === 'ADMIN');
    
    for (const order of ordersWithOldSession) {
      console.log(`   ${order.orderNumber} | ${order.customerEmail}`);
      
      if (adminUser && order.customerEmail?.includes('hntngoctu')) {
        await prisma.order.update({
          where: { id: order.id },
          data: { userId: adminUser.id },
        });
        console.log(`     ✅ Linked to admin`);
      }
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 FINAL STATUS');
  console.log('═'.repeat(50));

  for (const user of users) {
    const count = await prisma.order.count({ where: { userId: user.id } });
    console.log(`   ${user.email}: ${count} orders`);
  }

  const guestCount = await prisma.order.count({ where: { userId: null } });
  console.log(`   Guest orders: ${guestCount}`);
  console.log('═'.repeat(50) + '\n');

  console.log('⚠️  IMPORTANT: User must LOG OUT and LOG BACK IN to refresh session!\n');

  await prisma.$disconnect();
}

main().catch(console.error);

