import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { getProductImageFallback } from '@/lib/placeholders';
import { ProductDetailLayout } from '@/components/product/product-detail-layout';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { order: 'asc' } },
      specs: { orderBy: { order: 'asc' } },
      group: true,
      brand: true,
      industry: true,
    },
  });

  if (!product) return null;

  // Get related products from same group
  const relatedProducts = product.groupId
    ? await prisma.product.findMany({
        where: {
          groupId: product.groupId,
          isActive: true,
          id: { not: product.id },
        },
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
        },
        take: 4,
      })
    : [];

  return { product, relatedProducts };
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProduct(slug);

  if (!data) {
    return {
      title: 'Product Not Found',
    };
  }

  const { product } = data;

  return {
    title: `${product.nameEn} - Creative Engineering`,
    description: product.shortDescEn || product.descriptionEn?.slice(0, 160),
    openGraph: {
      title: product.nameEn,
      description: product.shortDescEn || undefined,
      images: [product.images[0]?.url || getProductImageFallback(product.slug)],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const locale = await getLocale();
  const { slug } = await params;
  const data = await getProduct(slug);

  if (!data) {
    notFound();
  }

  const { product, relatedProducts } = data;
  return (
    <ProductDetailLayout locale={locale} product={product} relatedProducts={relatedProducts} />
  );
}
