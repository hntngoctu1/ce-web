/**
 * Backfill script to populate financial fields for existing orders.
 * This ensures all orders have orderDate, totalAmount, paidAmount, outstandingAmount, accountingStatus, customerKind.
 *
 * Usage:
 *   npx tsx scripts/backfill-order-financials.ts
 */

import { PrismaClient } from '@prisma/client';
import { recalculateOrderFinancials } from '../src/lib/orders/finance';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting backfill of order financial fields...');

  // Find all orders that need backfilling
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { totalAmount: 0 },
        { orderDate: { equals: null } },
        { accountingStatus: { equals: null } },
      ],
    } as any,
    select: {
      id: true,
      total: true,
      totalAmount: true,
      orderDate: true,
      createdAt: true,
      buyerType: true,
      orderStatus: true,
      paymentState: true,
      accountingStatus: true,
    },
  });

  console.log(`📊 Found ${orders.length} orders to backfill`);

  let updated = 0;
  let skipped = 0;

  for (const order of orders) {
    try {
      await prisma.$transaction(async (tx) => {
        // Set orderDate from createdAt if missing
        const orderDate = order.orderDate || order.createdAt;

        // Set totalAmount from total if missing
        const totalAmount =
          order.totalAmount && order.totalAmount > 0 ? order.totalAmount : order.total;

        // Set customerKind from buyerType
        const customerKind = order.buyerType === 'BUSINESS' ? 'BUSINESS' : 'INDIVIDUAL';

        // Update basic fields first
        await tx.order.update({
          where: { id: order.id },
          data: {
            orderDate,
            totalAmount,
            customerKind,
          },
        } as any);

        // Recalculate financials (this will also update accountingStatus based on payments)
        await recalculateOrderFinancials(tx, order.id);
      });

      updated++;
      if (updated % 10 === 0) {
        console.log(`  ✅ Updated ${updated}/${orders.length} orders...`);
      }
    } catch (error) {
      console.error(`  ❌ Error updating order ${order.id}:`, error);
      skipped++;
    }
  }

  console.log(`\n✅ Backfill complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error('❌ Backfill failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
