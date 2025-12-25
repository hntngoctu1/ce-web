import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { ProductForm } from '@/components/admin/product-form';

export const metadata: Metadata = {
  title: 'Edit Product - Admin - Creative Engineering',
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  if (id === 'new') return null;

  return prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: 'asc' } },
      specs: { orderBy: { order: 'asc' } },
    },
  });
}

async function getFormData() {
  const [groups, brands, industries] = await Promise.all([
    prisma.productGroup.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
    prisma.partner.findMany({
      where: { isActive: true, isBrand: true },
      orderBy: { name: 'asc' },
    }),
    prisma.industryCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
  ]);

  return { groups, brands, industries };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const t = await getTranslations('admin');
  const { id } = await params;
  const [product, formData] = await Promise.all([getProduct(id), getFormData()]);

  if (id !== 'new' && !product) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heavy">
          {product ? t('products.editPage.editTitle') : t('products.editPage.newTitle')}
        </h1>
        <p className="text-muted-foreground">
          {product
            ? t('products.editPage.editing', { name: product.nameEn })
            : t('products.editPage.createDesc')}
        </p>
      </div>

      <ProductForm
        product={product}
        groups={formData.groups}
        brands={formData.brands}
        industries={formData.industries}
      />
    </div>
  );
}
