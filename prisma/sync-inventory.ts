import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STOCK_QTY = 100; // Set all products to 100 items

async function main() {
  console.log('🔄 Syncing inventory...');

  // 1. Get or create default warehouse
  let warehouse = await prisma.warehouse.findFirst({ where: { isDefault: true } });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        code: 'MAIN',
        name: 'Main Warehouse',
        address: 'Ho Chi Minh City, Vietnam',
        isDefault: true,
      },
    });
    console.log('✅ Created default warehouse:', warehouse.code);
  }

  // 2. Get all active products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, sku: true, nameEn: true },
  });

  console.log(`📦 Found ${products.length} active products`);

  // 3. Update each product's stockQuantity AND create/update InventoryItem
  let updated = 0;

  for (const product of products) {
    // Update Product.stockQuantity
    await prisma.product.update({
      where: { id: product.id },
      data: { stockQuantity: STOCK_QTY },
    });

    // Upsert InventoryItem
    const existingInv = await prisma.inventoryItem.findFirst({
      where: {
        productId: product.id,
        warehouseId: warehouse.id,
        locationId: null,
      },
    });

    if (existingInv) {
      await prisma.inventoryItem.update({
        where: { id: existingInv.id },
        data: {
          onHandQty: STOCK_QTY,
          reservedQty: 0,
          availableQty: STOCK_QTY,
          reorderPointQty: 20, // 20% of 100
          reorderQty: 50,
        },
      });
    } else {
      await prisma.inventoryItem.create({
        data: {
          productId: product.id,
          warehouseId: warehouse.id,
          onHandQty: STOCK_QTY,
          reservedQty: 0,
          availableQty: STOCK_QTY,
          reorderPointQty: 20,
          reorderQty: 50,
        },
      });
    }

    updated++;
  }

  console.log(`✅ Updated ${updated} products with stockQuantity = ${STOCK_QTY}`);
  console.log(`✅ Updated ${updated} inventory items with onHandQty = ${STOCK_QTY}`);

  // 4. Verify
  const totalStock = await prisma.product.aggregate({
    _sum: { stockQuantity: true },
  });

  const totalInventory = await prisma.inventoryItem.aggregate({
    _sum: { onHandQty: true, availableQty: true },
  });

  console.log('\n📊 Summary:');
  console.log(`   Products.stockQuantity total: ${totalStock._sum.stockQuantity}`);
  console.log(`   InventoryItem.onHandQty total: ${totalInventory._sum.onHandQty}`);
  console.log(`   InventoryItem.availableQty total: ${totalInventory._sum.availableQty}`);

  console.log('\n🎉 Sync completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
