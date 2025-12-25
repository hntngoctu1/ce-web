import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle2, Circle, Mail, Phone, Building2, Clock } from 'lucide-react';

interface AdminContactDetailProps {
  params: Promise<{ id: string }>;
}

export default async function AdminContactDetailPage({ params }: AdminContactDetailProps) {
  const t = await getTranslations('admin');
  const { id } = await params;

  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) notFound();

  // Auto-mark read when opened
  if (!message.isRead) {
    await prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
    revalidatePath('/admin/contacts');
  }

  async function toggleReplied(next: boolean) {
    'use server';
    await prisma.contactMessage.update({
      where: { id },
      data: { isReplied: next, repliedAt: next ? new Date() : null },
    });
    revalidatePath('/admin/contacts');
    revalidatePath(`/admin/contacts/${id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" asChild>
          <Link href="/admin/contacts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('contacts.detail.back')}
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {message.isRead ? (
            <div className="inline-flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" /> {t('contacts.detail.read')}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-sm text-ce-primary">
              <Circle className="h-3 w-3 fill-ce-primary text-ce-primary" />{' '}
              {t('contacts.detail.unread')}
            </div>
          )}
          {message.isReplied ? (
            <Badge variant="secondary">{t('contacts.replied')}</Badge>
          ) : (
            <Badge variant="outline">{t('contacts.new')}</Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {message.subject || t('contacts.detail.contactMessage')}
          </CardTitle>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {message.email}
            </span>
            {message.phone && (
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {message.phone}
              </span>
            )}
            {message.company && (
              <span className="inline-flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {message.company}
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {new Date(message.createdAt).toLocaleString()}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border bg-ce-neutral-20 p-4">
            <div className="text-sm font-medium text-ce-primary-900">{message.name}</div>
            <Separator className="my-3" />
            <div className="whitespace-pre-wrap text-sm text-foreground">{message.message}</div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a className="inline-flex" href={`mailto:${message.email}`}>
              <Button variant="ce">{t('contacts.detail.replyViaEmail')}</Button>
            </a>
            <form action={toggleReplied.bind(null, !message.isReplied)}>
              <Button variant="outline" type="submit">
                {message.isReplied ? t('contacts.unmarkReplied') : t('contacts.markReplied')}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
