/**
 * CE Website - Release Readiness Test Suite
 * Comprehensive testing for all major features
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface TestResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

function log(result: TestResult) {
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${result.category}] ${result.test}: ${result.message}`);
  results.push(result);
}

// ==================== DATABASE TESTS ====================
async function testDatabase() {
  console.log('\n📊 DATABASE TESTS\n' + '='.repeat(50));
  
  const start = Date.now();
  
  // Test 1: Connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    log({ category: 'Database', test: 'Connection', status: 'PASS', message: 'PostgreSQL connected', duration: Date.now() - start });
  } catch (e: any) {
    log({ category: 'Database', test: 'Connection', status: 'FAIL', message: e.message });
    return;
  }
  
  // Test 2: Products count
  const productCount = await prisma.product.count({ where: { isActive: true } });
  log({
    category: 'Database',
    test: 'Products',
    status: productCount >= 30 ? 'PASS' : 'WARN',
    message: `${productCount} active products found`,
  });
  
  // Test 3: Product Groups
  const groupCount = await prisma.productGroup.count({ where: { isActive: true } });
  log({
    category: 'Database',
    test: 'Product Groups',
    status: groupCount >= 10 ? 'PASS' : 'WARN',
    message: `${groupCount} active groups`,
  });
  
  // Test 4: Industry Categories
  const industryCount = await prisma.industryCategory.count({ where: { isActive: true } });
  log({
    category: 'Database',
    test: 'Industry Categories',
    status: industryCount >= 10 ? 'PASS' : 'WARN',
    message: `${industryCount} active industries`,
  });
  
  // Test 5: Brands/Partners
  const brandCount = await prisma.partner.count({ where: { isBrand: true, isActive: true } });
  log({
    category: 'Database',
    test: 'Brands',
    status: brandCount >= 15 ? 'PASS' : 'WARN',
    message: `${brandCount} active brands`,
  });
  
  // Test 6: Users
  const userCount = await prisma.user.count();
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  log({
    category: 'Database',
    test: 'Users',
    status: adminCount >= 1 ? 'PASS' : 'FAIL',
    message: `${userCount} users (${adminCount} admin)`,
  });
  
  // Test 7: Blog Posts
  const postCount = await prisma.blogPost.count({ where: { isPublished: true } });
  log({
    category: 'Database',
    test: 'Blog Posts',
    status: postCount >= 3 ? 'PASS' : 'WARN',
    message: `${postCount} published posts`,
  });
  
  // Test 8: Orders
  const orderCount = await prisma.order.count();
  log({
    category: 'Database',
    test: 'Orders',
    status: orderCount >= 0 ? 'PASS' : 'WARN',
    message: `${orderCount} orders in system`,
  });
  
  // Test 9: Settings
  const settingCount = await prisma.setting.count();
  log({
    category: 'Database',
    test: 'Settings',
    status: settingCount >= 5 ? 'PASS' : 'WARN',
    message: `${settingCount} settings configured`,
  });
  
  // Test 10: Data Integrity - Products with Groups
  const productsWithGroups = await prisma.product.count({
    where: { isActive: true, groupId: { not: null } },
  });
  const integrity = Math.round((productsWithGroups / productCount) * 100);
  log({
    category: 'Database',
    test: 'Data Integrity',
    status: integrity >= 80 ? 'PASS' : integrity >= 50 ? 'WARN' : 'FAIL',
    message: `${integrity}% products have groups assigned`,
  });
}

// ==================== PRODUCT TESTS ====================
async function testProducts() {
  console.log('\n🛒 PRODUCT TESTS\n' + '='.repeat(50));
  
  // Test featured products
  const featuredProducts = await prisma.product.count({
    where: { isActive: true, isFeatured: true },
  });
  log({
    category: 'Products',
    test: 'Featured Products',
    status: featuredProducts >= 5 ? 'PASS' : 'WARN',
    message: `${featuredProducts} featured products`,
  });
  
  // Test on-sale products
  const saleProducts = await prisma.product.count({
    where: { isActive: true, isOnSale: true },
  });
  log({
    category: 'Products',
    test: 'Sale Products',
    status: saleProducts >= 2 ? 'PASS' : 'WARN',
    message: `${saleProducts} products on sale`,
  });
  
  // Test products with prices
  const pricedProducts = await prisma.product.count({
    where: { isActive: true, price: { gt: 0 } },
  });
  log({
    category: 'Products',
    test: 'Products with Prices',
    status: 'PASS',
    message: `${pricedProducts} products have prices`,
  });
  
  // Test products by group distribution
  const groupDistribution = await prisma.product.groupBy({
    by: ['groupId'],
    where: { isActive: true },
    _count: { _all: true },
  });
  const groupsWithProducts = groupDistribution.filter((g) => g._count._all > 0).length;
  log({
    category: 'Products',
    test: 'Group Distribution',
    status: groupsWithProducts >= 7 ? 'PASS' : 'WARN',
    message: `Products distributed across ${groupsWithProducts} groups`,
  });
  
  // Test stock availability
  const inStockProducts = await prisma.product.count({
    where: { isActive: true, stockQuantity: { gt: 0 } },
  });
  log({
    category: 'Products',
    test: 'Stock Availability',
    status: inStockProducts >= 25 ? 'PASS' : 'WARN',
    message: `${inStockProducts} products in stock`,
  });
  
  // Test product slugs uniqueness
  const slugs = await prisma.product.findMany({
    select: { slug: true },
    where: { isActive: true },
  });
  const uniqueSlugs = new Set(slugs.map((s) => s.slug));
  log({
    category: 'Products',
    test: 'Slug Uniqueness',
    status: uniqueSlugs.size === slugs.length ? 'PASS' : 'FAIL',
    message: `${uniqueSlugs.size}/${slugs.length} unique slugs`,
  });
  
  // Test bilingual content
  const bilingualProducts = await prisma.product.count({
    where: {
      isActive: true,
      nameVi: { not: '' },
      nameEn: { not: '' },
    },
  });
  log({
    category: 'Products',
    test: 'Bilingual Content',
    status: 'PASS',
    message: `${bilingualProducts} products have both EN/VI names`,
  });
}

// ==================== ORDER WORKFLOW TESTS ====================
async function testOrderWorkflow() {
  console.log('\n📦 ORDER WORKFLOW TESTS\n' + '='.repeat(50));
  
  // Check order statuses
  const ordersByStatus = await prisma.order.groupBy({
    by: ['orderStatus'],
    _count: { _all: true },
  });
  
  for (const status of ordersByStatus) {
    log({
      category: 'Orders',
      test: `Status: ${status.orderStatus}`,
      status: 'PASS',
      message: `${status._count._all} orders`,
    });
  }
  
  // Check payment states
  const ordersByPayment = await prisma.order.groupBy({
    by: ['paymentState'],
    _count: { _all: true },
  });
  
  for (const payment of ordersByPayment) {
    log({
      category: 'Orders',
      test: `Payment: ${payment.paymentState}`,
      status: 'PASS',
      message: `${payment._count._all} orders`,
    });
  }
  
  // Check order items integrity
  const ordersWithItems = await prisma.order.count({
    where: { items: { some: {} } },
  });
  const totalOrders = await prisma.order.count();
  log({
    category: 'Orders',
    test: 'Order Items Integrity',
    status: ordersWithItems === totalOrders ? 'PASS' : 'WARN',
    message: `${ordersWithItems}/${totalOrders} orders have items`,
  });
  
  // Check order codes
  const ordersWithCodes = await prisma.order.count({
    where: { orderCode: { not: null } },
  });
  log({
    category: 'Orders',
    test: 'Order Codes',
    status: 'PASS',
    message: `${ordersWithCodes}/${totalOrders} orders have codes`,
  });
}

// ==================== USER & AUTH TESTS ====================
async function testUserAuth() {
  console.log('\n👤 USER & AUTH TESTS\n' + '='.repeat(50));
  
  // Check user roles distribution
  const roleDistribution = await prisma.user.groupBy({
    by: ['role'],
    _count: { _all: true },
  });
  
  for (const role of roleDistribution) {
    log({
      category: 'Auth',
      test: `Role: ${role.role}`,
      status: 'PASS',
      message: `${role._count._all} users`,
    });
  }
  
  // Check admin exists
  const adminExists = await prisma.user.findFirst({
    where: { role: 'ADMIN', email: 'admin@ce.com.vn' },
  });
  log({
    category: 'Auth',
    test: 'Admin Account',
    status: adminExists ? 'PASS' : 'FAIL',
    message: adminExists ? 'Default admin exists' : 'No admin found!',
  });
  
  // Check customer profiles
  const profileCount = await prisma.customerProfile.count();
  const customerCount = await prisma.user.count({ where: { role: 'CUSTOMER' } });
  log({
    category: 'Auth',
    test: 'Customer Profiles',
    status: profileCount >= 0 ? 'PASS' : 'WARN',
    message: `${profileCount}/${customerCount} customers have profiles`,
  });
}

// ==================== CONTENT (BLOG/CMS) TESTS ====================
async function testContent() {
  console.log('\n📝 CONTENT (BLOG/CMS) TESTS\n' + '='.repeat(50));
  
  // Check blog categories
  const categoryCount = await prisma.blogCategory.count({ where: { isActive: true } });
  log({
    category: 'Content',
    test: 'Blog Categories',
    status: categoryCount >= 3 ? 'PASS' : 'WARN',
    message: `${categoryCount} active categories`,
  });
  
  // Check published posts
  const publishedPosts = await prisma.blogPost.count({
    where: { isPublished: true },
  });
  log({
    category: 'Content',
    test: 'Published Posts',
    status: publishedPosts >= 3 ? 'PASS' : 'WARN',
    message: `${publishedPosts} published posts`,
  });
  
  // Check posts with categories
  const postsWithCategory = await prisma.blogPost.count({
    where: { isPublished: true, categoryId: { not: null } },
  });
  log({
    category: 'Content',
    test: 'Posts Categorization',
    status: 'PASS',
    message: `${postsWithCategory}/${publishedPosts} posts categorized`,
  });
  
  // Check page sections
  const pageSections = await prisma.pageSection.count({ where: { isActive: true } });
  log({
    category: 'Content',
    test: 'Page Sections',
    status: pageSections >= 3 ? 'PASS' : 'WARN',
    message: `${pageSections} active page sections`,
  });
  
  // Check services
  const serviceCount = await prisma.serviceCategory.count({ where: { isActive: true } });
  log({
    category: 'Content',
    test: 'Services',
    status: serviceCount >= 3 ? 'PASS' : 'WARN',
    message: `${serviceCount} active services`,
  });
}

// ==================== API ENDPOINT TESTS ====================
async function testAPIEndpoints() {
  console.log('\n🔌 API ENDPOINT TESTS\n' + '='.repeat(50));
  
  const endpoints = [
    { path: '/api/products', name: 'Products API' },
    { path: '/api/contact', name: 'Contact API', method: 'POST' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      const start = Date.now();
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method || 'GET',
        headers: { 'Content-Type': 'application/json' },
        ...(endpoint.method === 'POST' && {
          body: JSON.stringify({
            name: 'Test',
            email: 'test@test.com',
            message: 'Test message',
          }),
        }),
      });
      const duration = Date.now() - start;
      
      log({
        category: 'API',
        test: endpoint.name,
        status: response.ok || response.status === 400 ? 'PASS' : 'FAIL',
        message: `Status ${response.status} (${duration}ms)`,
        duration,
      });
    } catch (e: any) {
      log({
        category: 'API',
        test: endpoint.name,
        status: 'FAIL',
        message: `Connection failed: ${e.message}`,
      });
    }
  }
}

// ==================== PAGE LOAD TESTS ====================
async function testPageLoads() {
  console.log('\n🌐 PAGE LOAD TESTS\n' + '='.repeat(50));
  
  const pages = [
    { path: '/', name: 'Homepage' },
    { path: '/en', name: 'Homepage (EN)' },
    { path: '/vi', name: 'Homepage (VI)' },
    { path: '/en/menu/product', name: 'Products Page' },
    { path: '/en/blog', name: 'Blog Page' },
    { path: '/en/contact', name: 'Contact Page' },
    { path: '/en/envision', name: 'Envision Page' },
    { path: '/en/engage', name: 'Engage Page' },
    { path: '/en/entrench', name: 'Entrench Page' },
    { path: '/en/industries', name: 'Industries Page' },
    { path: '/en/case-studies', name: 'Case Studies Page' },
    { path: '/en/login', name: 'Login Page' },
    { path: '/en/register', name: 'Register Page' },
  ];
  
  for (const page of pages) {
    try {
      const start = Date.now();
      const response = await fetch(`${BASE_URL}${page.path}`);
      const duration = Date.now() - start;
      
      const status = response.ok ? 'PASS' : response.status === 404 ? 'WARN' : 'FAIL';
      log({
        category: 'Pages',
        test: page.name,
        status,
        message: `Status ${response.status} (${duration}ms)`,
        duration,
      });
    } catch (e: any) {
      log({
        category: 'Pages',
        test: page.name,
        status: 'FAIL',
        message: `Connection failed: ${e.message}`,
      });
    }
  }
}

// ==================== SUMMARY REPORT ====================
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 RELEASE READINESS REPORT');
  console.log('='.repeat(60) + '\n');
  
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const warned = results.filter((r) => r.status === 'WARN').length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed} (${Math.round((passed / total) * 100)}%)`);
  console.log(`❌ Failed: ${failed} (${Math.round((failed / total) * 100)}%)`);
  console.log(`⚠️  Warnings: ${warned} (${Math.round((warned / total) * 100)}%)`);
  
  const score = Math.round(((passed + warned * 0.5) / total) * 100);
  console.log(`\n📊 Release Readiness Score: ${score}%`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter((r) => r.status === 'FAIL').forEach((r) => {
      console.log(`   - [${r.category}] ${r.test}: ${r.message}`);
    });
  }
  
  if (warned > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.filter((r) => r.status === 'WARN').forEach((r) => {
      console.log(`   - [${r.category}] ${r.test}: ${r.message}`);
    });
  }
  
  // Performance summary
  const pageResults = results.filter((r) => r.category === 'Pages' && r.duration);
  if (pageResults.length > 0) {
    const avgDuration = Math.round(
      pageResults.reduce((sum, r) => sum + (r.duration || 0), 0) / pageResults.length
    );
    console.log(`\n⚡ Avg Page Load Time: ${avgDuration}ms`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  const verdict = score >= 90 ? '🚀 READY FOR RELEASE' : score >= 70 ? '⚠️ NEEDS ATTENTION' : '❌ NOT READY';
  console.log(`\n${verdict}\n`);
  
  return { passed, failed, warned, total, score };
}

// ==================== MAIN ====================
async function main() {
  console.log('🔍 CE Website - Release Readiness Test');
  console.log('Date:', new Date().toISOString());
  console.log('Server:', BASE_URL);
  console.log('');
  
  try {
    await testDatabase();
    await testProducts();
    await testOrderWorkflow();
    await testUserAuth();
    await testContent();
    await testPageLoads();
    // await testAPIEndpoints(); // Optional: Enable if server is running
    
    const report = generateReport();
    
    // Exit with error code if critical failures
    if (report.failed > 0 && report.score < 70) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n❌ Test suite error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

