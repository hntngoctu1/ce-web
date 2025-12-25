'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLocale, useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type CheckoutFormData = {
  // Buyer info
  customerType: 'PERSONAL' | 'BUSINESS';
  companyName?: string;
  taxId?: string;
  companyEmail?: string;

  // Shipping
  shippingAddressId?: string; // saved address id or 'manual'
  shippingRecipientName: string;
  shippingRecipientEmail: string;
  shippingRecipientPhone: string;
  shippingAddressLine1: string;
  shippingDistrict?: string;
  shippingCity: string;
  shippingProvince?: string;

  // Billing
  billingSameAsShipping: boolean;
  billingAddressId?: string; // saved address id or 'manual'
  billingRecipientName?: string;
  billingRecipientEmail?: string;
  billingRecipientPhone?: string;
  billingAddressLine1?: string;
  billingDistrict?: string;
  billingCity?: string;
  billingProvince?: string;

  notes?: string;
  paymentMethod: 'cod' | 'bank_transfer';
};

interface CheckoutFormProps {
  locale?: string;
  user?: any;
}

type CustomerAddress = {
  id: string;
  kind: 'SHIPPING' | 'BILLING';
  label?: string | null;
  recipientName: string;
  recipientEmail?: string | null;
  recipientPhone: string;
  companyName?: string | null;
  taxId?: string | null;
  addressLine1: string;
  district?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  isDefault?: boolean;
};

function addressDisplay(addr: CustomerAddress) {
  const parts = [
    addr.label ? `${addr.label}` : null,
    addr.addressLine1,
    addr.district || null,
    addr.city || null,
    addr.province || null,
  ].filter(Boolean);
  return parts.join(' • ');
}

export function CheckoutForm({ locale = 'en', user }: CheckoutFormProps) {
  const providerLocale = useLocale();
  const uiLocale = providerLocale || locale;
  const t = useTranslations('checkout');
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkoutSchema = useMemo(
    () =>
      z
        .object({
          customerType: z.enum(['PERSONAL', 'BUSINESS']).default('PERSONAL'),
          companyName: z.string().optional(),
          taxId: z.string().optional(),
          companyEmail: z.string().optional(),

          shippingAddressId: z.string().optional(),
          shippingRecipientName: z.string().min(2, t('validation.recipientNameRequired')),
          shippingRecipientEmail: z.string().email(t('validation.invalidEmail')),
          shippingRecipientPhone: z.string().min(9, t('validation.invalidPhone')),
          shippingAddressLine1: z.string().min(5, t('validation.addressMin')),
          shippingDistrict: z
            .string()
            .optional()
            .refine((v) => v === undefined || v.trim() === '' || v.trim().length >= 2, {
              message: t('validation.districtMin'),
            }),
          shippingCity: z.string().min(2, t('validation.cityRequired')),
          shippingProvince: z
            .string()
            .optional()
            .refine((v) => v === undefined || v.trim() === '' || v.trim().length >= 2, {
              message: t('validation.provinceMin'),
            }),

          billingSameAsShipping: z.boolean().default(true),
          billingAddressId: z.string().optional(),
          billingRecipientName: z.string().optional(),
          billingRecipientEmail: z.string().optional(),
          billingRecipientPhone: z.string().optional(),
          billingAddressLine1: z.string().optional(),
          billingDistrict: z
            .string()
            .optional()
            .refine((v) => v === undefined || v.trim() === '' || v.trim().length >= 2, {
              message: t('validation.districtMin'),
            }),
          billingCity: z.string().optional(),
          billingProvince: z
            .string()
            .optional()
            .refine((v) => v === undefined || v.trim() === '' || v.trim().length >= 2, {
              message: t('validation.provinceMin'),
            }),

          notes: z.string().optional(),
          paymentMethod: z.enum(['cod', 'bank_transfer']),
        })
        .superRefine((val, ctx) => {
          if (val.customerType === 'BUSINESS') {
            if (!val.companyName || val.companyName.trim().length < 2) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['companyName'],
                message: t('validation.companyNameRequired'),
              });
            }
            if (!val.taxId || val.taxId.replace(/[^\d]/g, '').length < 10) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['taxId'],
                message: t('validation.taxIdRequired'),
              });
            }
            if (val.companyEmail && !/^\S+@\S+\.\S+$/.test(val.companyEmail)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['companyEmail'],
                message: t('validation.invalidCompanyEmail'),
              });
            }
          }

          // If billing differs from shipping, require billing fields.
          if (!val.billingSameAsShipping) {
            if (!val.billingRecipientName || val.billingRecipientName.trim().length < 2) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['billingRecipientName'],
                message: t('validation.billingRecipientRequired'),
              });
            }
            if (!val.billingRecipientEmail || !/^\S+@\S+\.\S+$/.test(val.billingRecipientEmail)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['billingRecipientEmail'],
                message: t('validation.invalidBillingEmail'),
              });
            }
            if (
              !val.billingRecipientPhone ||
              val.billingRecipientPhone.replace(/[^\d]/g, '').length < 9
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['billingRecipientPhone'],
                message: t('validation.invalidBillingPhone'),
              });
            }
            if (!val.billingAddressLine1 || val.billingAddressLine1.trim().length < 5) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['billingAddressLine1'],
                message: t('validation.billingAddressRequired'),
              });
            }
            if (!val.billingCity || val.billingCity.trim().length < 2) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['billingCity'],
                message: t('validation.billingCityRequired'),
              });
            }
          }
        }),
    [t]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: (() => {
      const addresses: CustomerAddress[] = (user?.addresses || []) as any;
      const defaultShipping =
        addresses.find((a) => a.kind === 'SHIPPING' && a.isDefault) ||
        addresses.find((a) => a.kind === 'SHIPPING') ||
        null;
      const defaultBilling =
        addresses.find((a) => a.kind === 'BILLING' && a.isDefault) ||
        addresses.find((a) => a.kind === 'BILLING') ||
        null;

      return {
        customerType: (user?.customerProfile?.customerType as any) || 'PERSONAL',
        companyName: user?.customerProfile?.companyName || '',
        taxId: user?.customerProfile?.taxId || '',
        companyEmail: user?.customerProfile?.companyEmail || '',

        shippingAddressId: defaultShipping?.id || 'manual',
        shippingRecipientName: defaultShipping?.recipientName || user?.name || '',
        shippingRecipientEmail: defaultShipping?.recipientEmail || user?.email || '',
        shippingRecipientPhone: defaultShipping?.recipientPhone || user?.phone || '',
        shippingAddressLine1: defaultShipping?.addressLine1 || user?.customerProfile?.address || '',
        shippingDistrict: defaultShipping?.district || '',
        shippingCity: defaultShipping?.city || user?.customerProfile?.city || '',
        shippingProvince: defaultShipping?.province || user?.customerProfile?.province || '',

        billingSameAsShipping: true,
        billingAddressId: defaultBilling?.id || 'manual',
        billingRecipientName: defaultBilling?.recipientName || '',
        billingRecipientEmail: defaultBilling?.recipientEmail || '',
        billingRecipientPhone: defaultBilling?.recipientPhone || '',
        billingAddressLine1: defaultBilling?.addressLine1 || '',
        billingDistrict: defaultBilling?.district || '',
        billingCity: defaultBilling?.city || '',
        billingProvince: defaultBilling?.province || '',

        paymentMethod: 'cod',
      } as CheckoutFormData;
    })(),
  });

  const customerType = watch('customerType');
  const shippingAddressId = watch('shippingAddressId');
  const billingSameAsShipping = watch('billingSameAsShipping');
  const billingAddressId = watch('billingAddressId');

  const savedAddresses: CustomerAddress[] = (user?.addresses || []) as any;
  const savedShipping = savedAddresses.filter((a) => a.kind === 'SHIPPING');
  const savedBilling = savedAddresses.filter((a) => a.kind === 'BILLING');

  useEffect(() => {
    // Autofill shipping fields when selecting a saved address.
    if (!user) return;
    const id = shippingAddressId;
    if (!id || id === 'manual') return;
    const addr = savedAddresses.find((a) => a.id === id);
    if (!addr) return;
    setValue('shippingRecipientName', addr.recipientName, { shouldValidate: true });
    setValue('shippingRecipientEmail', addr.recipientEmail || user?.email || '', {
      shouldValidate: true,
    });
    setValue('shippingRecipientPhone', addr.recipientPhone, { shouldValidate: true });
    setValue('shippingAddressLine1', addr.addressLine1, { shouldValidate: true });
    setValue('shippingDistrict', addr.district || '');
    setValue('shippingCity', addr.city || '', { shouldValidate: true });
    setValue('shippingProvince', addr.province || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingAddressId]);

  useEffect(() => {
    // Autofill billing fields when selecting a saved billing address.
    if (!user) return;
    if (billingSameAsShipping) return;
    const id = billingAddressId;
    if (!id || id === 'manual') return;
    const addr = savedAddresses.find((a) => a.id === id);
    if (!addr) return;
    setValue('billingRecipientName', addr.recipientName, { shouldValidate: true });
    setValue('billingRecipientEmail', addr.recipientEmail || user?.email || '', {
      shouldValidate: true,
    });
    setValue('billingRecipientPhone', addr.recipientPhone, { shouldValidate: true });
    setValue('billingAddressLine1', addr.addressLine1, { shouldValidate: true });
    setValue('billingDistrict', addr.district || '');
    setValue('billingCity', addr.city || '', { shouldValidate: true });
    setValue('billingProvince', addr.province || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingAddressId, billingSameAsShipping]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const buyerInfo = {
        customerType: data.customerType,
        companyName: data.customerType === 'BUSINESS' ? data.companyName : undefined,
        taxId: data.customerType === 'BUSINESS' ? data.taxId : undefined,
        companyEmail: data.customerType === 'BUSINESS' ? data.companyEmail : undefined,
      };

      const shipping = {
        kind: 'SHIPPING' as const,
        recipientName: data.shippingRecipientName,
        recipientEmail: data.shippingRecipientEmail,
        recipientPhone: data.shippingRecipientPhone,
        companyName: data.customerType === 'BUSINESS' ? data.companyName : undefined,
        taxId: data.customerType === 'BUSINESS' ? data.taxId : undefined,
        addressLine1: data.shippingAddressLine1,
        district: data.shippingDistrict || undefined,
        city: data.shippingCity,
        province: data.shippingProvince || undefined,
        country: 'Vietnam',
      };

      const billing = data.billingSameAsShipping
        ? undefined
        : {
            kind: 'BILLING' as const,
            recipientName: data.billingRecipientName || data.shippingRecipientName,
            recipientEmail: data.billingRecipientEmail || data.shippingRecipientEmail,
            recipientPhone: data.billingRecipientPhone || data.shippingRecipientPhone,
            companyName: data.customerType === 'BUSINESS' ? data.companyName : undefined,
            taxId: data.customerType === 'BUSINESS' ? data.taxId : undefined,
            addressLine1: data.billingAddressLine1 || data.shippingAddressLine1,
            district: data.billingDistrict || undefined,
            city: data.billingCity || data.shippingCity,
            province: data.billingProvince || undefined,
            country: 'Vietnam',
          };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Legacy required fields (keep API backward compatible)
          name: data.shippingRecipientName,
          email: data.shippingRecipientEmail,
          phone: data.shippingRecipientPhone,
          address: data.shippingAddressLine1,
          city: data.shippingCity,

          // New structured snapshots
          buyerInfo,
          shipping,
          billing,

          notes: data.notes,
          paymentMethod: data.paymentMethod,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal,
          total: subtotal, // Add tax/shipping logic here if needed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const result = await response.json();
      setOrderNumber(result.orderNumber);
      setOrderId(result.orderId || null);
      setIsSuccess(true);
      clearCart();
    } catch (err) {
      setError(t('errorPlaceOrder'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="mb-2 text-3xl font-bold text-ce-primary">{t('successTitle')}</h2>
        <p className="mb-6 text-lg text-muted-foreground">
          {t('successOrderNumber')} <span className="font-bold text-foreground">{orderNumber}</span>
        </p>
        <div className="flex gap-4">
          <Button variant="ce" asChild>
            <Link href="/menu/product">{t('successContinue')}</Link>
          </Button>
          {user && (
            <Button variant="outline" asChild>
              <Link href={orderId ? `/dashboard/orders/${orderId}` : '/dashboard/orders'}>
                {t('successViewOrder')}
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="mb-6 text-lg text-muted-foreground">{t('emptyCart')}</p>
        <Button variant="ce" asChild>
          <Link href="/menu/product">{t('emptyCartCta')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Checkout Form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">{error}</div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t('buyerInfoTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('customerType')} *</Label>
                <div className="rounded-md border p-3">
                  <RadioGroup
                    value={customerType}
                    onValueChange={(v) =>
                      setValue('customerType', v as any, { shouldValidate: true })
                    }
                    disabled={isLoading}
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
                </div>
              </div>

              {customerType === 'BUSINESS' && (
                <div className="space-y-4 rounded-lg border bg-ce-neutral-20 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">{t('companyName')} *</Label>
                      <Input id="companyName" {...register('companyName')} disabled={isLoading} />
                      {errors.companyName && (
                        <p className="text-sm text-destructive">{errors.companyName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId">{t('taxId')} *</Label>
                      <Input id="taxId" {...register('taxId')} disabled={isLoading} />
                      {errors.taxId && (
                        <p className="text-sm text-destructive">{errors.taxId.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">{t('companyEmailOptional')}</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      {...register('companyEmail')}
                      disabled={isLoading}
                    />
                    {errors.companyEmail && (
                      <p className="text-sm text-destructive">{errors.companyEmail.message}</p>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-semibold">{t('shippingTitle')}</div>
                  {user ? (
                    <div className="text-sm text-muted-foreground">{t('shippingHintSaved')}</div>
                  ) : (
                    <div className="text-sm text-muted-foreground">{t('shippingHintManual')}</div>
                  )}
                </div>
              </div>

              {user && (
                <div className="space-y-2">
                  <Label>{t('chooseSavedAddress')}</Label>
                  <Select
                    value={shippingAddressId || 'manual'}
                    onValueChange={(v) =>
                      setValue('shippingAddressId', v, { shouldValidate: false })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectAddress')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">{t('enterManually')}</SelectItem>
                      {savedShipping.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {addressDisplay(a)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="shippingRecipientName">{t('recipientName')} *</Label>
                  <Input
                    id="shippingRecipientName"
                    {...register('shippingRecipientName')}
                    disabled={isLoading}
                  />
                  {errors.shippingRecipientName && (
                    <p className="text-sm text-destructive">
                      {errors.shippingRecipientName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingRecipientPhone">{t('recipientPhone')} *</Label>
                  <Input
                    id="shippingRecipientPhone"
                    {...register('shippingRecipientPhone')}
                    disabled={isLoading}
                  />
                  {errors.shippingRecipientPhone && (
                    <p className="text-sm text-destructive">
                      {errors.shippingRecipientPhone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingRecipientEmail">{t('recipientEmail')} *</Label>
                <Input
                  id="shippingRecipientEmail"
                  type="email"
                  {...register('shippingRecipientEmail')}
                  disabled={isLoading}
                />
                {errors.shippingRecipientEmail && (
                  <p className="text-sm text-destructive">
                    {errors.shippingRecipientEmail.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingAddressLine1">{t('address')} *</Label>
                <Input
                  id="shippingAddressLine1"
                  {...register('shippingAddressLine1')}
                  disabled={isLoading}
                />
                {errors.shippingAddressLine1 && (
                  <p className="text-sm text-destructive">{errors.shippingAddressLine1.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="shippingDistrict">{t('districtOptional')}</Label>
                  <Input
                    id="shippingDistrict"
                    {...register('shippingDistrict')}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingCity">{t('cityProvince')} *</Label>
                  <Input id="shippingCity" {...register('shippingCity')} disabled={isLoading} />
                  {errors.shippingCity && (
                    <p className="text-sm text-destructive">{errors.shippingCity.message}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    id="billingSameAsShipping"
                    type="checkbox"
                    className="h-4 w-4"
                    checked={billingSameAsShipping}
                    onChange={(e) =>
                      setValue('billingSameAsShipping', e.target.checked, { shouldValidate: true })
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor="billingSameAsShipping">{t('billingSameAsShipping')}</Label>
                </div>

                {!billingSameAsShipping && (
                  <div className="space-y-4 rounded-lg border bg-ce-neutral-20 p-4">
                    {user && (
                      <div className="space-y-2">
                        <Label>{t('chooseSavedBillingAddress')}</Label>
                        <Select
                          value={billingAddressId || 'manual'}
                          onValueChange={(v) =>
                            setValue('billingAddressId', v, { shouldValidate: false })
                          }
                          disabled={isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectAddress')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">{t('enterManually')}</SelectItem>
                            {savedBilling.map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {addressDisplay(a)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="billingRecipientName">{t('billingRecipient')} *</Label>
                        <Input
                          id="billingRecipientName"
                          {...register('billingRecipientName')}
                          disabled={isLoading}
                        />
                        {errors.billingRecipientName && (
                          <p className="text-sm text-destructive">
                            {errors.billingRecipientName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingRecipientPhone">{t('billingPhone')} *</Label>
                        <Input
                          id="billingRecipientPhone"
                          {...register('billingRecipientPhone')}
                          disabled={isLoading}
                        />
                        {errors.billingRecipientPhone && (
                          <p className="text-sm text-destructive">
                            {errors.billingRecipientPhone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billingRecipientEmail">{t('billingEmail')} *</Label>
                      <Input
                        id="billingRecipientEmail"
                        type="email"
                        {...register('billingRecipientEmail')}
                        disabled={isLoading}
                      />
                      {errors.billingRecipientEmail && (
                        <p className="text-sm text-destructive">
                          {errors.billingRecipientEmail.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billingAddressLine1">{t('billingAddress')} *</Label>
                      <Input
                        id="billingAddressLine1"
                        {...register('billingAddressLine1')}
                        disabled={isLoading}
                      />
                      {errors.billingAddressLine1 && (
                        <p className="text-sm text-destructive">
                          {errors.billingAddressLine1.message}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="billingDistrict">{t('districtOptional')}</Label>
                        <Input
                          id="billingDistrict"
                          {...register('billingDistrict')}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingCity">{t('cityProvince')} *</Label>
                        <Input id="billingCity" {...register('billingCity')} disabled={isLoading} />
                        {errors.billingCity && (
                          <p className="text-sm text-destructive">{errors.billingCity.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('orderNotes')}</Label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  disabled={isLoading}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('paymentMethodTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                defaultValue="cod"
                onValueChange={(val) => setValue('paymentMethod', val as any)}
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2 rounded-md border p-4">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    {t('paymentCod')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-4">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                    {t('paymentBankTransfer')}
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Order Summary */}
      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>{t('orderSummaryTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="line-clamp-1 flex-1 pr-4">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{t('total')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant="ce"
              size="lg"
              disabled={isLoading}
              onClick={handleSubmit(onSubmit)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                <>{t('placeOrder')}</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
