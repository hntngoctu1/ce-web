'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, Send, CheckCircle, PhoneCall, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type ProductInquiryCardProps = {
  productName: string;
  productSlug: string;
  className?: string;
  showDirectContact?: boolean;
  submitVariant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'ce'
    | 'ce-outline'
    | 'ce-ghost';
  submitSize?: 'default' | 'sm' | 'lg' | 'xl' | 'icon';
};

type FormData = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
};

export function ProductInquiryCard({
  productName,
  productSlug,
  className,
  showDirectContact = true,
  submitVariant = 'ce',
  submitSize = 'xl',
}: ProductInquiryCardProps) {
  const locale = useLocale();
  const t = useTranslations('productInquiry');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('validation.nameMin')),
        email: z.string().email(t('validation.invalidEmail')),
        phone: z.string().optional(),
        company: z.string().optional(),
        message: z.string().min(10, t('validation.messageMin')),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: t('defaultMessage', { productName, productSlug }),
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed');

      setIsSuccess(true);
      reset();
    } catch {
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className={cn('rounded-2xl border bg-white shadow-sm', className)}>
      <div className="border-b p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-ce-primary">
          {t('badge')}
        </div>
        <div className="mt-2 text-lg font-bold text-ce-primary-900">{t('title')}</div>
        <p className="mt-2 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="p-5">
        {isSuccess ? (
          <div className="rounded-xl border bg-green-50 p-4 text-center">
            <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
            <div className="font-semibold text-green-800">{t('successTitle')}</div>
            <div className="mt-1 text-sm text-green-700">{t('successSubtitle')}</div>
            <Button variant="outline" className="mt-3" onClick={() => setIsSuccess(false)}>
              {t('successAnother')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="inq-name">{t('fields.name')} *</Label>
              <Input id="inq-name" {...register('name')} disabled={isLoading} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inq-email">{t('fields.email')} *</Label>
              <Input id="inq-email" type="email" {...register('email')} disabled={isLoading} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="inq-phone">{t('fields.phone')}</Label>
                <Input id="inq-phone" {...register('phone')} disabled={isLoading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inq-company">{t('fields.company')}</Label>
                <Input id="inq-company" {...register('company')} disabled={isLoading} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inq-message">{t('fields.message')} *</Label>
              <textarea
                id="inq-message"
                rows={5}
                className={cn(
                  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-ce-primary/30'
                )}
                {...register('message')}
                disabled={isLoading}
              />
              {errors.message && (
                <p className="text-sm text-destructive">{errors.message.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant={submitVariant}
              className="w-full"
              size={submitSize}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('actions.submitting')}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {t('actions.submit')}
                </>
              )}
            </Button>

            {showDirectContact ? (
              <div className="pt-2 text-xs text-muted-foreground">
                {t('actions.orContact')}
                <div className="mt-2 flex flex-col gap-2">
                  <a
                    className="inline-flex items-center gap-2 text-ce-primary hover:underline"
                    href="tel:+842812345678"
                  >
                    <PhoneCall className="h-4 w-4" />
                    +84 28 1234 5678
                  </a>
                  <a
                    className="inline-flex items-center gap-2 text-ce-primary hover:underline"
                    href="mailto:sales@ce.com.vn"
                  >
                    <Mail className="h-4 w-4" />
                    sales@ce.com.vn
                  </a>
                  <Link className="text-ce-primary hover:underline" href="/contact">
                    {t('actions.goContact')}
                  </Link>
                </div>
              </div>
            ) : null}
          </form>
        )}
      </div>
    </aside>
  );
}
