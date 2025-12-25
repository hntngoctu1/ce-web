'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type RegisterFormData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  customerType: 'PERSONAL' | 'BUSINESS';
  companyName?: string;
  taxId?: string;
  companyEmail?: string;
};

export default function RegisterPage() {
  const locale = useLocale();
  const t = useTranslations('auth');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const registerSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().min(2, t('validation.nameMin')),
          email: z.string().email(t('validation.invalidEmail')),
          phone: z.string().min(10, t('validation.phoneMin')),
          password: z.string().min(6, t('validation.passwordMin')),
          confirmPassword: z.string(),
          customerType: z.enum(['PERSONAL', 'BUSINESS']).default('PERSONAL'),
          companyName: z.string().optional(),
          taxId: z.string().optional(),
          companyEmail: z.string().optional(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t('validation.confirmMismatch'),
          path: ['confirmPassword'],
        })
        .superRefine((data, ctx) => {
          if (data.customerType === 'BUSINESS') {
            if (!data.companyName || data.companyName.trim().length < 2) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['companyName'],
                message: t('validation.companyNameRequired'),
              });
            }
            if (!data.taxId || data.taxId.replace(/[^\d]/g, '').length < 10) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['taxId'],
                message: t('validation.taxIdRequired'),
              });
            }
            if (data.companyEmail && !/^\S+@\S+\.\S+$/.test(data.companyEmail)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['companyEmail'],
                message: t('validation.invalidCompanyEmail'),
              });
            }
          }
        }),
    [t]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { customerType: 'PERSONAL' },
  });

  const customerType = watch('customerType');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          customerType: data.customerType,
          companyName: data.customerType === 'BUSINESS' ? data.companyName : undefined,
          taxId: data.customerType === 'BUSINESS' ? data.taxId : undefined,
          companyEmail: data.customerType === 'BUSINESS' ? data.companyEmail : undefined,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        const raw = (result?.error as string | undefined) || 'Failed to register';
        if (raw === 'User with this email already exists') throw new Error(t('errors.emailExists'));
        if (raw === 'Validation error') throw new Error(t('errors.validation'));
        if (raw === 'Failed to create account') throw new Error(t('errors.createFailed'));
        throw new Error(t('errors.registerFailed'));
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ce-circle-pattern flex min-h-[calc(100vh-5rem)] items-center justify-center bg-ce-gradient-light px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl">{t('registerTitle')}</CardTitle>
          <CardDescription>{t('registerSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t('name')} *</Label>
              <Input
                id="name"
                {...register('name')}
                disabled={isLoading}
                placeholder={t('placeholders.name')}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')} *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                disabled={isLoading}
                placeholder={t('placeholders.email')}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')} *</Label>
              <Input
                id="phone"
                {...register('phone')}
                disabled={isLoading}
                placeholder="0901234567"
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>{t('customerTypeLabel')} *</Label>
              <div className="rounded-md border p-3">
                <RadioGroup
                  defaultValue="PERSONAL"
                  value={customerType}
                  onValueChange={(v) => {
                    setValue('customerType', v as RegisterFormData['customerType'], {
                      shouldValidate: true,
                    });
                  }}
                  className="grid gap-3"
                >
                  <label className="flex cursor-pointer items-center gap-3">
                    <RadioGroupItem value="PERSONAL" />
                    <span className="text-sm font-medium">{t('customerTypePersonal')}</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3">
                    <RadioGroupItem value="BUSINESS" />
                    <span className="text-sm font-medium">{t('customerTypeBusiness')}</span>
                  </label>
                </RadioGroup>
                {/* Hidden input to bind to react-hook-form */}
                <input
                  id="customerType"
                  type="hidden"
                  {...register('customerType')}
                  value={customerType}
                  readOnly
                />
              </div>
              {errors.customerType && (
                <p className="text-sm text-destructive">{errors.customerType.message}</p>
              )}
            </div>

            {customerType === 'BUSINESS' && (
              <div className="space-y-4 rounded-lg border bg-ce-neutral-20 p-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">{t('companyName')} *</Label>
                  <Input
                    id="companyName"
                    {...register('companyName')}
                    disabled={isLoading}
                    placeholder={t('placeholders.companyName')}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">{t('taxId')} *</Label>
                  <Input
                    id="taxId"
                    {...register('taxId')}
                    disabled={isLoading}
                    placeholder={t('placeholders.taxId')}
                  />
                  {errors.taxId && (
                    <p className="text-sm text-destructive">{errors.taxId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail">{t('companyEmail')}</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    {...register('companyEmail')}
                    disabled={isLoading}
                    placeholder="accounting@company.com"
                  />
                  {errors.companyEmail && (
                    <p className="text-sm text-destructive">{errors.companyEmail.message}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')} *</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                disabled={isLoading}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')} *</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                disabled={isLoading}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" variant="ce" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('loading.creatingAccount')}
                </>
              ) : (
                t('signUp')
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t('hasAccount')}{' '}
              <Link href="/login" className="text-ce-primary hover:underline">
                {t('signIn')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
