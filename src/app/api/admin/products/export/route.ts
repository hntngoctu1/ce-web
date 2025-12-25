import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';

const SORT_MAP: Record<
  string,
  {
    orderBy: Record<string, 'asc' | 'desc'>;
  }
> = {
  createdDesc: { orderBy: { createdAt: 'desc' } },
  createdAsc: { orderBy: { createdAt: 'asc' } },
  priceDesc: { orderBy: { price: 'desc' } },
  priceAsc: { orderBy: { price: 'asc' } },
  nameAsc: { orderBy: { nameEn: 'asc' } },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get('q') ?? '';
  const status = searchParams.get('status') ?? '';
  const sortParam = searchParams.get('sort') ?? 'createdDesc';

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { nameEn: { contains: q, mode: 'insensitive' } },
      { nameVi: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (status) {
    switch (status) {
      case 'active':
        where.isActive = true;
        break;
      case 'inactive':
        where.isActive = false;
        break;
      case 'featured':
        where.isFeatured = true;
        break;
      case 'sale':
        where.isOnSale = true;
        break;
      case 'outofstock':
        where.stockQuantity = { lte: 0 };
        break;
      default:
        break;
    }
  }

  const sortKey = SORT_MAP[sortParam] ? sortParam : 'createdDesc';
  const orderBy = SORT_MAP[sortKey].orderBy;

  const products = await prisma.product.findMany({
    where,
    include: {
      group: { select: { nameEn: true } },
      brand: { select: { name: true } },
    },
    orderBy,
  });

  const headers = [
    'ID',
    'Name',
    'SKU',
    'Slug',
    'Group',
    'Brand',
    'Price',
    'SalePrice',
    'OnSale',
    'Active',
    'Featured',
    'StockQuantity',
    'CreatedAt',
    'UpdatedAt',
  ];

  const escape = (val: unknown) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = products.map((p) =>
    [
      p.id,
      p.nameEn,
      p.sku ?? '',
      p.slug,
      p.group?.nameEn ?? '',
      p.brand?.name ?? '',
      p.price,
      p.salePrice ?? '',
      p.isOnSale ? 'yes' : 'no',
      p.isActive ? 'yes' : 'no',
      p.isFeatured ? 'yes' : 'no',
      p.stockQuantity,
      p.createdAt.toISOString(),
      p.updatedAt.toISOString(),
    ]
      .map(escape)
      .join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="products.csv"',
    },
  });
}
