import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n📦 WAREHOUSES:\n');
  const warehouses = await prisma.warehouse.findMany();
  console.log('Total:', warehouses.length);
  warehouses.forEach(w => {
    console.log(`  - ${w.code} (${w.name}) | ID: ${w.id} | Default: ${w.isDefault}`);
  });

  console.log('\n📋 ORDER CHECK:\n');
  const order = await prisma.order.findFirst({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  if (order) {
    console.log('Order:', order.orderNumber);
    console.log('Status:', order.orderStatus);
    console.log('Items:', order.items?.length || 0);
    
    for (const item of order.items || []) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId || '' },
        select: { id: true, nameEn: true },
      });
      console.log(`  - ${item.productName}`);
      console.log(`    ProductId: ${item.productId}`);
      console.log(`    Product exists: ${product ? 'YES' : 'NO ❌'}`);
    }
  }

  console.log('\n🔍 INVENTORY ITEMS:\n');
  const invItems = await prisma.inventoryItem.findMany({ take: 5 });
  console.log('Total inventory items:', invItems.length);

  await prisma.$disconnect();
}

main().catch(console.error);

