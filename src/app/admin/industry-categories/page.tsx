import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil } from 'lucide-react';

async function getIndustryCategories() {
  return prisma.industryCategory.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { _count: { select: { products: true } } },
  });
}

export default async function AdminIndustryCategoriesPage() {
  const locale = await getLocale();
  const isVi = locale.toLowerCase().startsWith('vi');
  const categories = await getIndustryCategories();

  async function toggleActive(id: string, next: boolean) {
    'use server';
    await prisma.industryCategory.update({ where: { id }, data: { isActive: next } });
    revalidatePath('/admin/industry-categories');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heavy">
            {isVi ? 'Danh mục Industries' : 'Industry Categories'}
          </h1>
          <p className="text-muted-foreground">
            {isVi
              ? 'Quản lý 13 hạng mục industries (thêm/sửa/xoá/bật tắt, sắp xếp).'
              : 'Manage industry categories (add/edit/delete/activate, ordering).'}
          </p>
        </div>
        <Button variant="ce" asChild>
          <Link href="/admin/industry-categories/new">
            <Plus className="mr-2 h-4 w-4" />
            {isVi ? 'Tạo mới' : 'New category'}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isVi ? 'Danh sách' : 'List'}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {isVi ? `Tổng: ${categories.length}` : `Total: ${categories.length}`}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isVi ? 'Slug' : 'Slug'}</TableHead>
                <TableHead>{isVi ? 'Tên (EN)' : 'Name (EN)'}</TableHead>
                <TableHead>{isVi ? 'Tên (VI)' : 'Name (VI)'}</TableHead>
                <TableHead className="w-[90px] text-right">{isVi ? 'Thứ tự' : 'Order'}</TableHead>
                <TableHead className="w-[120px]">{isVi ? 'Trạng thái' : 'Status'}</TableHead>
                <TableHead className="w-[120px] text-right">
                  {isVi ? 'Sản phẩm' : 'Products'}
                </TableHead>
                <TableHead className="w-[220px] text-right">
                  {isVi ? 'Hành động' : 'Actions'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.slug}</TableCell>
                  <TableCell className="font-medium">{c.nameEn}</TableCell>
                  <TableCell className="font-medium">{c.nameVi}</TableCell>
                  <TableCell className="text-right">{c.order}</TableCell>
                  <TableCell>
                    {c.isActive ? (
                      <Badge variant="ce">{isVi ? 'Bật' : 'Active'}</Badge>
                    ) : (
                      <Badge variant="outline">{isVi ? 'Tắt' : 'Inactive'}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{c._count.products}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/industry-categories/${c.id}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {isVi ? 'Sửa' : 'Edit'}
                        </Link>
                      </Button>
                      <form action={toggleActive.bind(null, c.id, !c.isActive)}>
                        <Button size="sm" variant="ce" type="submit">
                          {c.isActive ? (isVi ? 'Tắt' : 'Disable') : isVi ? 'Bật' : 'Enable'}
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    {isVi ? 'Chưa có danh mục nào.' : 'No categories yet.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
