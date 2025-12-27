import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🧪 TEST: Order Status Update\n');

  // Get the admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, email: true },
  });
  console.log('Admin user:', admin?.email, '| ID:', admin?.id);

  // Get a pending order
  const order = await prisma.order.findFirst({
    where: { orderStatus: 'PENDING_CONFIRMATION' },
    select: { id: true, orderNumber: true, orderStatus: true },
  });
  
  if (!order) {
    console.log('No pending orders found');
    return;
  }
  console.log('Order:', order.orderNumber, '| Status:', order.orderStatus);

  // Try to create a status history entry
  console.log('\n1. Testing status history creation...');
  try {
    const history = await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: 'PENDING_CONFIRMATION',
        toStatus: 'CONFIRMED',
        actorAdminId: admin?.id || null,
        noteInternal: 'Test from script',
      },
    });
    console.log('✅ Status history created:', history.id);
  } catch (e: any) {
    console.error('❌ Status history error:', e.message);
    if (e.code) console.error('   Prisma code:', e.code);
  }

  // Test stock document creation
  console.log('\n2. Testing stock document creation...');
  const warehouse = await prisma.warehouse.findFirst({ where: { isDefault: true } });
  console.log('Warehouse:', warehouse?.code, '| ID:', warehouse?.id);

  if (warehouse) {
    try {
      const doc = await prisma.stockDocument.create({
        data: {
          code: `TEST-${Date.now()}`,
          type: 'RESERVE',
          status: 'POSTED',
          warehouseId: warehouse.id,
          referenceType: 'ORDER',
          referenceId: order.id,
          note: 'Test document',
          createdBy: admin?.id,
          postedBy: admin?.id,
          postedAt: new Date(),
        },
      });
      console.log('✅ Stock document created:', doc.code);

      // Clean up test document
      await prisma.stockDocument.delete({ where: { id: doc.id } });
      console.log('   (cleaned up)');
    } catch (e: any) {
      console.error('❌ Stock document error:', e.message);
      if (e.code) console.error('   Prisma code:', e.code);
    }
  }

  // Clean up test history
  console.log('\n3. Cleaning up...');
  await prisma.orderStatusHistory.deleteMany({
    where: { noteInternal: 'Test from script' },
  });
  console.log('✅ Cleaned up test data');

  await prisma.$disconnect();
}

main().catch(console.error);

