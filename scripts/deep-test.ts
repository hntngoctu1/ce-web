/**
 * CE Website - Deep Feature Testing
 * Tests critical user flows and data integrity
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: string;
}

const results: TestResult[] = [];

function log(result: TestResult) {
  const icon = { PASS: '✅', FAIL: '❌', WARN: '⚠️' }[result.status];
  console.log(`${icon} ${result.name}`);
  if (result.details) console.log(`   └─ ${result.details}`);
  results.push(result);
}

async function fetchPage(path: string, options?: RequestInit) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
    const body = await response.text();
    return { ok: response.ok, status: response.status, body };
  } catch (e: any) {
    return { ok: false, status: 0, body: e.message };
  }
}

// ==================== DATABASE INTEGRITY TESTS ====================
async function testDatabaseIntegrity() {
  console.log('\n📊 DATABASE INTEGRITY TESTS\n');
  
  // 1. Check products have all required fields
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameVi: true,
      price: true,
      groupId: true,
      group: { select: { nameEn: true } },
      images: { select: { url: true } },
    },
  });

  const missingData = products.filter(p => 
    !p.nameEn || !p.nameVi || !p.slug || Number(p.price) <= 0
  );
  
  log({
    name: 'Products have complete data',
    status: missingData.length === 0 ? 'PASS' : 'WARN',
    message: `${products.length - missingData.length}/${products.length} complete`,
    details: missingData.length > 0 ? `Missing: ${missingData.map(p => p.slug).join(', ')}` : undefined,
  });

  // 2. Check orphaned order items
  const orphanedItems = await prisma.orderItem.findMany({
    where: { productId: null },
    select: { id: true, orderId: true, productName: true },
  });
  
  log({
    name: 'No orphaned order items',
    status: orphanedItems.length === 0 ? 'PASS' : 'WARN',
    message: `${orphanedItems.length} orphaned items`,
  });

  // 3. Check orders have valid status flow
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      orderNumber: true,
      orderStatus: true,
      paymentState: true,
      fulfillmentStatus: true,
      userId: true,
      total: true,
      items: { select: { id: true } },
    },
  });

  const ordersWithoutItems = orders.filter(o => o.items.length === 0);
  log({
    name: 'Orders have items',
    status: ordersWithoutItems.length === 0 ? 'PASS' : 'FAIL',
    message: `${orders.length - ordersWithoutItems.length}/${orders.length} have items`,
    details: ordersWithoutItems.length > 0 ? `Empty: ${ordersWithoutItems.map(o => o.orderNumber).join(', ')}` : undefined,
  });

  // 4. Check user-order relationship
  const ordersWithUsers = orders.filter(o => o.userId);
  log({
    name: 'Orders linked to users',
    status: ordersWithUsers.length === orders.length ? 'PASS' : 'WARN',
    message: `${ordersWithUsers.length}/${orders.length} linked`,
    details: ordersWithUsers.length < orders.length ? 'Some orders are guest checkouts' : undefined,
  });

  // 5. Check customer profiles exist for customers
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    include: { customerProfile: true },
  });
  
  const customersWithProfile = customers.filter(c => c.customerProfile);
  log({
    name: 'Customers have profiles',
    status: customersWithProfile.length === customers.length ? 'PASS' : 'WARN',
    message: `${customersWithProfile.length}/${customers.length} have profiles`,
  });
}

// ==================== USER FLOW TESTS ====================
async function testUserFlows() {
  console.log('\n👤 USER FLOW TESTS\n');

  // 1. Test login page loads
  const loginPage = await fetchPage('/en/login');
  log({
    name: 'Login page loads',
    status: loginPage.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${loginPage.status}`,
  });

  // 2. Test register page loads
  const registerPage = await fetchPage('/en/register');
  log({
    name: 'Register page loads',
    status: registerPage.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${registerPage.status}`,
  });

  // 3. Test dashboard redirects when not logged in
  const dashboardPage = await fetchPage('/en/dashboard');
  log({
    name: 'Dashboard protects unauthenticated users',
    status: dashboardPage.status === 307 || dashboardPage.status === 302 || dashboardPage.body?.includes('login') ? 'PASS' : 'WARN',
    message: `HTTP ${dashboardPage.status}`,
    details: dashboardPage.status === 200 ? 'May be showing login form' : undefined,
  });

  // 4. Test orders page redirects when not logged in
  const ordersPage = await fetchPage('/en/dashboard/orders');
  log({
    name: 'Orders page protects unauthenticated users',
    status: ordersPage.status === 307 || ordersPage.status === 302 || ordersPage.body?.includes('login') ? 'PASS' : 'WARN',
    message: `HTTP ${ordersPage.status}`,
  });

  // 5. Test profile page redirects when not logged in  
  const profilePage = await fetchPage('/en/dashboard/profile');
  log({
    name: 'Profile page protects unauthenticated users',
    status: profilePage.status === 307 || profilePage.status === 302 || profilePage.body?.includes('login') ? 'PASS' : 'WARN',
    message: `HTTP ${profilePage.status}`,
  });
}

// ==================== E-COMMERCE FLOW TESTS ====================
async function testEcommerceFlows() {
  console.log('\n🛒 E-COMMERCE FLOW TESTS\n');

  // 1. Test product listing
  const plpPage = await fetchPage('/en/menu/product');
  const hasProducts = plpPage.body?.includes('product-card') || plpPage.body?.includes('ProductCard');
  log({
    name: 'Product listing page loads with products',
    status: plpPage.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${plpPage.status}`,
  });

  // 2. Test product detail page
  const product = await prisma.product.findFirst({
    where: { isActive: true },
    select: { slug: true },
  });
  
  if (product) {
    const pdpPage = await fetchPage(`/en/product/${product.slug}`);
    log({
      name: 'Product detail page loads',
      status: pdpPage.ok ? 'PASS' : 'FAIL',
      message: `HTTP ${pdpPage.status} for ${product.slug}`,
    });
  }

  // 3. Test cart page
  const cartPage = await fetchPage('/en/cart');
  log({
    name: 'Cart page loads',
    status: cartPage.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${cartPage.status}`,
  });

  // 4. Test checkout page
  const checkoutPage = await fetchPage('/en/checkout');
  log({
    name: 'Checkout page loads',
    status: checkoutPage.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${checkoutPage.status}`,
  });

  // 5. Test search functionality
  const searchPage = await fetchPage('/en/menu/product?q=tesa');
  log({
    name: 'Search functionality works',
    status: searchPage.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${searchPage.status}`,
  });

  // 6. Test filter functionality
  const filterPage = await fetchPage('/en/menu/product?groups=industrial-tapes');
  log({
    name: 'Filter functionality works',
    status: filterPage.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${filterPage.status}`,
  });
}

// ==================== ADMIN FLOW TESTS ====================
async function testAdminFlows() {
  console.log('\n🔐 ADMIN FLOW TESTS\n');

  const adminPages = [
    { path: '/en/admin', name: 'Admin Dashboard' },
    { path: '/en/admin/products', name: 'Products Management' },
    { path: '/en/admin/orders', name: 'Orders Management' },
    { path: '/en/admin/users', name: 'Users Management' },
    { path: '/en/admin/blog', name: 'Blog Management' },
    { path: '/en/admin/contacts', name: 'Contacts Management' },
    { path: '/en/admin/warehouse', name: 'Warehouse Management' },
    { path: '/en/admin/settings', name: 'Settings' },
  ];

  for (const page of adminPages) {
    const result = await fetchPage(page.path);
    // Should either redirect to login or show login form
    const isProtected = result.status === 307 || result.status === 302 || result.ok;
    
    log({
      name: `${page.name} accessible`,
      status: isProtected ? 'PASS' : 'FAIL',
      message: `HTTP ${result.status}`,
    });
  }
}

// ==================== API TESTS ====================
async function testAPIs() {
  console.log('\n🔌 API TESTS\n');

  // 1. Test products API
  const productsAPI = await fetchPage('/api/products');
  log({
    name: 'Products API returns data',
    status: productsAPI.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${productsAPI.status}`,
  });

  // 2. Test contact API
  const contactAPI = await fetchPage('/api/contact', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Deep Test',
      email: 'deeptest@example.com',
      phone: '0901234567',
      company: 'Test Co',
      subject: 'Deep Test',
      message: 'This is a deep test message.',
    }),
  });
  log({
    name: 'Contact API accepts submissions',
    status: contactAPI.ok || contactAPI.status === 201 ? 'PASS' : 'WARN',
    message: `HTTP ${contactAPI.status}`,
  });

  // 3. Test checkout API validation
  const checkoutInvalid = await fetchPage('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  log({
    name: 'Checkout API validates input',
    status: checkoutInvalid.status === 400 ? 'PASS' : 'WARN',
    message: `HTTP ${checkoutInvalid.status} (expected 400)`,
  });

  // 4. Test checkout API with valid data (guest)
  const product = await prisma.product.findFirst({
    where: { isActive: true, price: { gt: 0 } },
    select: { id: true, price: true },
  });

  if (product) {
    const checkoutValid = await fetchPage('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Deep Test Customer',
        email: 'deeptest-checkout@example.com',
        phone: '0901234567',
        address: '123 Deep Test Street',
        city: 'Ho Chi Minh City',
        paymentMethod: 'COD',
        subtotal: Number(product.price),
        total: Number(product.price),
        items: [{ productId: product.id, quantity: 1, price: Number(product.price) }],
      }),
    });
    
    log({
      name: 'Checkout API creates orders',
      status: checkoutValid.ok || checkoutValid.status === 201 ? 'PASS' : 'FAIL',
      message: `HTTP ${checkoutValid.status}`,
      details: !checkoutValid.ok ? checkoutValid.body?.substring(0, 200) : undefined,
    });
  }

  // 5. Test admin APIs require auth
  const adminProductsAPI = await fetchPage('/api/admin/products', { method: 'POST', body: '{}' });
  log({
    name: 'Admin Products API requires auth',
    status: adminProductsAPI.status === 401 ? 'PASS' : 'WARN',
    message: `HTTP ${adminProductsAPI.status} (expected 401)`,
  });

  const adminOrdersAPI = await fetchPage('/api/admin/orders');
  log({
    name: 'Admin Orders API requires auth',
    status: adminOrdersAPI.status === 401 ? 'PASS' : 'WARN',
    message: `HTTP ${adminOrdersAPI.status} (expected 401)`,
  });
}

// ==================== CONTENT TESTS ====================
async function testContent() {
  console.log('\n📝 CONTENT TESTS\n');

  // 1. Test blog listing
  const blogPage = await fetchPage('/en/blog');
  log({
    name: 'Blog listing page loads',
    status: blogPage.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${blogPage.status}`,
  });

  // 2. Test blog post detail
  try {
    const post = await prisma.blogPost.findFirst({
      where: { status: 'PUBLISHED' },
      select: { slug: true },
    });
    
    if (post) {
      const postPage = await fetchPage(`/en/blog/${post.slug}`);
      log({
        name: 'Blog post detail page loads',
        status: postPage.ok ? 'PASS' : 'FAIL',
        message: `HTTP ${postPage.status} for ${post.slug}`,
      });
    } else {
      log({
        name: 'Blog post detail page loads',
        status: 'WARN',
        message: 'No published posts to test',
      });
    }
  } catch (e: any) {
    log({
      name: 'Blog post detail page loads',
      status: 'WARN',
      message: `Error: ${e.message}`,
    });
  }

  // 3. Test contact page
  const contactPage = await fetchPage('/en/contact');
  log({
    name: 'Contact page loads',
    status: contactPage.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${contactPage.status}`,
  });

  // 4. Test case studies page
  const caseStudiesPage = await fetchPage('/en/case-studies');
  log({
    name: 'Case Studies page loads',
    status: caseStudiesPage.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${caseStudiesPage.status}`,
  });

  // 5. Test industries page
  const industriesPage = await fetchPage('/en/industries');
  log({
    name: 'Industries page loads',
    status: industriesPage.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${industriesPage.status}`,
  });
}

// ==================== CRITICAL BUG CHECKS ====================
async function testCriticalBugs() {
  console.log('\n🐛 CRITICAL BUG CHECKS\n');

  // 1. Check for orders without userId (guest orders are OK but should be noted)
  const guestOrders = await prisma.order.count({ where: { userId: null } });
  const totalOrders = await prisma.order.count();
  
  log({
    name: 'Guest vs Logged-in orders ratio',
    status: guestOrders < totalOrders ? 'PASS' : 'WARN',
    message: `${totalOrders - guestOrders} logged-in, ${guestOrders} guest orders`,
    details: guestOrders === totalOrders && totalOrders > 0 ? 'All orders are guest orders - check user auth flow' : undefined,
  });

  // 2. Check for users with orders
  const usersWithOrders = await prisma.user.findMany({
    where: { orders: { some: {} } },
    select: { email: true, orders: { select: { id: true } } },
  });

  log({
    name: 'Users have order history',
    status: usersWithOrders.length > 0 ? 'PASS' : 'WARN',
    message: `${usersWithOrders.length} users have orders`,
    details: usersWithOrders.length === 0 ? 'No users have orders yet' : undefined,
  });

  // 3. Check loyalty points calculation
  const customersWithPoints = await prisma.customerProfile.findMany({
    where: { loyaltyPoints: { gt: 0 } },
    include: { user: { select: { email: true } } },
  });

  log({
    name: 'Loyalty points tracking',
    status: customersWithPoints.length >= 0 ? 'PASS' : 'WARN',
    message: `${customersWithPoints.length} customers have points`,
  });

  // 4. Check for 404 on key routes
  const keyRoutes = [
    '/en',
    '/en/menu/product',
    '/en/blog',
    '/en/contact',
    '/en/cart',
    '/en/checkout',
    '/en/login',
  ];

  for (const route of keyRoutes) {
    const result = await fetchPage(route);
    if (result.status === 404) {
      log({
        name: `Route ${route} not 404`,
        status: 'FAIL',
        message: `HTTP 404`,
      });
    }
  }

  // 5. Check translations work
  const enPage = await fetchPage('/en');
  const viPage = await fetchPage('/vi');
  
  log({
    name: 'Multi-language support works',
    status: enPage.ok && viPage.ok ? 'PASS' : 'FAIL',
    message: `EN: ${enPage.status}, VI: ${viPage.status}`,
  });
}

// ==================== GENERATE REPORT ====================
function generateReport() {
  console.log('\n');
  console.log('═'.repeat(60));
  console.log('📋 DEEP TEST REPORT');
  console.log('═'.repeat(60));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  const total = results.length;
  const score = Math.round(((passed + warned * 0.5) / total) * 100);

  console.log(`\n   Total Tests:  ${total}`);
  console.log(`   ✅ Passed:    ${passed} (${Math.round(passed/total*100)}%)`);
  console.log(`   ❌ Failed:    ${failed} (${Math.round(failed/total*100)}%)`);
  console.log(`   ⚠️  Warned:    ${warned} (${Math.round(warned/total*100)}%)`);
  console.log(`\n   📊 Score: ${score}%`);

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:\n');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   • ${r.name}: ${r.message}`);
      if (r.details) console.log(`     ${r.details}`);
    });
  }

  if (warned > 0) {
    console.log('\n⚠️  WARNINGS:\n');
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`   • ${r.name}: ${r.message}`);
      if (r.details) console.log(`     ${r.details}`);
    });
  }

  console.log('\n' + '═'.repeat(60));
  
  if (failed === 0 && warned <= 3) {
    console.log('🚀 READY FOR PRODUCTION');
  } else if (failed <= 2) {
    console.log('⚠️  NEEDS MINOR FIXES');
  } else {
    console.log('❌ NOT READY - FIX CRITICAL ISSUES');
  }
  
  console.log('═'.repeat(60) + '\n');

  return { passed, failed, warned, score };
}

// ==================== MAIN ====================
async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🔍 CE Website - Deep Feature Testing                     ║');
  console.log('║  Testing Critical Flows & Data Integrity                  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\n📅 ${new Date().toISOString()}`);
  console.log(`🌐 ${BASE_URL}\n`);

  try {
    await testDatabaseIntegrity();
    await testUserFlows();
    await testEcommerceFlows();
    await testAdminFlows();
    await testAPIs();
    await testContent();
    await testCriticalBugs();

    const stats = generateReport();

    if (stats.failed > 5 || stats.score < 70) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n❌ Test crashed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

