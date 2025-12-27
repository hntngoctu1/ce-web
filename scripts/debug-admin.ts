import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 DEBUG ADMIN DATA\n');

  // Get admin user
  const admin = await prisma.user.findFirst({ 
    where: { email: 'admin@ce.com.vn' },
    select: { id: true, email: true, name: true }
  });
  
  console.log('👤 Admin User:');
  console.log('   ID:', admin?.id);
  console.log('   Email:', admin?.email);
  console.log('   Name:', admin?.name);

  if (!admin) {
    console.log('❌ Admin not found!');
    return;
  }

  // Get orders for admin
  console.log('\n📦 Admin Orders:');
  const orders = await prisma.order.findMany({ 
    where: { userId: admin.id },
    select: { 
      id: true,
      orderNumber: true, 
      orderStatus: true,
      customerEmail: true,
      total: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('   Count:', orders.length);
  if (orders.length > 0) {
    orders.forEach(o => {
      console.log(`   - ${o.orderNumber} | ${o.orderStatus} | ${o.customerEmail}`);
    });
  } else {
    console.log('   ⚠️ NO ORDERS FOUND FOR ADMIN!');
    
    // Check if orders exist with admin's potential emails
    const possibleOrders = await prisma.order.findMany({
      where: {
        OR: [
          { customerEmail: { contains: 'hntngoctu' } },
          { customerEmail: 'admin@ce.com.vn' },
        ]
      },
      select: { orderNumber: true, userId: true, customerEmail: true }
    });
    
    console.log('\n   Possible admin orders (by email):');
    possibleOrders.forEach(o => {
      console.log(`   - ${o.orderNumber} | userId: ${o.userId || 'NULL'} | ${o.customerEmail}`);
    });
  }

  // Get profile
  console.log('\n⭐ Customer Profile:');
  const profile = await prisma.customerProfile.findUnique({ 
    where: { userId: admin.id } 
  });
  
  if (profile) {
    console.log('   Loyalty Points:', profile.loyaltyPoints);
    console.log('   Customer Type:', profile.customerType);
  } else {
    console.log('   ⚠️ NO PROFILE FOUND!');
  }

  await prisma.$disconnect();
}

main().catch(console.error);

