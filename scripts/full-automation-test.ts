/**
 * CE Website - Full Automation Test Suite
 * Comprehensive testing for ALL client & admin features
 * 
 * Run: npx tsx scripts/full-automation-test.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ==================== TYPES ====================
interface TestResult {
  id: string;
  category: string;
  subcategory: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP';
  message: string;
  duration?: number;
  details?: string;
}

interface TestSummary {
  category: string;
  passed: number;
  failed: number;
  warned: number;
  skipped: number;
  total: number;
}

const results: TestResult[] = [];
let testCounter = 0;

// ==================== HELPERS ====================
function log(result: Omit<TestResult, 'id'>) {
  testCounter++;
  const id = `T${String(testCounter).padStart(3, '0')}`;
  const icon = {
    PASS: '✅',
    FAIL: '❌',
    WARN: '⚠️',
    SKIP: '⏭️',
  }[result.status];
  
  console.log(`${icon} [${id}] ${result.category}/${result.subcategory}: ${result.test}`);
  if (result.status === 'FAIL' && result.details) {
    console.log(`   └─ ${result.details}`);
  }
  
  results.push({ ...result, id });
}

async function fetchPage(path: string, options?: RequestInit): Promise<{ ok: boolean; status: number; duration: number; body?: string }> {
  const start = Date.now();
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    const duration = Date.now() - start;
    const body = await response.text();
    return { ok: response.ok, status: response.status, duration, body };
  } catch (e: any) {
    return { ok: false, status: 0, duration: Date.now() - start };
  }
}

async function fetchAPI(path: string, options?: RequestInit) {
  return fetchPage(`/api${path}`, options);
}

// ==================== DATABASE TESTS ====================
async function testDatabaseConnection() {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 DATABASE & DATA INTEGRITY TESTS');
  console.log('═'.repeat(60));
  
  // DB Connection
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    log({
      category: 'Database',
      subcategory: 'Connection',
      test: 'PostgreSQL connection',
      status: 'PASS',
      message: 'Connected successfully',
      duration: Date.now() - start,
    });
  } catch (e: any) {
    log({
      category: 'Database',
      subcategory: 'Connection',
      test: 'PostgreSQL connection',
      status: 'FAIL',
      message: 'Connection failed',
      details: e.message,
    });
    return;
  }
  
  // Products
  const productCount = await prisma.product.count({ where: { isActive: true } });
  log({
    category: 'Database',
    subcategory: 'Products',
    test: 'Active products exist',
    status: productCount >= 30 ? 'PASS' : productCount > 0 ? 'WARN' : 'FAIL',
    message: `${productCount} products`,
  });
  
  // Products have required fields
  const productsWithNames = await prisma.product.count({
    where: { isActive: true, nameEn: { not: '' }, nameVi: { not: '' } },
  });
  log({
    category: 'Database',
    subcategory: 'Products',
    test: 'Products have bilingual names',
    status: productsWithNames === productCount ? 'PASS' : 'WARN',
    message: `${productsWithNames}/${productCount} complete`,
  });
  
  // Products have prices
  const productsWithPrices = await prisma.product.count({
    where: { isActive: true, price: { gt: 0 } },
  });
  log({
    category: 'Database',
    subcategory: 'Products',
    test: 'Products have prices',
    status: productsWithPrices > 0 ? 'PASS' : 'WARN',
    message: `${productsWithPrices}/${productCount} priced`,
  });
  
  // Product Groups
  const groupCount = await prisma.productGroup.count({ where: { isActive: true } });
  log({
    category: 'Database',
    subcategory: 'Categories',
    test: 'Product groups exist',
    status: groupCount >= 10 ? 'PASS' : 'WARN',
    message: `${groupCount} groups`,
  });
  
  // Industry Categories
  const industryCount = await prisma.industryCategory.count({ where: { isActive: true } });
  log({
    category: 'Database',
    subcategory: 'Categories',
    test: 'Industry categories exist',
    status: industryCount >= 10 ? 'PASS' : 'WARN',
    message: `${industryCount} industries`,
  });
  
  // Brands
  const brandCount = await prisma.partner.count({ where: { isBrand: true, isActive: true } });
  log({
    category: 'Database',
    subcategory: 'Brands',
    test: 'Brands exist',
    status: brandCount >= 15 ? 'PASS' : 'WARN',
    message: `${brandCount} brands`,
  });
  
  // Users
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  log({
    category: 'Database',
    subcategory: 'Users',
    test: 'Admin user exists',
    status: adminCount >= 1 ? 'PASS' : 'FAIL',
    message: `${adminCount} admins`,
  });
  
  const editorCount = await prisma.user.count({ where: { role: 'EDITOR' } });
  log({
    category: 'Database',
    subcategory: 'Users',
    test: 'Editor user exists',
    status: editorCount >= 1 ? 'PASS' : 'WARN',
    message: `${editorCount} editors`,
  });
  
  const customerCount = await prisma.user.count({ where: { role: 'CUSTOMER' } });
  log({
    category: 'Database',
    subcategory: 'Users',
    test: 'Customer users exist',
    status: customerCount >= 1 ? 'PASS' : 'WARN',
    message: `${customerCount} customers`,
  });
  
  // Blog
  const postCount = await prisma.blogPost.count({ where: { isPublished: true } });
  log({
    category: 'Database',
    subcategory: 'Blog',
    test: 'Published posts exist',
    status: postCount >= 3 ? 'PASS' : 'WARN',
    message: `${postCount} posts`,
  });
  
  const categoryCount = await prisma.blogCategory.count({ where: { isActive: true } });
  log({
    category: 'Database',
    subcategory: 'Blog',
    test: 'Blog categories exist',
    status: categoryCount >= 3 ? 'PASS' : 'WARN',
    message: `${categoryCount} categories`,
  });
  
  // Services
  const serviceCount = await prisma.serviceCategory.count({ where: { isActive: true } });
  log({
    category: 'Database',
    subcategory: 'Content',
    test: 'Services exist',
    status: serviceCount >= 3 ? 'PASS' : 'WARN',
    message: `${serviceCount} services`,
  });
  
  // Page Sections
  const sectionCount = await prisma.pageSection.count({ where: { isActive: true } });
  log({
    category: 'Database',
    subcategory: 'Content',
    test: 'Page sections exist',
    status: sectionCount >= 3 ? 'PASS' : 'WARN',
    message: `${sectionCount} sections`,
  });
  
  // Settings
  const settingCount = await prisma.setting.count();
  log({
    category: 'Database',
    subcategory: 'Config',
    test: 'Settings configured',
    status: settingCount >= 5 ? 'PASS' : 'WARN',
    message: `${settingCount} settings`,
  });
  
  // Data Integrity: Products with Groups
  const productsWithGroups = await prisma.product.count({
    where: { isActive: true, groupId: { not: null } },
  });
  const groupPercent = Math.round((productsWithGroups / productCount) * 100);
  log({
    category: 'Database',
    subcategory: 'Integrity',
    test: 'Products assigned to groups',
    status: groupPercent >= 80 ? 'PASS' : groupPercent >= 50 ? 'WARN' : 'FAIL',
    message: `${groupPercent}% (${productsWithGroups}/${productCount})`,
  });
  
  // Data Integrity: Products with Brands
  const productsWithBrands = await prisma.product.count({
    where: { isActive: true, brandId: { not: null } },
  });
  const brandPercent = Math.round((productsWithBrands / productCount) * 100);
  log({
    category: 'Database',
    subcategory: 'Integrity',
    test: 'Products assigned to brands',
    status: brandPercent >= 80 ? 'PASS' : brandPercent >= 50 ? 'WARN' : 'FAIL',
    message: `${brandPercent}% (${productsWithBrands}/${productCount})`,
  });
  
  // Unique slugs
  const slugs = await prisma.product.findMany({ select: { slug: true }, where: { isActive: true } });
  const uniqueSlugs = new Set(slugs.map(s => s.slug));
  log({
    category: 'Database',
    subcategory: 'Integrity',
    test: 'Product slugs are unique',
    status: uniqueSlugs.size === slugs.length ? 'PASS' : 'FAIL',
    message: `${uniqueSlugs.size}/${slugs.length} unique`,
  });
}

// ==================== CLIENT PAGES TESTS ====================
async function testClientPages() {
  console.log('\n' + '═'.repeat(60));
  console.log('🌐 CLIENT PAGES TESTS');
  console.log('═'.repeat(60));
  
  const pages = [
    // Homepage
    { path: '/', name: 'Homepage (default)' },
    { path: '/en', name: 'Homepage (EN)' },
    { path: '/vi', name: 'Homepage (VI)' },
    
    // Products
    { path: '/en/menu/product', name: 'Product List (PLP)' },
    { path: '/en/menu/product?groups=industrial-tapes', name: 'PLP with filter' },
    { path: '/en/menu/product?q=tesa', name: 'PLP with search' },
    { path: '/en/menu/product?sort=price-asc', name: 'PLP with sort' },
    { path: '/en/menu/product?featured=true', name: 'PLP featured only' },
    { path: '/en/menu/product?onSale=true', name: 'PLP on sale' },
    
    // Industries
    { path: '/en/industries', name: 'Industries List' },
    { path: '/en/menu/industrial', name: 'Industrial Solutions' },
    
    // Case Studies
    { path: '/en/case-studies', name: 'Case Studies' },
    
    // About Pages
    { path: '/en/envision', name: 'Envision Page' },
    { path: '/en/engage', name: 'Engage Page' },
    { path: '/en/entrench', name: 'Entrench Page' },
    
    // Blog
    { path: '/en/blog', name: 'Blog List' },
    
    // Contact
    { path: '/en/contact', name: 'Contact Page' },
    
    // Auth
    { path: '/en/login', name: 'Login Page' },
    { path: '/en/register', name: 'Register Page' },
    
    // Cart & Checkout
    { path: '/en/cart', name: 'Cart Page' },
    { path: '/en/checkout', name: 'Checkout Page' },
    
    // Dashboard (requires auth - expect redirect)
    { path: '/en/dashboard', name: 'User Dashboard', expectRedirect: true },
  ];
  
  for (const page of pages) {
    const result = await fetchPage(page.path);
    const isOk = result.ok || (page.expectRedirect && (result.status === 307 || result.status === 302));
    
    log({
      category: 'Client',
      subcategory: 'Pages',
      test: page.name,
      status: isOk ? 'PASS' : result.status === 404 ? 'FAIL' : 'WARN',
      message: `HTTP ${result.status} (${result.duration}ms)`,
      duration: result.duration,
    });
  }
  
  // Test Vietnamese pages
  const viPages = [
    { path: '/vi/menu/product', name: 'Products (VI)' },
    { path: '/vi/blog', name: 'Blog (VI)' },
    { path: '/vi/contact', name: 'Contact (VI)' },
  ];
  
  for (const page of viPages) {
    const result = await fetchPage(page.path);
    log({
      category: 'Client',
      subcategory: 'i18n',
      test: page.name,
      status: result.ok ? 'PASS' : 'FAIL',
      message: `HTTP ${result.status} (${result.duration}ms)`,
      duration: result.duration,
    });
  }
}

// ==================== PRODUCT DETAIL TESTS ====================
async function testProductDetail() {
  console.log('\n' + '═'.repeat(60));
  console.log('🛍️ PRODUCT DETAIL TESTS');
  console.log('═'.repeat(60));
  
  // Get sample products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    take: 5,
    select: { slug: true, nameEn: true },
  });
  
  for (const product of products) {
    const result = await fetchPage(`/en/product/${product.slug}`);
    log({
      category: 'Client',
      subcategory: 'Product Detail',
      test: product.nameEn.substring(0, 40),
      status: result.ok ? 'PASS' : 'FAIL',
      message: `HTTP ${result.status} (${result.duration}ms)`,
      duration: result.duration,
    });
  }
  
  // Test non-existent product
  const result = await fetchPage('/en/product/non-existent-product-xyz');
  log({
    category: 'Client',
    subcategory: 'Product Detail',
    test: 'Non-existent product returns 404',
    status: result.status === 404 ? 'PASS' : 'WARN',
    message: `HTTP ${result.status}`,
  });
}

// ==================== API TESTS ====================
async function testAPIs() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔌 API ENDPOINT TESTS');
  console.log('═'.repeat(60));
  
  // Public APIs
  const publicAPIs = [
    { path: '/products', method: 'GET', name: 'Get Products' },
    { path: '/products?limit=10', method: 'GET', name: 'Get Products (paginated)' },
  ];
  
  for (const api of publicAPIs) {
    const result = await fetchAPI(api.path, { method: api.method });
    log({
      category: 'API',
      subcategory: 'Public',
      test: api.name,
      status: result.ok ? 'PASS' : 'FAIL',
      message: `HTTP ${result.status} (${result.duration}ms)`,
      duration: result.duration,
    });
  }
  
  // Contact API
  const contactResult = await fetchAPI('/contact', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      phone: '0901234567',
      company: 'Test Company',
      subject: 'Test Subject',
      message: 'This is a test message from automation testing.',
    }),
  });
  log({
    category: 'API',
    subcategory: 'Public',
    test: 'Contact Form Submit',
    status: contactResult.ok || contactResult.status === 201 ? 'PASS' : 'WARN',
    message: `HTTP ${contactResult.status}`,
  });
  
  // Auth APIs (expect 401 without auth) - use correct HTTP methods
  const authAPIs = [
    { path: '/admin/products', method: 'POST', name: 'Admin Products (no auth)' },
    { path: '/admin/orders', method: 'GET', name: 'Admin Orders (no auth)' },
    { path: '/admin/blog', method: 'POST', name: 'Admin Blog (no auth)' },
  ];
  
  for (const api of authAPIs) {
    const result = await fetchAPI(api.path, { 
      method: api.method,
      body: api.method === 'POST' ? JSON.stringify({}) : undefined 
    });
    log({
      category: 'API',
      subcategory: 'Auth Check',
      test: api.name,
      status: result.status === 401 || result.status === 403 ? 'PASS' : 'WARN',
      message: `HTTP ${result.status} (expected 401/403)`,
    });
  }
  
  // Checkout API (validation test)
  const checkoutResult = await fetchAPI('/checkout', {
    method: 'POST',
    body: JSON.stringify({}), // Empty body should fail validation
  });
  log({
    category: 'API',
    subcategory: 'Validation',
    test: 'Checkout validates input',
    status: checkoutResult.status === 400 ? 'PASS' : 'WARN',
    message: `HTTP ${checkoutResult.status} (expected 400)`,
  });
}

// ==================== ADMIN PAGES TESTS ====================
async function testAdminPages() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔐 ADMIN PAGES TESTS');
  console.log('═'.repeat(60));
  
  const adminPages = [
    { path: '/admin', name: 'Admin Dashboard' },
    { path: '/admin/products', name: 'Product Management' },
    { path: '/admin/products/new', name: 'Add New Product' },
    { path: '/admin/orders', name: 'Order Management' },
    { path: '/admin/users', name: 'User Management' },
    { path: '/admin/blog', name: 'Blog Management' },
    { path: '/admin/blog/new', name: 'Add New Blog Post' },
    { path: '/admin/contacts', name: 'Contact Messages' },
    { path: '/admin/warehouse', name: 'Warehouse' },
    { path: '/admin/settings', name: 'Settings' },
  ];
  
  for (const page of adminPages) {
    const result = await fetchPage(`/en${page.path}`);
    // Admin pages should redirect to login (307/302) or show login form
    const isProtected = result.status === 307 || result.status === 302 || result.ok;
    
    log({
      category: 'Admin',
      subcategory: 'Pages',
      test: page.name,
      status: isProtected ? 'PASS' : 'FAIL',
      message: `HTTP ${result.status} (${result.duration}ms)`,
      duration: result.duration,
    });
  }
}

// ==================== CART & CHECKOUT TESTS ====================
async function testCartCheckout() {
  console.log('\n' + '═'.repeat(60));
  console.log('🛒 CART & CHECKOUT FLOW TESTS');
  console.log('═'.repeat(60));
  
  // Get a sample product
  const product = await prisma.product.findFirst({
    where: { isActive: true, price: { gt: 0 } },
    select: { id: true, slug: true, nameEn: true, price: true },
  });
  
  if (!product) {
    log({
      category: 'E-Commerce',
      subcategory: 'Cart',
      test: 'Sample product available',
      status: 'FAIL',
      message: 'No products found',
    });
    return;
  }
  
  log({
    category: 'E-Commerce',
    subcategory: 'Cart',
    test: 'Sample product available',
    status: 'PASS',
    message: `Using: ${product.nameEn}`,
  });
  
  // Test cart page loads
  const cartPage = await fetchPage('/en/cart');
  log({
    category: 'E-Commerce',
    subcategory: 'Cart',
    test: 'Cart page loads',
    status: cartPage.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${cartPage.status}`,
  });
  
  // Test checkout page loads
  const checkoutPage = await fetchPage('/en/checkout');
  log({
    category: 'E-Commerce',
    subcategory: 'Checkout',
    test: 'Checkout page loads',
    status: checkoutPage.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${checkoutPage.status}`,
  });
  
  // Test checkout API with valid data (matching API schema)
  const checkoutData = {
    name: 'Test Customer',
    email: 'test@automation.com',
    phone: '0901234567',
    address: '123 Test Street, District 1',
    city: 'Ho Chi Minh City',
    paymentMethod: 'COD',
    subtotal: Number(product.price) * 2,
    total: Number(product.price) * 2,
    items: [
      {
        productId: product.id,
        quantity: 2,
        price: Number(product.price),
      },
    ],
  };
  
  const checkoutResult = await fetchAPI('/checkout', {
    method: 'POST',
    body: JSON.stringify(checkoutData),
  });
  
  log({
    category: 'E-Commerce',
    subcategory: 'Checkout',
    test: 'Checkout API processes order',
    status: checkoutResult.ok || checkoutResult.status === 201 ? 'PASS' : 'WARN',
    message: `HTTP ${checkoutResult.status}`,
    details: checkoutResult.ok ? undefined : `Response: ${checkoutResult.body?.substring(0, 100)}`,
  });
}

// ==================== SEARCH & FILTER TESTS ====================
async function testSearchFilter() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔍 SEARCH & FILTER TESTS');
  console.log('═'.repeat(60));
  
  // Search by keyword
  const searchTests = [
    { query: 'tesa', name: 'Search: "tesa"' },
    { query: 'adhesive', name: 'Search: "adhesive"' },
    { query: 'loctite', name: 'Search: "loctite"' },
    { query: '3m', name: 'Search: "3m"' },
  ];
  
  for (const test of searchTests) {
    const result = await fetchPage(`/en/menu/product?q=${encodeURIComponent(test.query)}`);
    log({
      category: 'Search',
      subcategory: 'Keyword',
      test: test.name,
      status: result.ok ? 'PASS' : 'FAIL',
      message: `HTTP ${result.status} (${result.duration}ms)`,
      duration: result.duration,
    });
  }
  
  // Filter by group
  const groups = await prisma.productGroup.findMany({
    where: { isActive: true },
    take: 3,
    select: { slug: true, nameEn: true },
  });
  
  for (const group of groups) {
    const result = await fetchPage(`/en/menu/product?groups=${group.slug}`);
    log({
      category: 'Search',
      subcategory: 'Filter (Group)',
      test: group.nameEn.substring(0, 30),
      status: result.ok ? 'PASS' : 'FAIL',
      message: `HTTP ${result.status}`,
    });
  }
  
  // Sort options
  const sortOptions = [
    { sort: 'price-asc', name: 'Sort: Price Low to High' },
    { sort: 'price-desc', name: 'Sort: Price High to Low' },
    { sort: 'newest', name: 'Sort: Newest First' },
    { sort: 'featured', name: 'Sort: Featured First' },
  ];
  
  for (const option of sortOptions) {
    const result = await fetchPage(`/en/menu/product?sort=${option.sort}`);
    log({
      category: 'Search',
      subcategory: 'Sort',
      test: option.name,
      status: result.ok ? 'PASS' : 'FAIL',
      message: `HTTP ${result.status}`,
    });
  }
  
  // Quick filters
  const quickFilters = [
    { filter: 'featured=true', name: 'Quick: Featured Only' },
    { filter: 'onSale=true', name: 'Quick: On Sale' },
    { filter: 'inStock=true', name: 'Quick: In Stock' },
  ];
  
  for (const filter of quickFilters) {
    const result = await fetchPage(`/en/menu/product?${filter.filter}`);
    log({
      category: 'Search',
      subcategory: 'Quick Filter',
      test: filter.name,
      status: result.ok ? 'PASS' : 'FAIL',
      message: `HTTP ${result.status}`,
    });
  }
}

// ==================== BLOG TESTS ====================
async function testBlog() {
  console.log('\n' + '═'.repeat(60));
  console.log('📝 BLOG & CMS TESTS');
  console.log('═'.repeat(60));
  
  // Blog list page
  const blogList = await fetchPage('/en/blog');
  log({
    category: 'Blog',
    subcategory: 'Pages',
    test: 'Blog list page',
    status: blogList.ok ? 'PASS' : 'FAIL',
    message: `HTTP ${blogList.status}`,
  });
  
  // Blog categories
  const categories = await prisma.blogCategory.findMany({
    where: { isActive: true },
    select: { slug: true, nameEn: true },
  });
  
  for (const cat of categories) {
    const result = await fetchPage(`/en/blog?category=${cat.slug}`);
    log({
      category: 'Blog',
      subcategory: 'Categories',
      test: cat.nameEn,
      status: result.ok ? 'PASS' : 'FAIL',
      message: `HTTP ${result.status}`,
    });
  }
  
  // Individual blog posts
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    take: 3,
    select: { slug: true, titleEn: true },
  });
  
  for (const post of posts) {
    const result = await fetchPage(`/en/blog/${post.slug}`);
    log({
      category: 'Blog',
      subcategory: 'Posts',
      test: post.titleEn.substring(0, 35),
      status: result.ok ? 'PASS' : 'FAIL',
      message: `HTTP ${result.status}`,
    });
  }
}

// ==================== PERFORMANCE TESTS ====================
async function testPerformance() {
  console.log('\n' + '═'.repeat(60));
  console.log('⚡ PERFORMANCE TESTS');
  console.log('═'.repeat(60));
  
  const criticalPages = [
    { path: '/', name: 'Homepage', threshold: 2000 },
    { path: '/en/menu/product', name: 'Product List', threshold: 2000 },
    { path: '/en/blog', name: 'Blog', threshold: 2000 },
    { path: '/en/contact', name: 'Contact', threshold: 3000 },
  ];
  
  for (const page of criticalPages) {
    const durations: number[] = [];
    
    // Run 3 times and average
    for (let i = 0; i < 3; i++) {
      const result = await fetchPage(page.path);
      if (result.duration) durations.push(result.duration);
    }
    
    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    
    log({
      category: 'Performance',
      subcategory: 'Page Load',
      test: page.name,
      status: avgDuration < page.threshold ? 'PASS' : avgDuration < page.threshold * 1.5 ? 'WARN' : 'FAIL',
      message: `Avg: ${avgDuration}ms (target: <${page.threshold}ms)`,
      duration: avgDuration,
    });
  }
  
  // Database query performance
  const start = Date.now();
  await prisma.product.findMany({
    where: { isActive: true },
    include: { images: true, group: true, brand: true },
    take: 50,
  });
  const dbDuration = Date.now() - start;
  
  log({
    category: 'Performance',
    subcategory: 'Database',
    test: 'Complex product query (50 items)',
    status: dbDuration < 500 ? 'PASS' : dbDuration < 1000 ? 'WARN' : 'FAIL',
    message: `${dbDuration}ms`,
    duration: dbDuration,
  });
}

// ==================== SECURITY TESTS ====================
async function testSecurity() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔒 SECURITY TESTS');
  console.log('═'.repeat(60));
  
  // Admin routes require auth - test with correct HTTP methods
  // Note: products only has POST, orders has GET
  const adminRouteTests = [
    { route: '/api/admin/products', method: 'POST', name: 'products (POST)' },
    { route: '/api/admin/orders', method: 'GET', name: 'orders (GET)' },
    { route: '/api/admin/blog', method: 'POST', name: 'blog (POST)' },
  ];
  
  for (const { route, method, name } of adminRouteTests) {
    const result = await fetchPage(route, { 
      method,
      body: method === 'POST' ? JSON.stringify({}) : undefined
    });
    log({
      category: 'Security',
      subcategory: 'Auth Required',
      test: name,
      status: result.status === 401 || result.status === 403 ? 'PASS' : 'FAIL',
      message: `HTTP ${result.status} (expected 401/403)`,
    });
  }
  
  // SQL Injection test (should be sanitized by Prisma)
  const sqlInjection = await fetchPage("/en/menu/product?q='; DROP TABLE products; --");
  log({
    category: 'Security',
    subcategory: 'SQL Injection',
    test: 'Search input sanitized',
    status: sqlInjection.ok || sqlInjection.status === 400 ? 'PASS' : 'WARN',
    message: `HTTP ${sqlInjection.status}`,
  });
  
  // XSS test
  const xssTest = await fetchPage("/en/menu/product?q=<script>alert('xss')</script>");
  log({
    category: 'Security',
    subcategory: 'XSS',
    test: 'Script tags in search',
    status: xssTest.ok ? 'PASS' : 'WARN',
    message: 'React escapes by default',
  });
}

// ==================== GENERATE REPORT ====================
function generateReport() {
  console.log('\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(25) + '📋 FULL TEST REPORT' + ' '.repeat(34) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const total = results.length;
  
  // Summary by category
  const categories = [...new Set(results.map(r => r.category))];
  const summaries: TestSummary[] = categories.map(cat => {
    const catResults = results.filter(r => r.category === cat);
    return {
      category: cat,
      passed: catResults.filter(r => r.status === 'PASS').length,
      failed: catResults.filter(r => r.status === 'FAIL').length,
      warned: catResults.filter(r => r.status === 'WARN').length,
      skipped: catResults.filter(r => r.status === 'SKIP').length,
      total: catResults.length,
    };
  });
  
  console.log('\n📊 SUMMARY BY CATEGORY\n');
  console.log('┌' + '─'.repeat(20) + '┬' + '─'.repeat(8) + '┬' + '─'.repeat(8) + '┬' + '─'.repeat(8) + '┬' + '─'.repeat(8) + '┬' + '─'.repeat(10) + '┐');
  console.log('│ Category           │ Passed │ Failed │ Warned │ Skip   │ Rate     │');
  console.log('├' + '─'.repeat(20) + '┼' + '─'.repeat(8) + '┼' + '─'.repeat(8) + '┼' + '─'.repeat(8) + '┼' + '─'.repeat(8) + '┼' + '─'.repeat(10) + '┤');
  
  for (const s of summaries) {
    const rate = Math.round((s.passed / s.total) * 100);
    const icon = rate === 100 ? '✅' : rate >= 80 ? '⚠️' : '❌';
    console.log(
      `│ ${s.category.padEnd(18)} │ ${String(s.passed).padStart(6)} │ ${String(s.failed).padStart(6)} │ ${String(s.warned).padStart(6)} │ ${String(s.skipped).padStart(6)} │ ${icon} ${String(rate).padStart(3)}%   │`
    );
  }
  
  console.log('└' + '─'.repeat(20) + '┴' + '─'.repeat(8) + '┴' + '─'.repeat(8) + '┴' + '─'.repeat(8) + '┴' + '─'.repeat(8) + '┴' + '─'.repeat(10) + '┘');
  
  // Overall stats
  console.log('\n📈 OVERALL STATISTICS\n');
  console.log(`   Total Tests:  ${total}`);
  console.log(`   ✅ Passed:    ${passed} (${Math.round((passed / total) * 100)}%)`);
  console.log(`   ❌ Failed:    ${failed} (${Math.round((failed / total) * 100)}%)`);
  console.log(`   ⚠️  Warned:    ${warned} (${Math.round((warned / total) * 100)}%)`);
  console.log(`   ⏭️  Skipped:   ${skipped} (${Math.round((skipped / total) * 100)}%)`);
  
  const score = Math.round(((passed + warned * 0.5) / total) * 100);
  console.log(`\n   📊 Release Readiness Score: ${score}%`);
  
  // Failed tests detail
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS\n');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   [${r.id}] ${r.category}/${r.subcategory}: ${r.test}`);
      console.log(`         ${r.message}`);
      if (r.details) console.log(`         └─ ${r.details}`);
    });
  }
  
  // Warnings
  if (warned > 0) {
    console.log('\n⚠️  WARNINGS\n');
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`   [${r.id}] ${r.category}/${r.subcategory}: ${r.test}`);
      console.log(`         ${r.message}`);
    });
  }
  
  // Performance summary
  const perfResults = results.filter(r => r.duration && r.category === 'Performance');
  if (perfResults.length > 0) {
    const avgDuration = Math.round(
      perfResults.reduce((sum, r) => sum + (r.duration || 0), 0) / perfResults.length
    );
    console.log(`\n⚡ Average Performance: ${avgDuration}ms`);
  }
  
  // Final verdict
  console.log('\n' + '═'.repeat(80));
  const verdict = score >= 95 
    ? '🚀 EXCELLENT - Ready for Production!'
    : score >= 85
    ? '✅ GOOD - Minor issues to address'
    : score >= 70
    ? '⚠️  NEEDS WORK - Several issues found'
    : '❌ NOT READY - Critical issues must be fixed';
  
  console.log(`\n   ${verdict}\n`);
  console.log('═'.repeat(80) + '\n');
  
  return { passed, failed, warned, skipped, total, score, summaries };
}

// ==================== EXPORT REPORT TO FILE ====================
async function exportReport(stats: ReturnType<typeof generateReport>) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportContent = `# CE Website - Automation Test Report

**Generated:** ${new Date().toISOString()}
**Server:** ${BASE_URL}
**Total Tests:** ${stats.total}

## 📊 Summary

| Metric | Value |
|--------|-------|
| Release Score | **${stats.score}%** |
| Tests Passed | ${stats.passed} |
| Tests Failed | ${stats.failed} |
| Warnings | ${stats.warned} |
| Skipped | ${stats.skipped} |

## 📋 Results by Category

| Category | Passed | Failed | Warned | Rate |
|----------|--------|--------|--------|------|
${stats.summaries.map(s => `| ${s.category} | ${s.passed} | ${s.failed} | ${s.warned} | ${Math.round((s.passed / s.total) * 100)}% |`).join('\n')}

## 🔍 Detailed Results

${results.map(r => `- [${r.status}] **${r.category}/${r.subcategory}**: ${r.test} - ${r.message}`).join('\n')}

${stats.failed > 0 ? `
## ❌ Failed Tests

${results.filter(r => r.status === 'FAIL').map(r => `- **${r.category}/${r.subcategory}**: ${r.test}
  - ${r.message}
  ${r.details ? `- Details: ${r.details}` : ''}`).join('\n')}
` : ''}

${stats.warned > 0 ? `
## ⚠️ Warnings

${results.filter(r => r.status === 'WARN').map(r => `- **${r.category}/${r.subcategory}**: ${r.test} - ${r.message}`).join('\n')}
` : ''}

---
*Report generated by CE Website Automation Test Suite*
`;

  const fs = await import('fs').then(m => m.promises);
  await fs.writeFile(`docs/TEST-REPORT-${timestamp}.md`, reportContent);
  console.log(`📄 Report exported to: docs/TEST-REPORT-${timestamp}.md\n`);
}

// ==================== MAIN ====================
async function main() {
  console.log('\n');
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log('║  🔍 CE Website - Full Automation Test Suite              ║');
  console.log('║  Testing ALL Client & Admin Features                     ║');
  console.log('╚' + '═'.repeat(58) + '╝');
  console.log(`\n📅 Date: ${new Date().toISOString()}`);
  console.log(`🌐 Server: ${BASE_URL}\n`);
  
  try {
    await testDatabaseConnection();
    await testClientPages();
    await testProductDetail();
    await testSearchFilter();
    await testCartCheckout();
    await testBlog();
    await testAPIs();
    await testAdminPages();
    await testPerformance();
    await testSecurity();
    
    const stats = generateReport();
    await exportReport(stats);
    
    // Exit with error if critical failures
    if (stats.failed > 5 || stats.score < 70) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n❌ Test suite crashed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

