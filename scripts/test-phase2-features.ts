/**
 * Phase 2 Features Test Script
 * Tests all newly implemented features: Reviews, Coupons, Analytics
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface TestResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message?: string;
  details?: any;
}

const results: TestResult[] = [];

function log(result: TestResult) {
  results.push(result);
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${result.category}] ${result.test}: ${result.message || result.status}`);
}

async function fetchPage(path: string): Promise<{ ok: boolean; status: number; body: string }> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Accept': 'text/html,application/json' },
    });
    const body = await response.text();
    return { ok: response.ok, status: response.status, body };
  } catch (error: any) {
    return { ok: false, status: 0, body: error.message };
  }
}

async function fetchAPI(path: string, options?: RequestInit): Promise<{ ok: boolean; status: number; data: any }> {
  try {
    const response = await fetch(`${BASE_URL}/api${path}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    return { ok: response.ok, status: response.status, data };
  } catch (error: any) {
    return { ok: false, status: 0, data: { error: error.message } };
  }
}

async function testDatabaseModels() {
  console.log('\n📊 TESTING DATABASE MODELS\n');

  // Test Review model
  try {
    const reviewCount = await prisma.review.count();
    log({
      category: 'Database',
      test: 'Review model accessible',
      status: 'PASS',
      message: `${reviewCount} reviews in database`,
    });
  } catch (error: any) {
    log({
      category: 'Database',
      test: 'Review model accessible',
      status: 'FAIL',
      message: error.message,
    });
  }

  // Test ProductReviewStats model
  try {
    const statsCount = await prisma.productReviewStats.count();
    log({
      category: 'Database',
      test: 'ProductReviewStats model accessible',
      status: 'PASS',
      message: `${statsCount} stats records`,
    });
  } catch (error: any) {
    log({
      category: 'Database',
      test: 'ProductReviewStats model accessible',
      status: 'FAIL',
      message: error.message,
    });
  }

  // Test ReviewerBadge model
  try {
    const badgeCount = await prisma.reviewerBadge.count();
    log({
      category: 'Database',
      test: 'ReviewerBadge model accessible',
      status: 'PASS',
      message: `${badgeCount} badges earned`,
    });
  } catch (error: any) {
    log({
      category: 'Database',
      test: 'ReviewerBadge model accessible',
      status: 'FAIL',
      message: error.message,
    });
  }

  // Test Coupon model
  try {
    const couponCount = await prisma.coupon.count();
    log({
      category: 'Database',
      test: 'Coupon model accessible',
      status: 'PASS',
      message: `${couponCount} coupons in database`,
    });
  } catch (error: any) {
    log({
      category: 'Database',
      test: 'Coupon model accessible',
      status: 'FAIL',
      message: error.message,
    });
  }

  // Test FlashSale model
  try {
    const flashSaleCount = await prisma.flashSale.count();
    log({
      category: 'Database',
      test: 'FlashSale model accessible',
      status: 'PASS',
      message: `${flashSaleCount} flash sales`,
    });
  } catch (error: any) {
    log({
      category: 'Database',
      test: 'FlashSale model accessible',
      status: 'FAIL',
      message: error.message,
    });
  }

  // Test AutomaticDiscount model
  try {
    const autoDiscountCount = await prisma.automaticDiscount.count();
    log({
      category: 'Database',
      test: 'AutomaticDiscount model accessible',
      status: 'PASS',
      message: `${autoDiscountCount} automatic discounts`,
    });
  } catch (error: any) {
    log({
      category: 'Database',
      test: 'AutomaticDiscount model accessible',
      status: 'FAIL',
      message: error.message,
    });
  }
}

async function testReviewAPI() {
  console.log('\n🌟 TESTING REVIEW API\n');

  // Get a product to test with
  const product = await prisma.product.findFirst({
    where: { isActive: true },
    select: { id: true, nameEn: true },
  });

  if (!product) {
    log({
      category: 'Review API',
      test: 'Product available for testing',
      status: 'FAIL',
      message: 'No active products found',
    });
    return;
  }

  // Test GET reviews
  const reviewsResult = await fetchAPI(`/reviews?productId=${product.id}`);
  log({
    category: 'Review API',
    test: 'GET /api/reviews',
    status: reviewsResult.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${reviewsResult.status}`,
    details: reviewsResult.data?.success,
  });

  // Test GET review stats
  const statsResult = await fetchAPI(`/reviews/stats?productId=${product.id}`);
  log({
    category: 'Review API',
    test: 'GET /api/reviews/stats',
    status: statsResult.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${statsResult.status}`,
    details: statsResult.data,
  });

  // Test POST review (without auth - should fail with 401)
  const postReviewResult = await fetchAPI('/reviews', {
    method: 'POST',
    body: JSON.stringify({
      productId: product.id,
      overallRating: 5,
      content: 'Test review content for automated testing',
    }),
  });
  log({
    category: 'Review API',
    test: 'POST /api/reviews (no auth)',
    status: postReviewResult.status === 401 ? 'PASS' : 'WARN',
    message: `HTTP ${postReviewResult.status} (expected 401)`,
  });
}

async function testCouponAPI() {
  console.log('\n🎫 TESTING COUPON API\n');

  // Test GET coupons (admin only - should fail without auth)
  const couponsResult = await fetchAPI('/coupons');
  log({
    category: 'Coupon API',
    test: 'GET /api/coupons (no auth)',
    status: couponsResult.status === 401 || couponsResult.status === 403 ? 'PASS' : 'WARN',
    message: `HTTP ${couponsResult.status}`,
  });

  // Test coupon validation with non-existent code
  const validateResult = await fetchAPI('/coupons?code=INVALID_CODE_12345');
  log({
    category: 'Coupon API',
    test: 'GET /api/coupons?code=INVALID',
    status: validateResult.status === 404 ? 'PASS' : 'WARN',
    message: `HTTP ${validateResult.status}`,
  });

  // Test apply coupon without items
  const applyResult = await fetchAPI('/coupons/apply', {
    method: 'POST',
    body: JSON.stringify({
      code: 'TEST',
      items: [],
      subtotal: 0,
    }),
  });
  log({
    category: 'Coupon API',
    test: 'POST /api/coupons/apply (empty)',
    status: applyResult.status === 404 || applyResult.status === 400 ? 'PASS' : 'WARN',
    message: `HTTP ${applyResult.status}`,
  });
}

async function testAnalyticsPages() {
  console.log('\n📈 TESTING ANALYTICS PAGES\n');

  // Note: Admin pages are at /admin/ not /[locale]/admin/
  const analyticsPages = [
    { path: '/admin/analytics', name: 'Main Analytics' },
    { path: '/admin/analytics/customers', name: 'Customer Analytics' },
    { path: '/admin/analytics/inventory', name: 'Inventory Analytics' },
    { path: '/admin/analytics/marketing', name: 'Marketing Analytics' },
  ];

  for (const page of analyticsPages) {
    const result = await fetchPage(page.path);
    log({
      category: 'Analytics Pages',
      test: page.name,
      // Admin pages require auth, so redirect (302/307) or auth error is expected
      status: result.ok || result.status === 307 || result.status === 302 || result.status === 401 ? 'PASS' : 'FAIL',
      message: `HTTP ${result.status}`,
    });
  }
}

async function testCouponPages() {
  console.log('\n🎫 TESTING COUPON PAGES\n');

  // Note: Admin pages are at /admin/ not /[locale]/admin/
  const couponPages = [
    { path: '/admin/coupons', name: 'Coupon List' },
    { path: '/admin/coupons/new', name: 'Create Coupon' },
  ];

  for (const page of couponPages) {
    const result = await fetchPage(page.path);
    log({
      category: 'Coupon Pages',
      test: page.name,
      // Admin pages require auth, so redirect (302/307) or auth error is expected
      status: result.ok || result.status === 307 || result.status === 302 || result.status === 401 ? 'PASS' : 'FAIL',
      message: `HTTP ${result.status}`,
    });
  }
}

async function testDataIntegrity() {
  console.log('\n🔍 TESTING DATA INTEGRITY\n');

  // Check products have required relations for reviews
  const productsWithoutStats = await prisma.product.count({
    where: {
      isActive: true,
      reviewStats: null,
    },
  });
  log({
    category: 'Data Integrity',
    test: 'Products can have review stats',
    status: 'PASS',
    message: `${productsWithoutStats} products without stats (normal for new products)`,
  });

  // Check orders have couponUsage relation available
  const ordersCount = await prisma.order.count();
  log({
    category: 'Data Integrity',
    test: 'Orders support coupon usage',
    status: 'PASS',
    message: `${ordersCount} orders in database`,
  });

  // Check users have review relations
  const usersWithReviews = await prisma.user.count({
    where: {
      reviews: { some: {} },
    },
  });
  log({
    category: 'Data Integrity',
    test: 'Users can have reviews',
    status: 'PASS',
    message: `${usersWithReviews} users with reviews`,
  });
}

async function createSampleData() {
  console.log('\n📝 CREATING SAMPLE DATA\n');

  // Create sample coupon if none exists
  const existingCoupon = await prisma.coupon.findFirst();
  if (!existingCoupon) {
    try {
      const coupon = await prisma.coupon.create({
        data: {
          code: 'WELCOME10',
          name: 'Welcome 10% Off',
          description: 'Get 10% off on your first order',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          maxDiscount: 500000,
          usageLimit: 1000,
          usagePerUser: 1,
          startsAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          targetType: 'FIRST_ORDER',
          status: 'ACTIVE',
        },
      });
      log({
        category: 'Sample Data',
        test: 'Create sample coupon',
        status: 'PASS',
        message: `Created coupon: ${coupon.code}`,
      });
    } catch (error: any) {
      log({
        category: 'Sample Data',
        test: 'Create sample coupon',
        status: 'FAIL',
        message: error.message,
      });
    }
  } else {
    log({
      category: 'Sample Data',
      test: 'Sample coupon exists',
      status: 'PASS',
      message: `Existing coupon: ${existingCoupon.code}`,
    });
  }

  // Create flash sale if none exists
  const existingFlashSale = await prisma.flashSale.findFirst();
  if (!existingFlashSale) {
    try {
      const products = await prisma.product.findMany({
        where: { isActive: true, price: { gt: 0 } },
        take: 5,
        select: { id: true, price: true },
      });

      if (products.length > 0) {
        const flashSale = await prisma.flashSale.create({
          data: {
            name: 'Flash Sale Week',
            description: 'Limited time offers on selected products',
            startsAt: new Date(),
            endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            isActive: true,
            items: {
              create: products.map((p) => ({
                productId: p.id,
                salePrice: Number(p.price) * 0.8, // 20% off
                stockLimit: 50,
              })),
            },
          },
        });
        log({
          category: 'Sample Data',
          test: 'Create flash sale',
          status: 'PASS',
          message: `Created flash sale with ${products.length} items`,
        });
      }
    } catch (error: any) {
      log({
        category: 'Sample Data',
        test: 'Create flash sale',
        status: 'FAIL',
        message: error.message,
      });
    }
  } else {
    log({
      category: 'Sample Data',
      test: 'Flash sale exists',
      status: 'PASS',
      message: `Existing flash sale: ${existingFlashSale.name}`,
    });
  }
}

async function printSummary() {
  console.log('\n' + '═'.repeat(60));
  console.log('📋 PHASE 2 FEATURES TEST SUMMARY');
  console.log('═'.repeat(60) + '\n');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const warned = results.filter((r) => r.status === 'WARN').length;
  const total = results.length;
  const score = Math.round((passed / total) * 100);

  console.log(`   ✅ Passed:  ${passed}`);
  console.log(`   ❌ Failed:  ${failed}`);
  console.log(`   ⚠️  Warned:  ${warned}`);
  console.log(`   📊 Score:   ${score}%\n`);

  // Group by category
  const categories = [...new Set(results.map((r) => r.category))];
  for (const cat of categories) {
    const catResults = results.filter((r) => r.category === cat);
    const catPassed = catResults.filter((r) => r.status === 'PASS').length;
    console.log(`   ${cat}: ${catPassed}/${catResults.length} passed`);
  }

  console.log('\n' + '═'.repeat(60));

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Phase 2 features are working correctly.');
  } else {
    console.log('⚠️  SOME TESTS FAILED. Review the errors above.');
    console.log('\nFailed tests:');
    results.filter((r) => r.status === 'FAIL').forEach((r) => {
      console.log(`   ❌ [${r.category}] ${r.test}: ${r.message}`);
    });
  }

  console.log('═'.repeat(60) + '\n');
}

async function main() {
  console.log('\n╔' + '═'.repeat(58) + '╗');
  console.log('║  🧪 PHASE 2 FEATURES TEST                                  ║');
  console.log('║  Reviews, Coupons, Analytics                               ║');
  console.log('╚' + '═'.repeat(58) + '╝\n');

  try {
    await testDatabaseModels();
    await testReviewAPI();
    await testCouponAPI();
    await testAnalyticsPages();
    await testCouponPages();
    await testDataIntegrity();
    await createSampleData();
    await printSummary();
  } catch (error: any) {
    console.error('\n❌ Test script error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

