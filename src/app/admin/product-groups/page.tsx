import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
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

async function getGroups() {
  const groups = await prisma.productGroup.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: {
      _count: { select: { products: true } },
    },
  });
  return groups;
}

export default async function AdminProductGroupsPage() {
  const t = await getTranslations('admin');
  const groups = await getGroups();

  async function toggleActive(id: string, next: boolean) {
    'use server';
    await prisma.productGroup.update({ where: { id }, data: { isActive: next } });
    revalidatePath('/admin/product-groups');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heavy">{t('productGroups.title')}</h1>
          <p className="text-muted-foreground">{t('productGroups.subtitle')}</p>
        </div>
        <Button variant="ce" asChild>
          <Link href="/admin/product-groups/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('productGroups.newGroup')}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('productGroups.groupsTitle')}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {t('productGroups.count', { count: String(groups.length) })}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('productGroups.table.slug')}</TableHead>
                <TableHead>{t('productGroups.table.nameEn')}</TableHead>
                <TableHead>{t('productGroups.table.nameVi')}</TableHead>
                <TableHead className="w-[90px] text-right">
                  {t('productGroups.table.order')}
                </TableHead>
                <TableHead className="w-[120px]">{t('productGroups.table.status')}</TableHead>
                <TableHead className="w-[120px] text-right">
                  {t('productGroups.table.products')}
                </TableHead>
                <TableHead className="w-[220px] text-right">
                  {t('productGroups.table.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-mono text-xs">{g.slug}</TableCell>
                  <TableCell className="font-medium">{g.nameEn}</TableCell>
                  <TableCell className="font-medium">{g.nameVi}</TableCell>
                  <TableCell className="text-right">{g.order}</TableCell>
                  <TableCell>
                    {g.isActive ? (
                      <Badge variant="ce">{t('productGroups.active')}</Badge>
                    ) : (
                      <Badge variant="outline">{t('productGroups.inactive')}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{g._count.products}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/product-groups/${g.id}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t('productGroups.edit')}
                        </Link>
                      </Button>
                      <form action={toggleActive.bind(null, g.id, !g.isActive)}>
                        <Button size="sm" variant="ce" type="submit">
                          {g.isActive ? t('productGroups.disable') : t('productGroups.enable')}
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {groups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    {t('productGroups.empty')}
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
