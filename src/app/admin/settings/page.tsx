import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

async function getSettings() {
  return prisma.setting.findMany({
    orderBy: [{ group: 'asc' }, { key: 'asc' }],
  });
}

export default async function AdminSettingsPage() {
  const t = await getTranslations('admin');
  const settings = await getSettings();

  async function upsertSetting(formData: FormData) {
    'use server';
    const key = String(formData.get('key') || '').trim();
    const value = String(formData.get('value') || '');
    const type = String(formData.get('type') || 'string').trim();
    const group = String(formData.get('group') || 'general').trim();
    if (!key) return;
    await prisma.setting.upsert({
      where: { key },
      update: { value, type, group },
      create: { key, value, type, group },
    });
    revalidatePath('/admin/settings');
  }

  async function deleteSetting(formData: FormData) {
    'use server';
    const key = String(formData.get('key') || '').trim();
    if (!key) return;
    await prisma.setting.delete({ where: { key } });
    revalidatePath('/admin/settings');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heavy">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.upsertTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertSetting} className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="key">{t('settings.fields.key')}</Label>
              <Input id="key" name="key" placeholder={t('settings.placeholders.key')} required />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="group">{t('settings.fields.group')}</Label>
              <Input
                id="group"
                name="group"
                placeholder={t('settings.placeholders.group')}
                defaultValue="general"
              />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="type">{t('settings.fields.type')}</Label>
              <Input
                id="type"
                name="type"
                placeholder={t('settings.placeholders.type')}
                defaultValue="string"
              />
            </div>
            <div className="space-y-2 md:col-span-4">
              <Label htmlFor="value">{t('settings.fields.value')}</Label>
              <textarea
                id="value"
                name="value"
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ce-primary/30"
                placeholder={t('settings.placeholders.value')}
              />
            </div>
            <div className="md:col-span-4">
              <Button variant="ce" type="submit">
                {t('settings.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('settings.allTitle')}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {t('settings.items', { count: String(settings.length) })}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((s) => (
            <div key={s.key} className="rounded-xl border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{s.key}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.group} • {s.type}
                  </div>
                </div>
                <form action={deleteSetting}>
                  <input type="hidden" name="key" value={s.key} />
                  <Button variant="outline" size="sm" type="submit">
                    {t('settings.delete')}
                  </Button>
                </form>
              </div>
              <Separator className="my-3" />
              <form action={upsertSetting} className="space-y-3">
                <input type="hidden" name="key" value={s.key} />
                <input type="hidden" name="group" value={s.group} />
                <input type="hidden" name="type" value={s.type} />
                <textarea
                  name="value"
                  rows={3}
                  defaultValue={s.value}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ce-primary/30"
                />
                <Button variant="ce" size="sm" type="submit">
                  {t('settings.update')}
                </Button>
              </form>
            </div>
          ))}
          {settings.length === 0 && (
            <div className="py-10 text-center text-muted-foreground">{t('settings.empty')}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
