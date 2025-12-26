/**
 * CE Website - Final Verification
 * Complete end-to-end test of all critical paths
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

interface TestResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details?: string;
}

const results: TestResult[] = [];

function log(r: TestResult) {
  const icon = { PASS: '✅', FAIL: '❌', WARN: '⚠️' }[r.status];
  console.log(`${icon} [${r.category}] ${r.test}`);
  if (r.details) console.log(`   └─ ${r.details}`);
  results.push(r);
}

async function fetchPage(path: string) {
  try {
    const res = await fetch(`${BASE_URL}${path}`);
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🔍 CE Website - FINAL VERIFICATION                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // ===== DATABASE =====
  console.log('📊 DATABASE\n');
  
  const productCount = await prisma.product.count({ where: { isActive: true } });
  log({ category: 'DB', test: 'Products exist', status: productCount >= 30 ? 'PASS' : 'WARN', details: `${productCount} products` });

  const orderCount = await prisma.order.count();
  log({ category: 'DB', test: 'Orders table accessible', status: 'PASS', details: `${orderCount} orders` });

  const userCount = await prisma.user.count();
  log({ category: 'DB', test: 'Users exist', status: userCount >= 3 ? 'PASS' : 'WARN', details: `${userCount} users` });

  const blogCount = await prisma.blogPost.count({ where: { status: 'PUBLISHED' } });
  log({ category: 'DB', test: 'Published blog posts', status: blogCount > 0 ? 'PASS' : 'WARN', details: `${blogCount} posts` });

  // ===== CLIENT PAGES =====
  console.log('\n🌐 CLIENT PAGES\n');

  const clientPages = [
    '/en', '/vi', '/en/menu/product', '/en/cart', '/en/checkout',
    '/en/blog', '/en/contact', '/en/industries', '/en/case-studies',
    '/en/login', '/en/register', '/en/envision', '/en/engage', '/en/entrench'
  ];

  for (const page of clientPages) {
    const res = await fetchPage(page);
    log({ category: 'Client', test: page, status: res.ok ? 'PASS' : 'FAIL', details: `HTTP ${res.status}` });
  }

  // ===== PROTECTED PAGES =====
  console.log('\n🔐 PROTECTED PAGES\n');

  const protectedPages = ['/en/dashboard', '/en/dashboard/orders', '/en/dashboard/profile'];
  for (const page of protectedPages) {
    const res = await fetchPage(page);
    // Should redirect or show login
    log({ category: 'Protected', test: page, status: res.status === 200 || res.status === 307 || res.status === 302 ? 'PASS' : 'FAIL', details: `HTTP ${res.status}` });
  }

  // ===== ADMIN PAGES =====
  console.log('\n🔧 ADMIN PAGES\n');

  const adminPages = [
    '/en/admin', '/en/admin/products', '/en/admin/orders', '/en/admin/users',
    '/en/admin/blog', '/en/admin/contacts', '/en/admin/warehouse', '/en/admin/settings'
  ];

  for (const page of adminPages) {
    const res = await fetchPage(page);
    log({ category: 'Admin', test: page, status: res.ok || res.status === 307 ? 'PASS' : 'FAIL', details: `HTTP ${res.status}` });
  }

  // ===== PRODUCT PAGES =====
  console.log('\n🛍️ PRODUCT PAGES\n');

  const products = await prisma.product.findMany({ where: { isActive: true }, take: 3, select: { slug: true } });
  for (const product of products) {
    const res = await fetchPage(`/en/product/${product.slug}`);
    log({ category: 'Product', test: product.slug, status: res.ok ? 'PASS' : 'FAIL', details: `HTTP ${res.status}` });
  }

  // ===== SEARCH & FILTER =====
  console.log('\n🔍 SEARCH & FILTER\n');

  const searchRes = await fetchPage('/en/menu/product?q=tesa');
  log({ category: 'Search', test: 'Search query', status: searchRes.ok ? 'PASS' : 'FAIL' });

  const filterRes = await fetchPage('/en/menu/product?groups=industrial-tapes');
  log({ category: 'Search', test: 'Filter by group', status: filterRes.ok ? 'PASS' : 'FAIL' });

  const sortRes = await fetchPage('/en/menu/product?sort=price-asc');
  log({ category: 'Search', test: 'Sort products', status: sortRes.ok ? 'PASS' : 'FAIL' });

  // ===== API ENDPOINTS =====
  console.log('\n🔌 API ENDPOINTS\n');

  const productsAPI = await fetch(`${BASE_URL}/api/products`);
  log({ category: 'API', test: '/api/products', status: productsAPI.ok ? 'PASS' : 'FAIL' });

  const contactAPI = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email: 'test@test.com', phone: '0901234567', company: 'Test', subject: 'Test', message: 'Test' })
  });
  log({ category: 'API', test: '/api/contact (POST)', status: contactAPI.ok || contactAPI.status === 201 ? 'PASS' : 'WARN' });

  // ===== BLOG POSTS =====
  console.log('\n📝 BLOG POSTS\n');

  const posts = await prisma.blogPost.findMany({ where: { status: 'PUBLISHED' }, take: 2, select: { slug: true } });
  for (const post of posts) {
    const res = await fetchPage(`/en/blog/${post.slug}`);
    log({ category: 'Blog', test: post.slug, status: res.ok ? 'PASS' : 'FAIL', details: `HTTP ${res.status}` });
  }

  // ===== SUMMARY =====
  console.log('\n');
  console.log('═'.repeat(60));
  console.log('📋 FINAL VERIFICATION SUMMARY');
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
      console.log(`   • [${r.category}] ${r.test}: ${r.details || ''}`);
    });
  }

  console.log('\n' + '═'.repeat(60));
  if (failed === 0 && score >= 90) {
    console.log('🚀 ALL CRITICAL PATHS WORKING - READY FOR PRODUCTION!');
  } else if (failed <= 2) {
    console.log('⚠️  MINOR ISSUES - REVIEW BEFORE RELEASE');
  } else {
    console.log('❌ CRITICAL ISSUES - NOT READY FOR PRODUCTION');
  }
  console.log('═'.repeat(60) + '\n');

  await prisma.$disconnect();
}

main().catch(console.error);

