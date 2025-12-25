import Link from 'next/link';
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
import { CheckCircle2, Circle, Mail, RefreshCcw } from 'lucide-react';

async function getMessages() {
  const [items, unread] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);
  return { items, unread };
}

export default async function AdminContactsPage() {
  const t = await getTranslations('admin');
  const { items, unread } = await getMessages();

  async function markRead(id: string, isRead: boolean) {
    'use server';
    await prisma.contactMessage.update({ where: { id }, data: { isRead } });
    revalidatePath('/admin/contacts');
  }

  async function markReplied(id: string, isReplied: boolean) {
    'use server';
    await prisma.contactMessage.update({
      where: { id },
      data: { isReplied, repliedAt: isReplied ? new Date() : null },
    });
    revalidatePath('/admin/contacts');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heavy">{t('contacts.title')}</h1>
          <p className="text-muted-foreground">
            {unread > 0 ? (
              <>
                {(() => {
                  const marker = '__COUNT__';
                  const msg = t('contacts.unreadInfo', { count: marker });
                  const [a, b] = msg.split(marker);
                  return (
                    <>
                      {a}
                      <span className="font-semibold text-ce-primary">{unread}</span>
                      {b}
                    </>
                  );
                })()}
              </>
            ) : (
              t('contacts.allRead')
            )}
          </p>
        </div>

        <Button variant="ce-outline" asChild>
          <Link href="/admin/contacts">
            <RefreshCcw className="mr-2 h-4 w-4" />
            {t('contacts.refresh')}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-ce-primary" />
            {t('contacts.inbox')}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {t('contacts.latest', { count: String(items.length) })}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">{t('contacts.table.status')}</TableHead>
                <TableHead>{t('contacts.table.from')}</TableHead>
                <TableHead>{t('contacts.table.message')}</TableHead>
                <TableHead className="w-[170px]">{t('contacts.table.created')}</TableHead>
                <TableHead className="w-[220px] text-right">
                  {t('contacts.table.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {m.isRead ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-3 w-3 fill-ce-primary text-ce-primary" />
                      )}
                      {m.isReplied ? (
                        <Badge variant="secondary">{t('contacts.replied')}</Badge>
                      ) : (
                        <Badge variant="outline">{t('contacts.new')}</Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                    {(m.company || m.phone) && (
                      <div className="text-xs text-muted-foreground">
                        {[m.company, m.phone].filter(Boolean).join(' • ')}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <Link href={`/admin/contacts/${m.id}`} className="block hover:underline">
                      <div className="line-clamp-2 text-sm text-muted-foreground">{m.message}</div>
                    </Link>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(m.createdAt).toLocaleString()}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <form action={markRead.bind(null, m.id, !m.isRead)}>
                        <Button size="sm" variant="outline" type="submit">
                          {m.isRead ? t('contacts.markUnread') : t('contacts.markRead')}
                        </Button>
                      </form>
                      <form action={markReplied.bind(null, m.id, !m.isReplied)}>
                        <Button size="sm" variant="ce" type="submit">
                          {m.isReplied ? t('contacts.unmarkReplied') : t('contacts.markReplied')}
                        </Button>
                      </form>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/contacts/${m.id}`}>{t('contacts.open')}</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    {t('contacts.empty')}
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
