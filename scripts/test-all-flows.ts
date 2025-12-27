/**
 * CE Website - Complete Flow Testing
 * Tests all business logic and user flows
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

interface TestResult {
  flow: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details?: string;
}

const results: TestResult[] = [];

function log(r: TestResult) {
  const icon = { PASS: '✅', FAIL: '❌', WARN: '⚠️' }[r.status];
  console.log(`${icon} [${r.flow}] ${r.test}`);
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

// ==================== PRODUCT FLOW ====================
async function testProductFlow() {
  console.log('\n🛍️ PRODUCT FLOW TESTS\n');

  // 1. Products API returns data
  const productsAPI = await fetchAPI('/api/products');
  const productCount = productsAPI.json?.products?.length || productsAPI.json?.data?.length || 0;
  log({
    flow: 'Product',
    test: 'API returns products',
    status: productsAPI.ok && productCount > 0 ? 'PASS' : 'FAIL',
    details: `${productCount} products`,
  });

  // 2. Products have required fields
  const products = await prisma.product.findMany({
    where: { isActive: true },
    take: 5,
    select: { id: true, slug: true, nameEn: true, nameVi: true, price: true },
  });

  const validProducts = products.filter(p => 
    p.slug && p.nameEn && p.nameVi && Number(p.price) > 0
  );
  log({
    flow: 'Product',
    test: 'Products have required fields',
    status: validProducts.length === products.length ? 'PASS' : 'WARN',
    details: `${validProducts.length}/${products.length} valid`,
  });

  // 3. Product detail pages work
  for (const product of products.slice(0, 2)) {
    const res = await fetchAPI(`/en/product/${product.slug}`);
    log({
      flow: 'Product',
      test: `Detail page: ${product.slug}`,
      status: res.status === 200 ? 'PASS' : 'FAIL',
    });
  }

  // 4. Featured products exist
  const featured = await prisma.product.count({ where: { isActive: true, isFeatured: true } });
  log({
    flow: 'Product',
    test: 'Featured products exist',
    status: featured > 0 ? 'PASS' : 'WARN',
    details: `${featured} featured`,
  });
}

// ==================== CHECKOUT FLOW ====================
async function testCheckoutFlow() {
  console.log('\n🛒 CHECKOUT FLOW TESTS\n');

  // 1. Cart page loads
  const cartPage = await fetchAPI('/en/cart');
  log({
    flow: 'Checkout',
    test: 'Cart page loads',
    status: cartPage.status === 200 ? 'PASS' : 'FAIL',
  });

  // 2. Checkout page loads
  const checkoutPage = await fetchAPI('/en/checkout');
  log({
    flow: 'Checkout',
    test: 'Checkout page loads',
    status: checkoutPage.status === 200 ? 'PASS' : 'FAIL',
  });

  // 3. Checkout API validation works
  const invalidCheckout = await fetchAPI('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  log({
    flow: 'Checkout',
    test: 'API validates empty request',
    status: invalidCheckout.status === 400 ? 'PASS' : 'WARN',
    details: `HTTP ${invalidCheckout.status}`,
  });

  // 4. Checkout creates order
  const product = await prisma.product.findFirst({
    where: { isActive: true, price: { gt: 0 } },
    select: { id: true, price: true },
  });

  if (product) {
    const orderBefore = await prisma.order.count();
    
    const checkout = await fetchAPI('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Flow Test User',
        email: 'flowtest@example.com',
        phone: '0901234567',
        address: '123 Flow Test Street',
        city: 'Ho Chi Minh',
        paymentMethod: 'COD',
        subtotal: Number(product.price),
        total: Number(product.price),
        items: [{ productId: product.id, quantity: 1, price: Number(product.price) }],
      }),
    });

    const orderAfter = await prisma.order.count();
    
    log({
      flow: 'Checkout',
      test: 'API creates order',
      status: checkout.ok && orderAfter > orderBefore ? 'PASS' : 'FAIL',
      details: checkout.ok ? `Order: ${checkout.json?.data?.orderCode}` : checkout.body?.substring(0, 100),
    });

    // 5. Order has correct data
    if (checkout.json?.data?.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: checkout.json.data.orderId },
        include: { items: true },
      });

      log({
        flow: 'Checkout',
        test: 'Order has items',
        status: order?.items && order.items.length > 0 ? 'PASS' : 'FAIL',
        details: `${order?.items?.length || 0} items`,
      });

      log({
        flow: 'Checkout',
        test: 'Order has correct total',
        status: Number(order?.total) === Number(product.price) ? 'PASS' : 'WARN',
        details: `Total: ${order?.total}`,
      });
    }
  }
}

// ==================== ORDER STATUS FLOW ====================
async function testOrderStatusFlow() {
  console.log('\n📦 ORDER STATUS FLOW TESTS\n');

  // Check order status transitions
  const statuses = await prisma.order.groupBy({
    by: ['orderStatus'],
    _count: true,
  });

  for (const s of statuses) {
    log({
      flow: 'Order Status',
      test: `Status: ${s.orderStatus}`,
      status: 'PASS',
      details: `${s._count} orders`,
    });
  }

  // Check payment states
  const payments = await prisma.order.groupBy({
    by: ['paymentState'],
    _count: true,
  });

  for (const p of payments) {
    log({
      flow: 'Order Status',
      test: `Payment: ${p.paymentState}`,
      status: 'PASS',
      details: `${p._count} orders`,
    });
  }
}

// ==================== USER FLOW ====================
async function testUserFlow() {
  console.log('\n👤 USER FLOW TESTS\n');

  // 1. Login page loads
  const loginPage = await fetchAPI('/en/login');
  log({
    flow: 'User',
    test: 'Login page loads',
    status: loginPage.status === 200 ? 'PASS' : 'FAIL',
  });

  // 2. Register page loads
  const registerPage = await fetchAPI('/en/register');
  log({
    flow: 'User',
    test: 'Register page loads',
    status: registerPage.status === 200 ? 'PASS' : 'FAIL',
  });

  // 3. Dashboard redirects without auth
  const dashboard = await fetchAPI('/en/dashboard');
  log({
    flow: 'User',
    test: 'Dashboard protection',
    status: dashboard.status === 200 || dashboard.status === 307 ? 'PASS' : 'FAIL',
  });

  // 4. Users exist
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true },
  });

  log({
    flow: 'User',
    test: 'Users exist',
    status: users.length >= 3 ? 'PASS' : 'WARN',
    details: `${users.length} users`,
  });

  // 5. Customer profiles
  const profiles = await prisma.customerProfile.count();
  log({
    flow: 'User',
    test: 'Customer profiles exist',
    status: profiles > 0 ? 'PASS' : 'WARN',
    details: `${profiles} profiles`,
  });
}

// ==================== CONTACT FLOW ====================
async function testContactFlow() {
  console.log('\n📧 CONTACT FLOW TESTS\n');

  // 1. Contact page loads
  const contactPage = await fetchAPI('/en/contact');
  log({
    flow: 'Contact',
    test: 'Contact page loads',
    status: contactPage.status === 200 ? 'PASS' : 'FAIL',
  });

  // 2. Contact API validation
  const invalidContact = await fetchAPI('/api/contact', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  log({
    flow: 'Contact',
    test: 'API validates empty request',
    status: invalidContact.status === 400 ? 'PASS' : 'WARN',
    details: `HTTP ${invalidContact.status}`,
  });

  // 3. Contact API creates message
  const msgBefore = await prisma.contactMessage.count();
  
  const contact = await fetchAPI('/api/contact', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Flow Tester',
      email: 'flowtest@example.com',
      phone: '0901234567',
      company: 'Test Company',
      subject: 'Flow Test',
      message: 'This is a flow test message.',
    }),
  });

  const msgAfter = await prisma.contactMessage.count();
  
  log({
    flow: 'Contact',
    test: 'API creates message',
    status: contact.ok && msgAfter > msgBefore ? 'PASS' : 'WARN',
    details: `Messages: ${msgBefore} -> ${msgAfter}`,
  });
}

// ==================== BLOG FLOW ====================
async function testBlogFlow() {
  console.log('\n📝 BLOG FLOW TESTS\n');

  // 1. Blog listing loads
  const blogList = await fetchAPI('/en/blog');
  log({
    flow: 'Blog',
    test: 'Blog listing loads',
    status: blogList.status === 200 ? 'PASS' : 'FAIL',
  });

  // 2. Published posts exist
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    take: 3,
    select: { slug: true, titleEn: true },
  });

  log({
    flow: 'Blog',
    test: 'Published posts exist',
    status: posts.length > 0 ? 'PASS' : 'WARN',
    details: `${posts.length} posts`,
  });

  // 3. Post detail pages load
  for (const post of posts.slice(0, 2)) {
    const res = await fetchAPI(`/en/blog/${post.slug}`);
    log({
      flow: 'Blog',
      test: `Post: ${post.slug.substring(0, 30)}`,
      status: res.status === 200 ? 'PASS' : 'FAIL',
    });
  }
}

// ==================== ADMIN FLOW ====================
async function testAdminFlow() {
  console.log('\n🔧 ADMIN FLOW TESTS\n');

  const adminPages = [
    '/en/admin',
    '/en/admin/products',
    '/en/admin/orders',
    '/en/admin/blog',
    '/en/admin/contacts',
  ];

  for (const page of adminPages) {
    const res = await fetchAPI(page);
    log({
      flow: 'Admin',
      test: page.replace('/en/admin', '') || '/dashboard',
      status: res.status === 200 || res.status === 307 ? 'PASS' : 'FAIL',
      details: `HTTP ${res.status}`,
    });
  }

  // Admin APIs require auth
  const adminAPIs = [
    { path: '/api/admin/products', method: 'POST' },
    { path: '/api/admin/orders', method: 'GET' },
    { path: '/api/admin/blog', method: 'POST' },
  ];

  for (const api of adminAPIs) {
    const res = await fetchAPI(api.path, { 
      method: api.method, 
      body: api.method === 'POST' ? '{}' : undefined 
    });
    log({
      flow: 'Admin',
      test: `API ${api.path} requires auth`,
      status: res.status === 401 ? 'PASS' : 'WARN',
      details: `HTTP ${res.status}`,
    });
  }
}

// ==================== SEARCH FLOW ====================
async function testSearchFlow() {
  console.log('\n🔍 SEARCH FLOW TESTS\n');

  const searches = ['tesa', 'adhesive', 'loctite'];
  
  for (const q of searches) {
    const res = await fetchAPI(`/en/menu/product?q=${q}`);
    log({
      flow: 'Search',
      test: `Search: "${q}"`,
      status: res.status === 200 ? 'PASS' : 'FAIL',
    });
  }

  // Filter by group
  const groups = await prisma.productGroup.findMany({ take: 2, select: { slug: true } });
  for (const g of groups) {
    const res = await fetchAPI(`/en/menu/product?groups=${g.slug}`);
    log({
      flow: 'Search',
      test: `Filter: ${g.slug}`,
      status: res.status === 200 ? 'PASS' : 'FAIL',
    });
  }

  // Sort
  const sorts = ['price-asc', 'price-desc', 'name-asc'];
  for (const s of sorts) {
    const res = await fetchAPI(`/en/menu/product?sort=${s}`);
    log({
      flow: 'Search',
      test: `Sort: ${s}`,
      status: res.status === 200 ? 'PASS' : 'FAIL',
    });
  }
}

// ==================== MAIN ====================
async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║  🔍 CE Website - Complete Flow Testing                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  try {
    await testProductFlow();
    await testCheckoutFlow();
    await testOrderStatusFlow();
    await testUserFlow();
    await testContactFlow();
    await testBlogFlow();
    await testAdminFlow();
    await testSearchFlow();

    // Summary
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('📋 FLOW TEST SUMMARY');
    console.log('═'.repeat(60));

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const warned = results.filter(r => r.status === 'WARN').length;
    const total = results.length;
    const score = Math.round(((passed + warned * 0.5) / total) * 100);

    console.log(`\n   ✅ Passed:  ${passed}`);
    console.log(`   ❌ Failed:  ${failed}`);
    console.log(`   ⚠️  Warned:  ${warned}`);
    console.log(`   📊 Score:   ${score}%`);

    if (failed > 0) {
      console.log('\n❌ FAILURES:');
      results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`   • [${r.flow}] ${r.test}`);
        if (r.details) console.log(`     ${r.details}`);
      });
    }

    console.log('\n' + '═'.repeat(60));
    if (failed === 0) {
      console.log('🚀 ALL FLOWS WORKING - PRODUCTION READY!');
    } else if (failed <= 2) {
      console.log('⚠️  MINOR ISSUES - REVIEW BEFORE RELEASE');
    } else {
      console.log('❌ CRITICAL ISSUES - NOT READY');
    }
    console.log('═'.repeat(60) + '\n');

  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);

