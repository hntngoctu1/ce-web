import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

interface AdminProductGroupEditProps {
  params: Promise<{ id: string }>;
}

async function getGroup(id: string) {
  if (id === 'new') return null;
  return prisma.productGroup.findUnique({ where: { id } });
}

export default async function AdminProductGroupEditPage({ params }: AdminProductGroupEditProps) {
  const t = await getTranslations('admin');
  const { id } = await params;
  const group = await getGroup(id);
  if (id !== 'new' && !group) notFound();

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
      const created = await prisma.productGroup.create({
        data: { slug, nameEn, nameVi, descriptionEn, descriptionVi, imageUrl, order, isActive },
      });
      redirect(`/admin/product-groups/${created.id}`);
    } else {
      await prisma.productGroup.update({
        where: { id },
        data: { slug, nameEn, nameVi, descriptionEn, descriptionVi, imageUrl, order, isActive },
      });
      redirect(`/admin/product-groups/${id}`);
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/admin/product-groups">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('productGroups.editPage.back')}
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-heavy">
          {group ? t('productGroups.editPage.editTitle') : t('productGroups.editPage.newTitle')}
        </h1>
        <p className="text-muted-foreground">
          {group
            ? t('productGroups.editPage.editing', { name: group.nameEn })
            : t('productGroups.editPage.createDesc')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('productGroups.editPage.detailsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={save} className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">{t('productGroups.editPage.slug')}</Label>
              <Input id="slug" name="slug" defaultValue={group?.slug || ''} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">{t('productGroups.editPage.order')}</Label>
              <Input id="order" name="order" type="number" defaultValue={group?.order ?? 0} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameEn">{t('productGroups.editPage.nameEn')}</Label>
              <Input id="nameEn" name="nameEn" defaultValue={group?.nameEn || ''} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameVi">{t('productGroups.editPage.nameVi')}</Label>
              <Input id="nameVi" name="nameVi" defaultValue={group?.nameVi || ''} required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="imageUrl">{t('productGroups.editPage.imageUrl')}</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                defaultValue={group?.imageUrl || ''}
                placeholder="/groups/xxx.svg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionEn">{t('productGroups.editPage.descEn')}</Label>
              <textarea
                id="descriptionEn"
                name="descriptionEn"
                rows={4}
                defaultValue={group?.descriptionEn || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ce-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionVi">{t('productGroups.editPage.descVi')}</Label>
              <textarea
                id="descriptionVi"
                name="descriptionVi"
                rows={4}
                defaultValue={group?.descriptionVi || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ce-primary/30"
              />
            </div>

            <div className="flex items-center justify-between gap-4 md:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isActive" defaultChecked={group?.isActive ?? true} />
                {t('productGroups.editPage.active')}
              </label>
              <Button variant="ce" type="submit">
                {t('productGroups.editPage.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
