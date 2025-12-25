'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2, Pencil, Save } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type CustomerType = 'PERSONAL' | 'BUSINESS';
type AddressKind = 'SHIPPING' | 'BILLING';

type ProfileForm = {
  name?: string;
  phone?: string;
  customerType: CustomerType;
  companyName?: string;
  taxId?: string;
  companyEmail?: string;
};

type AddressForm = {
  kind: AddressKind;
  label?: string;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone: string;
  companyName?: string;
  taxId?: string;
  addressLine1: string;
  addressLine2?: string;
  district?: string;
  city?: string;
  province?: string;
  country?: string;
  isDefault?: boolean;
};

type CustomerAddress = AddressForm & {
  id: string;
  ward?: string;
  postalCode?: string;
  createdAt: string;
  updatedAt: string;
};

export default function DashboardProfilePage() {
  const locale = useLocale();
  const t = useTranslations();
  const ta = useTranslations('auth');
  const tp = useTranslations('profile');
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState<string | null>(null);

  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);

  const profileSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().min(2).max(120).optional(),
          phone: z.string().min(9).max(20).optional(),
          customerType: z.enum(['PERSONAL', 'BUSINESS']).default('PERSONAL'),
          companyName: z.string().optional(),
          taxId: z.string().optional(),
          companyEmail: z.string().optional(),
        })
        .superRefine((val, ctx) => {
          if (val.customerType === 'BUSINESS') {
            if (!val.companyName || val.companyName.trim().length < 2) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['companyName'],
                message: ta('validation.companyNameRequired'),
              });
            }
            if (!val.taxId || val.taxId.replace(/[^\d]/g, '').length < 10) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['taxId'],
                message: ta('validation.taxIdRequired'),
              });
            }
            if (val.companyEmail && !/^\S+@\S+\.\S+$/.test(val.companyEmail)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['companyEmail'],
                message: ta('validation.invalidCompanyEmail'),
              });
            }
          }
        }),
    [ta]
  );

  const addressSchema = useMemo(
    () =>
      z.object({
        kind: z.enum(['SHIPPING', 'BILLING']).default('SHIPPING'),
        label: z.string().optional(),
        recipientName: z.string().min(2),
        recipientEmail: z
          .string()
          .email()
          .optional()
          .or(z.literal(''))
          .transform((v) => (v ? v : undefined)),
        recipientPhone: z.string().min(9),
        companyName: z.string().optional(),
        taxId: z.string().optional(),
        addressLine1: z.string().min(5),
        addressLine2: z.string().optional(),
        district: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional(),
        country: z.string().optional(),
        isDefault: z.boolean().optional(),
      }),
    []
  );

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    watch: watchProfile,
    setValue: setProfileValue,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { customerType: 'PERSONAL' },
  });

  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    reset: resetAddress,
    setValue: setAddressValue,
    watch: watchAddress,
    formState: { errors: addressErrors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { kind: 'SHIPPING', country: 'Vietnam', isDefault: false },
  });

  const customerType = watchProfile('customerType');
  const addressKind = watchAddress('kind');

  const loadProfile = async () => {
    setLoading(true);
    setProfileError(null);
    try {
      const res = await fetch('/api/customer/profile');
      if (res.status === 401) {
        router.push('/login?callbackUrl=/dashboard/profile');
        return;
      }
      if (!res.ok) throw new Error('Failed to load profile');
      const json = await res.json();

      resetProfile({
        name: json?.user?.name ?? '',
        phone: json?.user?.phone ?? '',
        customerType: json?.user?.customerProfile?.customerType ?? 'PERSONAL',
        companyName: json?.user?.customerProfile?.companyName ?? '',
        taxId: json?.user?.customerProfile?.taxId ?? '',
        companyEmail: json?.user?.customerProfile?.companyEmail ?? '',
      });
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    setAddressesLoading(true);
    setAddressesError(null);
    try {
      const res = await fetch('/api/customer/addresses');
      if (res.status === 401) {
        router.push('/login?callbackUrl=/dashboard/profile');
        return;
      }
      if (!res.ok) throw new Error('Failed to load addresses');
      const json = await res.json();
      setAddresses(json?.addresses ?? []);
    } catch (e) {
      setAddressesError(e instanceof Error ? e.message : 'Failed to load addresses');
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
    void loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSaveProfile = async (data: ProfileForm) => {
    setSavingProfile(true);
    setProfileError(null);
    setProfileSaved(null);

    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          customerType: data.customerType,
          companyName: data.customerType === 'BUSINESS' ? data.companyName : undefined,
          taxId: data.customerType === 'BUSINESS' ? data.taxId : undefined,
          companyEmail: data.customerType === 'BUSINESS' ? data.companyEmail : undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || 'Failed to update profile');
      }

      setProfileSaved(tp('toast.saved'));
      await loadProfile();
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const startEditAddress = (addr: CustomerAddress) => {
    setEditingAddressId(addr.id);
    setShowNewAddress(true);
    resetAddress({
      kind: (addr.kind as AddressKind) ?? 'SHIPPING',
      label: addr.label ?? '',
      recipientName: addr.recipientName ?? '',
      recipientEmail: addr.recipientEmail ?? '',
      recipientPhone: addr.recipientPhone ?? '',
      companyName: addr.companyName ?? '',
      taxId: addr.taxId ?? '',
      addressLine1: addr.addressLine1 ?? '',
      addressLine2: addr.addressLine2 ?? '',
      district: addr.district ?? '',
      city: addr.city ?? '',
      province: addr.province ?? '',
      country: addr.country ?? 'Vietnam',
      isDefault: !!addr.isDefault,
    });
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setShowNewAddress(false);
    resetAddress({ kind: 'SHIPPING', country: 'Vietnam', isDefault: false } as any);
  };

  const onSaveAddress = async (data: AddressForm) => {
    setAddressesError(null);
    try {
      const url = editingAddressId
        ? `/api/customer/addresses/${editingAddressId}`
        : '/api/customer/addresses';
      const method = editingAddressId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || 'Failed to save address');
      }

      await loadAddresses();
      resetAddressForm();
    } catch (e) {
      setAddressesError(e instanceof Error ? e.message : 'Failed to save address');
    }
  };

  const onDeleteAddress = async (id: string) => {
    const ok = window.confirm(tp('confirm.deleteAddress'));
    if (!ok) return;

    setAddressesError(null);
    try {
      const res = await fetch(`/api/customer/addresses/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || 'Failed to delete address');
      }
      await loadAddresses();
      if (editingAddressId === id) resetAddressForm();
    } catch (e) {
      setAddressesError(e instanceof Error ? e.message : 'Failed to delete address');
    }
  };

  if (loading) {
    return (
      <div className="ce-section">
        <div className="ce-container">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('common.loading')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ce-section">
      <div className="ce-container space-y-6">
        <div>
          <h1 className="text-3xl font-heavy">{t('profile.title')}</h1>
          <p className="text-muted-foreground">{t('profile.subtitle')}</p>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.profileTitle')}</CardTitle>
            <CardDescription>{t('profile.profileSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            {profileError && (
              <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {profileError}
              </div>
            )}
            {profileSaved && (
              <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
                {profileSaved}
              </div>
            )}

            <form onSubmit={handleProfileSubmit(onSaveProfile)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pf-name">{t('auth.name')}</Label>
                  <Input id="pf-name" {...registerProfile('name')} />
                  {profileErrors.name && (
                    <p className="text-sm text-destructive">{profileErrors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-phone">{t('auth.phone')}</Label>
                  <Input id="pf-phone" {...registerProfile('phone')} />
                  {profileErrors.phone && (
                    <p className="text-sm text-destructive">{profileErrors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('auth.customerTypeLabel')}</Label>
                <div className="rounded-md border p-3">
                  <RadioGroup
                    value={customerType}
                    onValueChange={(v) =>
                      setProfileValue('customerType', v as CustomerType, { shouldValidate: true })
                    }
                    className="grid gap-3"
                  >
                    <label className="flex cursor-pointer items-center gap-3">
                      <RadioGroupItem value="PERSONAL" />
                      <span className="text-sm font-medium">{t('auth.customerTypePersonal')}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3">
                      <RadioGroupItem value="BUSINESS" />
                      <span className="text-sm font-medium">{t('auth.customerTypeBusiness')}</span>
                    </label>
                  </RadioGroup>
                </div>
              </div>

              {customerType === 'BUSINESS' && (
                <div className="space-y-4 rounded-lg border bg-ce-neutral-20 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pf-companyName">{t('auth.companyName')} *</Label>
                      <Input id="pf-companyName" {...registerProfile('companyName')} />
                      {profileErrors.companyName && (
                        <p className="text-sm text-destructive">
                          {profileErrors.companyName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pf-taxId">{t('auth.taxId')} *</Label>
                      <Input id="pf-taxId" {...registerProfile('taxId')} />
                      {profileErrors.taxId && (
                        <p className="text-sm text-destructive">{profileErrors.taxId.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pf-companyEmail">{t('auth.companyEmail')}</Label>
                    <Input id="pf-companyEmail" type="email" {...registerProfile('companyEmail')} />
                    {profileErrors.companyEmail && (
                      <p className="text-sm text-destructive">
                        {profileErrors.companyEmail.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Button type="submit" variant="ce" disabled={savingProfile}>
                {savingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('common.save')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Address Book */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('profile.addressBookTitle')}</CardTitle>
                <CardDescription>{t('profile.addressBookSubtitle')}</CardDescription>
              </div>
              <Button
                variant="ce"
                onClick={() => {
                  setEditingAddressId(null);
                  setShowNewAddress((v) => !v);
                  if (!showNewAddress) {
                    resetAddress({ kind: 'SHIPPING', country: 'Vietnam', isDefault: false } as any);
                  }
                }}
                type="button"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('profile.addAddress')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {addressesError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {addressesError}
              </div>
            )}

            {showNewAddress && (
              <div className="rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {editingAddressId ? t('profile.editAddress') : t('profile.newAddress')}
                  </h3>
                  <Button type="button" variant="outline" size="sm" onClick={resetAddressForm}>
                    {t('common.cancel')}
                  </Button>
                </div>

                <form onSubmit={handleAddressSubmit(onSaveAddress)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t('profile.addressKind')}</Label>
                      <Select
                        value={addressKind}
                        onValueChange={(v) =>
                          setAddressValue('kind', v as AddressKind, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('profile.addressKind')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SHIPPING">{t('profile.shipping')}</SelectItem>
                          <SelectItem value="BILLING">{t('profile.billing')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {addressErrors.kind && (
                        <p className="text-sm text-destructive">{addressErrors.kind.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ad-label">{t('profile.addressLabel')}</Label>
                      <Input
                        id="ad-label"
                        {...registerAddress('label')}
                        placeholder={tp('placeholders.label')}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="ad-recipientName">{t('profile.recipientName')} *</Label>
                      <Input id="ad-recipientName" {...registerAddress('recipientName')} />
                      {addressErrors.recipientName && (
                        <p className="text-sm text-destructive">
                          {addressErrors.recipientName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="ad-recipientPhone">{t('profile.recipientPhone')} *</Label>
                      <Input id="ad-recipientPhone" {...registerAddress('recipientPhone')} />
                      {addressErrors.recipientPhone && (
                        <p className="text-sm text-destructive">
                          {addressErrors.recipientPhone.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="ad-recipientEmail">{t('profile.recipientEmail')}</Label>
                      <Input
                        id="ad-recipientEmail"
                        type="email"
                        {...registerAddress('recipientEmail')}
                      />
                      {addressErrors.recipientEmail && (
                        <p className="text-sm text-destructive">
                          {addressErrors.recipientEmail.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ad-companyName">{t('auth.companyName')}</Label>
                      <Input id="ad-companyName" {...registerAddress('companyName')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ad-taxId">{t('auth.taxId')}</Label>
                      <Input id="ad-taxId" {...registerAddress('taxId')} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ad-addressLine1">{t('profile.addressLine1')} *</Label>
                    <Input id="ad-addressLine1" {...registerAddress('addressLine1')} />
                    {addressErrors.addressLine1 && (
                      <p className="text-sm text-destructive">
                        {addressErrors.addressLine1.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="ad-district">{t('profile.district')}</Label>
                      <Input id="ad-district" {...registerAddress('district')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ad-city">{t('profile.city')}</Label>
                      <Input id="ad-city" {...registerAddress('city')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ad-province">{t('profile.province')}</Label>
                      <Input id="ad-province" {...registerAddress('province')} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="ad-isDefault"
                      type="checkbox"
                      className="h-4 w-4"
                      {...registerAddress('isDefault')}
                    />
                    <Label htmlFor="ad-isDefault">{t('profile.setAsDefault')}</Label>
                  </div>

                  <Button type="submit" variant="ce">
                    <Save className="mr-2 h-4 w-4" />
                    {t('common.save')}
                  </Button>
                </form>
              </div>
            )}

            <Separator />

            {addressesLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common.loading')}
              </div>
            ) : addresses.length === 0 ? (
              <p className="text-muted-foreground">{t('profile.noAddresses')}</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {addresses.map((addr) => (
                  <div key={addr.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">
                          {addr.label ||
                            (addr.kind === 'BILLING'
                              ? t('profile.billing')
                              : t('profile.shipping'))}
                          {addr.isDefault ? (
                            <span className="ml-2 rounded-full bg-ce-primary/10 px-2 py-0.5 text-xs text-ce-primary">
                              {t('profile.default')}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {addr.recipientName} • {addr.recipientPhone}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => startEditAddress(addr)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => onDeleteAddress(addr.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm">
                      {addr.addressLine1}
                      {addr.district ? `, ${addr.district}` : ''}
                      {addr.city ? `, ${addr.city}` : ''}
                      {addr.province ? `, ${addr.province}` : ''}
                    </div>
                    {(addr.companyName || addr.taxId) && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {addr.companyName ? `${addr.companyName}` : ''}
                        {addr.taxId ? ` • ${t('auth.taxId')}: ${addr.taxId}` : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
