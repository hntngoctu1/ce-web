import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n📦 ORDERS CHECK\n');
  
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, email: true, name: true } },
      items: { include: { product: { select: { nameEn: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  console.log(`Total orders: ${orders.length}\n`);
  
  for (const order of orders) {
    console.log('═'.repeat(60));
    console.log(`Order: ${order.orderNumber || order.orderCode}`);
    console.log(`ID: ${order.id}`);
    console.log(`User ID: ${order.userId || 'GUEST'}`);
    console.log(`User Email: ${order.user?.email || order.customerEmail || 'N/A'}`);
    console.log(`Status: ${order.orderStatus} | Payment: ${order.paymentState}`);
    console.log(`Total: ${Number(order.total).toLocaleString()} VND`);
    console.log(`Created: ${order.createdAt}`);
    console.log(`Items: ${order.items?.length || 0}`);
    if (order.items?.length) {
      order.items.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.product?.nameEn || item.productName} x${item.quantity} = ${Number(item.totalPrice).toLocaleString()} VND`);
      });
    }
  }
  
  // Check users
  console.log('\n\n👤 USERS CHECK\n');
  const users = await prisma.user.findMany({
    include: {
      customerProfile: true,
      orders: { select: { id: true } },
    },
  });
  
  for (const user of users) {
    console.log('─'.repeat(40));
    console.log(`User: ${user.name || 'N/A'} (${user.email})`);
    console.log(`ID: ${user.id}`);
    console.log(`Role: ${user.role}`);
    console.log(`Orders: ${user.orders?.length || 0}`);
    console.log(`Profile: ${user.customerProfile ? 'Yes' : 'No'}`);
    if (user.customerProfile) {
      console.log(`  Loyalty Points: ${user.customerProfile.loyaltyPoints}`);
      console.log(`  Customer Type: ${user.customerProfile.customerType}`);
    }
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);

