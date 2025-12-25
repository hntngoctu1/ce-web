import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';

export const getProductListOptionsCached = unstable_cache(
  async () => {
    const [groups, industries, brands, priceStats] = await Promise.all([
      prisma.productGroup.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: { id: true, slug: true, nameEn: true, nameVi: true },
      }),
      prisma.industryCategory.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: { id: true, slug: true, nameEn: true, nameVi: true },
      }),
      prisma.partner.findMany({
        where: { isActive: true, isBrand: true },
        orderBy: { order: 'asc' },
        select: { id: true, name: true },
      }),
      prisma.product.aggregate({
        _min: { price: true },
        _max: { price: true },
        where: { isActive: true },
      }),
    ]);

    return {
      groups,
      industries,
      brands,
      priceRange: {
        min: Math.floor(priceStats._min.price || 0),
        max: Math.ceil(priceStats._max.price || 1000000),
      },
    };
  },
  ['ce-plp-options-v1'],
  { revalidate: 300 }
);
