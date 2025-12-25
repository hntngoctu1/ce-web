import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { auth } from '@/lib/auth';

interface Props {
  params: Promise<{ id: string }>;
}

async function getCategory(id: string) {
  if (id === 'new') return null;
  return prisma.industryCategory.findUnique({ where: { id } });
}

export default async function AdminIndustryCategoryEditPage({ params }: Props) {
  const { id } = await params;
  const locale = await getLocale();
  const isVi = locale.toLowerCase().startsWith('vi');

  const category = await getCategory(id);
  if (id !== 'new' && !category) notFound();

  async function save(formData: FormData) {
    'use server';
    const isNew = id === 'new';

    const slug = String(formData.get('slug') || '').trim();
    const nameEn = String(formData.get('nameEn') || '').trim();
    const nameVi = String(formData.get('nameVi') || '').trim();
    const descriptionEn = String(formData.get('descriptionEn') || '').trim() || null;
    const descriptionVi = String(formData.get('descriptionVi') || '').trim() || null;
    const imageUrl = String(formData.get('imageUrl') || '').trim() || null;
    const order = Number(formData.get('order') || 0) || 0;
    const isActive = formData.get('isActive') === 'on';

    if (!slug || !nameEn || !nameVi) return;

    if (isNew) {
      const created = await prisma.industryCategory.create({
        data: { slug, nameEn, nameVi, descriptionEn, descriptionVi, imageUrl, order, isActive },
      });
      redirect(`/admin/industry-categories/${created.id}`);
    } else {
      await prisma.industryCategory.update({
        where: { id },
        data: { slug, nameEn, nameVi, descriptionEn, descriptionVi, imageUrl, order, isActive },
      });
      redirect(`/admin/industry-categories/${id}`);
    }
  }

  async function remove() {
    'use server';
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') return;
    if (id === 'new') return;
    await prisma.industryCategory.delete({ where: { id } });
    redirect('/admin/industry-categories');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" asChild>
          <Link href="/admin/industry-categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isVi ? 'Quay lại' : 'Back'}
          </Link>
        </Button>

        {id !== 'new' && (
          <form action={remove}>
            <Button variant="destructive" type="submit">
              <Trash2 className="mr-2 h-4 w-4" />
              {isVi ? 'Xoá' : 'Delete'}
            </Button>
          </form>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-heavy">
          {category
            ? isVi
              ? 'Chỉnh sửa danh mục'
              : 'Edit category'
            : isVi
              ? 'Tạo danh mục mới'
              : 'New category'}
        </h1>
        <p className="text-muted-foreground">
          {isVi
            ? 'Dùng slug dạng kebab-case, ví dụ: industrial-tapes.'
            : 'Use kebab-case slug, e.g. industrial-tapes.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isVi ? 'Thông tin' : 'Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={save} className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={category?.slug || ''} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">{isVi ? 'Thứ tự' : 'Order'}</Label>
              <Input id="order" name="order" type="number" defaultValue={category?.order ?? 0} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameEn">{isVi ? 'Tên (EN)' : 'Name (EN)'}</Label>
              <Input id="nameEn" name="nameEn" defaultValue={category?.nameEn || ''} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameVi">{isVi ? 'Tên (VI)' : 'Name (VI)'}</Label>
              <Input id="nameVi" name="nameVi" defaultValue={category?.nameVi || ''} required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="imageUrl">{isVi ? 'Ảnh/Icon (URL)' : 'Image/Icon (URL)'}</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                defaultValue={category?.imageUrl || ''}
                placeholder="/groups/xxx.svg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionEn">{isVi ? 'Mô tả (EN)' : 'Description (EN)'}</Label>
              <textarea
                id="descriptionEn"
                name="descriptionEn"
                rows={4}
                defaultValue={category?.descriptionEn || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ce-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionVi">{isVi ? 'Mô tả (VI)' : 'Description (VI)'}</Label>
              <textarea
                id="descriptionVi"
                name="descriptionVi"
                rows={4}
                defaultValue={category?.descriptionVi || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ce-primary/30"
              />
            </div>

            <div className="flex items-center justify-between gap-4 md:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={category?.isActive ?? true}
                />
                {isVi ? 'Đang hiển thị' : 'Active'}
              </label>
              <Button variant="ce" type="submit">
                {isVi ? 'Lưu' : 'Save'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
