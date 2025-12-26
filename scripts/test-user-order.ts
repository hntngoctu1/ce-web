/**
 * Test: Create order for logged-in user
 * This simulates what happens when a logged-in user places an order
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🧪 TEST: Create Order for Logged-in User\n');

  // Get customer user
  const customer = await prisma.user.findFirst({
    where: { role: 'CUSTOMER' },
    include: { customerProfile: true },
  });

  if (!customer) {
    console.log('❌ No customer found');
    return;
  }

  console.log(`Found customer: ${customer.email} (ID: ${customer.id})`);

  // Get a product
  const product = await prisma.product.findFirst({
    where: { isActive: true, price: { gt: 0 } },
    select: { id: true, nameEn: true, price: true },
  });

  if (!product) {
    console.log('❌ No product found');
    return;
  }

  console.log(`Found product: ${product.nameEn} (ID: ${product.id})`);

  // Simulate checkout service logic
  const { allocateOrderCode } = await import('@/lib/orders/order-code');

  // Create order in transaction
  const order = await prisma.$transaction(async (tx) => {
    const { orderCode } = await allocateOrderCode(tx as any);

    const created = await tx.order.create({
      data: {
        orderNumber: orderCode,
        orderCode,
        userId: customer.id, // <-- KEY: Link to user

        customerName: customer.name || 'Test Customer',
        customerEmail: customer.email,
        customerPhone: '0901234567',
        shippingAddress: '123 Test Street, Ho Chi Minh City',

        buyerType: customer.customerProfile?.customerType || 'PERSONAL',
        buyerSnapshot: JSON.stringify({
          customerType: customer.customerProfile?.customerType || 'PERSONAL',
          name: customer.name,
          email: customer.email,
        }),
        shippingSnapshot: JSON.stringify({
          recipientName: customer.name,
          recipientEmail: customer.email,
          recipientPhone: '0901234567',
          addressLine1: '123 Test Street',
          city: 'Ho Chi Minh City',
          country: 'Vietnam',
        }),

        subtotal: product.price,
        total: product.price,
        totalAmount: product.price,
        paidAmount: 0,
        outstandingAmount: product.price,
        currency: 'VND',

        orderDate: new Date(),
        customerKind: customer.customerProfile?.customerType === 'BUSINESS' ? 'BUSINESS' : 'INDIVIDUAL',
        accountingStatus: 'PENDING_PAYMENT',

        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'COD',

        orderStatus: 'PENDING_CONFIRMATION',
        paymentState: 'UNPAID',
        fulfillmentStatus: 'UNFULFILLED',

        items: {
          create: [{
            productId: product.id,
            quantity: 1,
            unitPrice: product.price,
            totalPrice: product.price,
            productName: product.nameEn,
          }],
        },
      },
      select: { id: true, orderNumber: true, userId: true },
    });

    // Update loyalty points
    const pointsEarned = Math.floor(Number(product.price) / 10000);
    if (pointsEarned > 0) {
      await tx.customerProfile.upsert({
        where: { userId: customer.id },
        update: { loyaltyPoints: { increment: pointsEarned } },
        create: { userId: customer.id, loyaltyPoints: pointsEarned },
      });
    }

    return created;
  });

  console.log('\n✅ Order created successfully!');
  console.log(`   Order Number: ${order.orderNumber}`);
  console.log(`   Order ID: ${order.id}`);
  console.log(`   User ID: ${order.userId}`);

  // Verify order is linked
  const verifyOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: { user: { select: { email: true } } },
  });

  console.log(`   Linked to user: ${verifyOrder?.user?.email || 'NOT LINKED'}`);

  // Check customer profile points
  const profile = await prisma.customerProfile.findUnique({
    where: { userId: customer.id },
  });
  console.log(`   Loyalty points: ${profile?.loyaltyPoints || 0}`);

  // Count orders for this user
  const userOrders = await prisma.order.count({
    where: { userId: customer.id },
  });
  console.log(`   Total orders for user: ${userOrders}`);

  await prisma.$disconnect();
}

main().catch(console.error);

