'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

type ContactFormData = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
};

export function ContactForm() {
  const t = useTranslations('contact');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contactSchema = useMemo(
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
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setIsSuccess(true);
      reset();
    } catch (err) {
      setError(t('validation.sendFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-lg border bg-green-50 p-8 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
        <h3 className="mb-2 text-lg font-bold text-green-700">{t('form.successTitle')}</h3>
        <p className="text-green-600">{t('form.successMessage')}</p>
        <Button variant="outline" className="mt-4" onClick={() => setIsSuccess(false)}>
          {t('form.sendAnother')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{t('form.name')} *</Label>
          <Input
            id="name"
            {...register('name')}
            disabled={isLoading}
            placeholder={t('placeholders.name')}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('form.email')} *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            disabled={isLoading}
            placeholder={t('placeholders.email')}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">{t('form.phone')}</Label>
          <Input
            id="phone"
            {...register('phone')}
            disabled={isLoading}
            placeholder={t('placeholders.phone')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">{t('form.company')}</Label>
          <Input
            id="company"
            {...register('company')}
            disabled={isLoading}
            placeholder={t('placeholders.company')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{t('form.message')} *</Label>
        <textarea
          id="message"
          {...register('message')}
          disabled={isLoading}
          rows={5}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder={t('placeholders.message')}
        />
        {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
      </div>

      <Button type="submit" variant="ce" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('form.sending')}
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            {t('form.submit')}
          </>
        )}
      </Button>
    </form>
  );
}
