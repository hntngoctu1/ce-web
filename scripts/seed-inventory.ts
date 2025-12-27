/**
 * Seed Inventory Data
 * Creates inventory items for all products in the default warehouse
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n📦 SEEDING INVENTORY DATA\n');

  // 1. Ensure default warehouse exists
  let warehouse = await prisma.warehouse.findFirst({
    where: { isDefault: true },
  });

  if (!warehouse) {
    warehouse = await prisma.warehouse.findFirst();
    if (warehouse) {
      await prisma.warehouse.update({
        where: { id: warehouse.id },
        data: { isDefault: true },
      });
      console.log(`✅ Set warehouse "${warehouse.code}" as default`);
    } else {
      warehouse = await prisma.warehouse.create({
        data: {
          code: 'MAIN',
          name: 'Main Warehouse',
          address: 'Ho Chi Minh City, Vietnam',
          isDefault: true,
        },
      });
      console.log(`✅ Created default warehouse: ${warehouse.code}`);
    }
  } else {
    console.log(`✅ Using warehouse: ${warehouse.code}`);
  }

  // 2. Get all products
  const products = await prisma.product.findMany({
    select: { id: true, nameEn: true, sku: true, stockQuantity: true },
  });

  console.log(`\n📋 Found ${products.length} products\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    // Check if inventory item exists
    const existing = await prisma.inventoryItem.findFirst({
      where: {
        productId: product.id,
        warehouseId: warehouse.id,
      },
    });

    // Default stock quantity (random between 50-200 for variety)
    const defaultQty = Math.floor(Math.random() * 150) + 50;

    if (existing) {
      // Update if quantity is 0
      if (Number(existing.onHandQty) === 0) {
        await prisma.inventoryItem.update({
          where: { id: existing.id },
          data: {
            onHandQty: defaultQty,
            availableQty: defaultQty,
            reservedQty: 0,
          },
        });
        updated++;
        console.log(`📝 Updated: ${product.sku || product.nameEn} → ${defaultQty} units`);
      } else {
        skipped++;
      }
    } else {
      // Create new inventory item
      await prisma.inventoryItem.create({
        data: {
          productId: product.id,
          warehouseId: warehouse.id,
          onHandQty: defaultQty,
          availableQty: defaultQty,
          reservedQty: 0,
          reorderPointQty: 10,
          reorderQty: 50,
        },
      });
      created++;
      console.log(`✅ Created: ${product.sku || product.nameEn} → ${defaultQty} units`);
    }

    // Also update product's stockQuantity field
    await prisma.product.update({
      where: { id: product.id },
      data: { stockQuantity: defaultQty },
    });
  }

  // 3. Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 INVENTORY SEED SUMMARY');
  console.log('═'.repeat(50));
  console.log(`   ✅ Created: ${created}`);
  console.log(`   📝 Updated: ${updated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📦 Total products: ${products.length}`);

  // 4. Verify
  const inventoryCount = await prisma.inventoryItem.count();
  const outOfStock = await prisma.inventoryItem.count({
    where: { availableQty: { lte: 0 } },
  });

  console.log('\n📈 CURRENT INVENTORY STATUS:');
  console.log(`   Total inventory items: ${inventoryCount}`);
  console.log(`   Out of stock: ${outOfStock}`);
  console.log(`   In stock: ${inventoryCount - outOfStock}`);
  console.log('═'.repeat(50) + '\n');

  await prisma.$disconnect();
}

main().catch(console.error);

