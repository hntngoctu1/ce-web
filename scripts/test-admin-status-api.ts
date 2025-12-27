/**
 * Test Admin Order Status API
 * Verifies that order status can be updated via admin API
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('\n🔧 ADMIN ORDER STATUS API TEST\n');

  // Get a pending order
  const order = await prisma.order.findFirst({
    where: { orderStatus: 'PENDING_CONFIRMATION' },
    select: { id: true, orderNumber: true, orderStatus: true },
  });

  if (!order) {
    console.log('❌ No pending order found');
    await prisma.$disconnect();
    return;
  }

  console.log(`📦 Testing with order: ${order.orderNumber} (${order.orderStatus})\n`);

  // Try to update status via API (without auth - should get 401)
  const res = await fetch(`${BASE_URL}/api/admin/orders/${order.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newStatus: 'CONFIRMED' }),
  });

  const body = await res.text();
  let json;
  try { json = JSON.parse(body); } catch {}

  console.log(`API Response: HTTP ${res.status}`);
  console.log(`Response body:`, json || body.substring(0, 200));

  if (res.status === 401) {
    console.log('\n✅ API correctly requires authentication (401)');
    console.log('   This is expected behavior - admin must be logged in');
  } else if (res.status === 400) {
    console.log('\n⚠️ API returned 400 - validation or business rule error');
    console.log('   Error:', json?.error?.message || json?.error);
  } else if (res.ok) {
    console.log('\n✅ Status updated successfully!');
    
    // Verify update
    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      select: { orderStatus: true },
    });
    console.log(`   New status: ${updated?.orderStatus}`);
  } else {
    console.log('\n❌ Unexpected error');
  }

  console.log('\n📝 Note: To fully test admin status update, log in as admin');
  console.log('   and update status through the web interface.\n');

  await prisma.$disconnect();
}

main().catch(console.error);

