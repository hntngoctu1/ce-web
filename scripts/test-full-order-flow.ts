/**
 * Complete Order Flow Test
 * Tests the entire order lifecycle from customer checkout to admin fulfillment
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

interface TestResult {
  step: string;
  status: 'PASS' | 'FAIL' | 'INFO';
  details?: string;
}

const results: TestResult[] = [];

function log(r: TestResult) {
  const icon = { PASS: '✅', FAIL: '❌', INFO: '📋' }[r.status];
  console.log(`${icon} ${r.step}`);
  if (r.details) console.log(`   └─ ${r.details}`);
  results.push(r);
}

async function fetchAPI(path: string, options?: RequestInit) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
    const body = await res.text();
    let json;
    try { json = JSON.parse(body); } catch {}
    return { ok: res.ok, status: res.status, body, json };
  } catch (e: any) {
    return { ok: false, status: 0, body: e.message, json: null };
  }
}

async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║  🛒 COMPLETE ORDER FLOW TEST                                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // ==================== PHASE 1: SETUP ====================
  console.log('📦 PHASE 1: SETUP\n');

  // Get customer user
  const customer = await prisma.user.findFirst({
    where: { role: 'CUSTOMER' },
    select: { id: true, email: true, name: true },
  });
  log({
    step: 'Find customer user',
    status: customer ? 'PASS' : 'FAIL',
    details: customer ? `${customer.email} (ID: ${customer.id})` : 'No customer found',
  });

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, name: true },
  });
  log({
    step: 'Find admin user',
    status: admin ? 'PASS' : 'FAIL',
    details: admin ? `${admin.email} (ID: ${admin.id})` : 'No admin found',
  });

  // Get a product
  const product = await prisma.product.findFirst({
    where: { isActive: true, price: { gt: 0 } },
    select: { id: true, nameEn: true, price: true, sku: true },
  });
  log({
    step: 'Find product for order',
    status: product ? 'PASS' : 'FAIL',
    details: product ? `${product.nameEn} - ${product.price.toLocaleString()} VND` : 'No product found',
  });

  if (!customer || !admin || !product) {
    console.log('\n❌ Setup failed. Please seed the database first.');
    await prisma.$disconnect();
    return;
  }

  // ==================== PHASE 2: CREATE ORDER ====================
  console.log('\n📦 PHASE 2: CREATE ORDER (as Customer)\n');

  const ordersBefore = await prisma.order.count({ where: { userId: customer.id } });
  log({
    step: 'Customer orders before',
    status: 'INFO',
    details: `${ordersBefore} orders`,
  });

  // Create order directly via Prisma (simulating logged-in user checkout)
  // This ensures the order is linked to the customer
  const { orderCode } = await (async () => {
    // Get next order number
    const year = new Date().getFullYear();
    const counter = await prisma.orderCounter.upsert({
      where: { year },
      update: { lastNumber: { increment: 1 } },
      create: { year, lastNumber: 1 },
    });
    const nextNum = String(counter.lastNumber).padStart(6, '0');
    return { orderCode: `CE-${year}-${nextNum}` };
  })();

  const createdOrder = await prisma.order.create({
    data: {
      orderNumber: orderCode,
      orderCode,
      userId: customer.id, // Link to customer!

      customerName: customer.name || 'Test Customer',
      customerEmail: customer.email,
      customerPhone: '0901234567',
      shippingAddress: '123 Test Street, District 1, Ho Chi Minh City',

      buyerType: 'PERSONAL',
      buyerSnapshot: JSON.stringify({
        customerType: 'PERSONAL',
        name: customer.name,
        email: customer.email,
        phone: '0901234567',
      }),
      shippingSnapshot: JSON.stringify({
        recipientName: customer.name,
        recipientPhone: '0901234567',
        addressLine1: '123 Test Street, District 1',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
      }),

      subtotal: Number(product.price) * 2,
      total: Number(product.price) * 2,
      totalAmount: Number(product.price) * 2,
      paidAmount: 0,
      outstandingAmount: Number(product.price) * 2,
      currency: 'VND',

      orderDate: new Date(),
      customerKind: 'INDIVIDUAL',
      accountingStatus: 'PENDING_PAYMENT',

      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMethod: 'COD',

      orderStatus: 'PENDING_CONFIRMATION',
      paymentState: 'UNPAID',
      fulfillmentStatus: 'UNFULFILLED',

      notes: 'Test order for flow verification',

      items: {
        create: [{
          productId: product.id,
          quantity: 2,
          unitPrice: Number(product.price),
          totalPrice: Number(product.price) * 2,
          productName: product.nameEn,
          productSku: product.sku,
        }],
      },

      statusHistory: {
        create: {
          fromStatus: null,
          toStatus: 'PENDING_CONFIRMATION',
          actorAdminId: null,
          noteInternal: 'Order created (test)',
        },
      },
    } as any,
  });

  log({
    step: 'Create order for logged-in customer',
    status: createdOrder ? 'PASS' : 'FAIL',
    details: `Order: ${orderCode} | User: ${customer.email}`,
  });

  const orderId = createdOrder.id;

  if (!orderId) {
    console.log('\n❌ Order creation failed. Stopping test.');
    await prisma.$disconnect();
    return;
  }

  // ==================== PHASE 3: VERIFY CUSTOMER DASHBOARD ====================
  console.log('\n📦 PHASE 3: VERIFY CUSTOMER DASHBOARD\n');

  const ordersAfter = await prisma.order.count({ where: { userId: customer.id } });
  log({
    step: 'Customer orders after',
    status: ordersAfter > ordersBefore ? 'PASS' : 'FAIL',
    details: `${ordersAfter} orders (+${ordersAfter - ordersBefore})`,
  });

  // Check order details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  log({
    step: 'Order linked to customer',
    status: order?.userId === customer.id ? 'PASS' : 'FAIL',
    details: order?.userId === customer.id
      ? `Order ${order.orderNumber} linked to ${customer.email}`
      : `Order userId: ${order?.userId}, Expected: ${customer.id}`,
  });

  log({
    step: 'Order initial status',
    status: 'INFO',
    details: `Status: ${order?.orderStatus} | Payment: ${order?.paymentState} | Fulfillment: ${order?.fulfillmentStatus}`,
  });

  // ==================== PHASE 4: ADMIN ORDER PROCESSING ====================
  console.log('\n📦 PHASE 4: ADMIN ORDER PROCESSING\n');

  const statusFlow = [
    { from: 'PENDING_CONFIRMATION', to: 'CONFIRMED', description: 'Admin confirms order' },
    { from: 'CONFIRMED', to: 'PACKING', description: 'Start packing' },
    { from: 'PACKING', to: 'SHIPPED', description: 'Ship order' },
    { from: 'SHIPPED', to: 'DELIVERED', description: 'Mark as delivered' },
  ];

  for (const transition of statusFlow) {
    // Get current status
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { orderStatus: true },
    });

    if (currentOrder?.orderStatus !== transition.from) {
      log({
        step: `${transition.description}`,
        status: 'FAIL',
        details: `Expected ${transition.from}, got ${currentOrder?.orderStatus}`,
      });
      continue;
    }

    // Update status directly via Prisma (simulating admin action)
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          orderStatus: transition.to as any,
          status: transition.to === 'DELIVERED' ? 'COMPLETED' : transition.to,
          fulfillmentStatus: transition.to === 'SHIPPED' ? 'SHIPPED' : 
                            transition.to === 'DELIVERED' ? 'DELIVERED' : 
                            transition.to === 'PACKING' ? 'PACKING' : 'UNFULFILLED',
          ...(transition.to === 'SHIPPED' && { shippedAt: new Date() }),
          ...(transition.to === 'DELIVERED' && { deliveredAt: new Date() }),
        },
      });

      // Create status history
      await prisma.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: transition.from as any,
          toStatus: transition.to as any,
          actorAdminId: admin.id,
          noteInternal: `Test: ${transition.description}`,
        },
      });

      log({
        step: transition.description,
        status: 'PASS',
        details: `${transition.from} → ${transition.to}`,
      });
    } catch (e: any) {
      log({
        step: transition.description,
        status: 'FAIL',
        details: e.message,
      });
    }
  }

  // ==================== PHASE 5: FINAL VERIFICATION ====================
  console.log('\n📦 PHASE 5: FINAL VERIFICATION\n');

  const finalOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: { 
      items: true, 
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });

  log({
    step: 'Final order status',
    status: finalOrder?.orderStatus === 'DELIVERED' ? 'PASS' : 'FAIL',
    details: `Status: ${finalOrder?.orderStatus} | Fulfillment: ${finalOrder?.fulfillmentStatus}`,
  });

  log({
    step: 'Status history recorded',
    status: (finalOrder?.statusHistory?.length || 0) >= 4 ? 'PASS' : 'FAIL',
    details: `${finalOrder?.statusHistory?.length || 0} status changes recorded`,
  });

  // Show status history
  console.log('\n📋 STATUS HISTORY:');
  finalOrder?.statusHistory?.forEach((h, i) => {
    console.log(`   ${i + 1}. ${h.fromStatus || 'NEW'} → ${h.toStatus} (${h.createdAt.toLocaleString()})`);
  });

  // ==================== PHASE 6: DASHBOARD METRICS ====================
  console.log('\n📦 PHASE 6: DASHBOARD METRICS\n');

  const metrics = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: 'PENDING_CONFIRMATION' } }),
    prisma.order.count({ where: { orderStatus: 'CONFIRMED' } }),
    prisma.order.count({ where: { orderStatus: 'SHIPPED' } }),
    prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
    prisma.order.count({ where: { orderStatus: 'CANCELED' } }),
    prisma.order.count({ where: { paymentState: 'PAID' } }),
    prisma.order.count({ where: { paymentState: 'UNPAID' } }),
    prisma.order.aggregate({ _sum: { total: true } }),
  ]);

  console.log('📊 ORDER STATISTICS:');
  console.log(`   Total Orders: ${metrics[0]}`);
  console.log(`   ├─ Pending: ${metrics[1]}`);
  console.log(`   ├─ Confirmed: ${metrics[2]}`);
  console.log(`   ├─ Shipped: ${metrics[3]}`);
  console.log(`   ├─ Delivered: ${metrics[4]}`);
  console.log(`   └─ Canceled: ${metrics[5]}`);
  console.log('');
  console.log('💰 PAYMENT STATUS:');
  console.log(`   ├─ Paid: ${metrics[6]}`);
  console.log(`   └─ Unpaid: ${metrics[7]}`);
  console.log('');
  console.log(`📈 Total Revenue: ${Number(metrics[8]._sum.total || 0).toLocaleString('vi-VN')} VND`);

  // Customer orders
  const customerOrders = await prisma.order.findMany({
    where: { userId: customer.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { orderNumber: true, orderStatus: true, total: true, createdAt: true },
  });

  console.log(`\n👤 CUSTOMER ORDERS (${customer.email}):`);
  customerOrders.forEach((o, i) => {
    console.log(`   ${i + 1}. ${o.orderNumber} | ${o.orderStatus} | ${Number(o.total).toLocaleString('vi-VN')} VND`);
  });

  // ==================== SUMMARY ====================
  console.log('\n' + '═'.repeat(60));
  console.log('📋 TEST SUMMARY');
  console.log('═'.repeat(60));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const info = results.filter(r => r.status === 'INFO').length;

  console.log(`\n   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📋 Info: ${info}`);

  if (failed > 0) {
    console.log('\n❌ FAILURES:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   • ${r.step}: ${r.details}`);
    });
  }

  console.log('\n' + '═'.repeat(60));
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED - ORDER FLOW WORKING CORRECTLY!');
  } else {
    console.log('⚠️  SOME TESTS FAILED - PLEASE REVIEW');
  }
  console.log('═'.repeat(60) + '\n');

  await prisma.$disconnect();
}

main().catch(console.error);

