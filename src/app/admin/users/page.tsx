import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
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

async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
    take: 200,
  });
}

export default async function AdminUsersPage() {
  const t = await getTranslations('admin');
  const users = await getUsers();

  async function updateRole(formData: FormData) {
    'use server';
    const id = String(formData.get('id') || '');
    const role = String(formData.get('role') || '');
    if (!id || !role) return;
    if (!['ADMIN', 'EDITOR', 'CUSTOMER'].includes(role)) return;
    await prisma.user.update({ where: { id }, data: { role: role as any } });
    revalidatePath('/admin/users');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heavy">{t('users.title')}</h1>
          <p className="text-muted-foreground">{t('users.subtitle')}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('users.listTitle')}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {t('users.count', { count: String(users.length) })}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('users.table.name')}</TableHead>
                <TableHead>{t('users.table.email')}</TableHead>
                <TableHead className="w-[140px]">{t('users.table.role')}</TableHead>
                <TableHead className="w-[170px]">{t('users.table.created')}</TableHead>
                <TableHead className="w-[220px] text-right">{t('users.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">{u.name || '—'}</div>
                    {u.phone && <div className="text-xs text-muted-foreground">{u.phone}</div>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        u.role === 'ADMIN' ? 'ce' : u.role === 'EDITOR' ? 'secondary' : 'outline'
                      }
                    >
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <form
                      action={updateRole}
                      className="inline-flex items-center justify-end gap-2"
                    >
                      <input type="hidden" name="id" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      >
                        <option value="CUSTOMER">{t('users.roleLabels.CUSTOMER')}</option>
                        <option value="EDITOR">{t('users.roleLabels.EDITOR')}</option>
                        <option value="ADMIN">{t('users.roleLabels.ADMIN')}</option>
                      </select>
                      <Button size="sm" variant="ce" type="submit">
                        {t('users.save')}
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    {t('users.empty')}
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
