'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, ArrowLeft, ImagePlus, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const productSchema = z.object({
  nameEn: z.string().min(1),
  nameVi: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().optional(),
  shortDescEn: z.string().optional(),
  shortDescVi: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionVi: z.string().optional(),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0).optional().nullable(),
  groupId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  industryId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

const NONE_VALUE = '__none__';

interface ProductFormProps {
  product?: {
    id: string;
    nameEn: string;
    nameVi: string;
    slug: string;
    sku: string | null;
    shortDescEn: string | null;
    shortDescVi: string | null;
    descriptionEn: string | null;
    descriptionVi: string | null;
    price: unknown;
    salePrice: unknown | null;
    groupId: string | null;
    brandId: string | null;
    industryId: string | null;
    isActive: boolean;
    isFeatured: boolean;
    isOnSale: boolean;
    images?: Array<{
      id: string;
      url: string;
      alt: string | null;
      order: number;
      isPrimary: boolean;
    }>;
  } | null;
  groups: { id: string; nameEn: string }[];
  brands: { id: string; name: string }[];
  industries: { id: string; nameEn: string }[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProductForm({ product, groups, brands, industries }: ProductFormProps) {
  const router = useRouter();
  const t = useTranslations('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<Array<{ url: string; isPrimary: boolean }>>(() => {
    const list = (product?.images || [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((img) => ({ url: img.url, isPrimary: Boolean(img.isPrimary) }));
    if (!list.length) return [];
    // Ensure exactly one primary for UI
    if (!list.some((i) => i.isPrimary)) list[0].isPrimary = true;
    return list.map((i, idx) => ({
      ...i,
      isPrimary: i.isPrimary && idx === list.findIndex((x) => x.isPrimary),
    }));
  });
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(
      productSchema.extend({
        nameEn: z.string().min(1, t('products.validation.nameEnRequired')),
        nameVi: z.string().min(1, t('products.validation.nameViRequired')),
        slug: z.string().min(1, t('products.validation.slugRequired')),
        price: z.coerce.number().min(0, t('products.validation.pricePositive')),
      })
      // keep rest as-is
    ),
    defaultValues: product
      ? {
          ...product,
          price: Number(product.price),
          salePrice: product.salePrice ? Number(product.salePrice) : null,
          shortDescEn: product.shortDescEn || '',
          shortDescVi: product.shortDescVi || '',
          descriptionEn: product.descriptionEn || '',
          descriptionVi: product.descriptionVi || '',
          sku: product.sku || '',
        }
      : {
          nameEn: '',
          nameVi: '',
          slug: '',
          sku: '',
          shortDescEn: '',
          shortDescVi: '',
          descriptionEn: '',
          descriptionVi: '',
          price: 0,
          salePrice: null,
          groupId: null,
          brandId: null,
          industryId: null,
          isActive: true,
          isFeatured: false,
          isOnSale: false,
        },
  });

  const watchNameEn = watch('nameEn');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('nameEn', value);
    if (!product) {
      setValue('slug', slugify(value));
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const method = product ? 'PUT' : 'POST';

      const payload = {
        ...data,
        images: images.map((img, idx) => ({
          url: img.url,
          isPrimary: img.isPrimary,
          alt: data.nameEn || null,
          order: idx,
        })),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || t('products.form.saveFailed'));
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('products.form.genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <div className="rounded-md bg-destructive/10 p-4 text-destructive">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('products.form.basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nameEn">{t('products.form.nameEn')}</Label>
                  <Input
                    id="nameEn"
                    {...register('nameEn')}
                    onChange={handleNameChange}
                    disabled={isLoading}
                  />
                  {errors.nameEn && (
                    <p className="text-sm text-destructive">{errors.nameEn.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameVi">{t('products.form.nameVi')}</Label>
                  <Input id="nameVi" {...register('nameVi')} disabled={isLoading} />
                  {errors.nameVi && (
                    <p className="text-sm text-destructive">{errors.nameVi.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="slug">{t('products.form.slug')}</Label>
                  <Input id="slug" {...register('slug')} disabled={isLoading} />
                  {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">{t('products.form.sku')}</Label>
                  <Input id="sku" {...register('sku')} disabled={isLoading} />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="shortDescEn">{t('products.form.shortDescEn')}</Label>
                  <Input id="shortDescEn" {...register('shortDescEn')} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDescVi">{t('products.form.shortDescVi')}</Label>
                  <Input id="shortDescVi" {...register('shortDescVi')} disabled={isLoading} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionEn">{t('products.form.descEn')}</Label>
                <textarea
                  id="descriptionEn"
                  {...register('descriptionEn')}
                  disabled={isLoading}
                  className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionVi">{t('products.form.descVi')}</Label>
                <textarea
                  id="descriptionVi"
                  {...register('descriptionVi')}
                  disabled={isLoading}
                  className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>{t('products.form.price')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('products.form.price')}</Label>
                  <Input id="price" type="number" {...register('price')} disabled={isLoading} />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">{t('products.form.salePrice')}</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    {...register('salePrice')}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>{t('products.form.images') || 'Product images'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('products.form.uploadImages') || 'Upload images'}</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading || uploading}
                    onClick={() => document.getElementById('product-images-input')?.click()}
                  >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    {uploading
                      ? t('common.loading') || 'Uploading...'
                      : t('products.form.addImages') || 'Add images'}
                  </Button>
                  <input
                    id="product-images-input"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    className="hidden"
                    disabled={isLoading || uploading}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;
                      setUploading(true);
                      setError(null);
                      try {
                        const uploaded = [];
                        for (const file of files) {
                          const formData = new FormData();
                          formData.append('file', file);
                          const res = await fetch('/api/admin/upload', {
                            method: 'POST',
                            body: formData,
                          });
                          if (!res.ok) {
                            const err = await res.json().catch(() => ({}));
                            throw new Error(err?.error || 'Upload failed');
                          }
                          const json = await res.json();
                          if (json?.url) uploaded.push(String(json.url));
                        }

                        setImages((prev) => {
                          const next = [
                            ...prev,
                            ...uploaded.map((url) => ({ url, isPrimary: false })),
                          ];
                          if (next.length && !next.some((i) => i.isPrimary))
                            next[0].isPrimary = true;
                          return next;
                        });
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Upload failed');
                      } finally {
                        setUploading(false);
                        // allow re-select same file
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('products.form.imagesHint') ||
                    'PNG/JPG/WEBP, max 10MB each. Click ★ to set primary.'}
                </p>
              </div>

              {images.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {images.map((img, idx) => (
                    <div
                      key={`${img.url}-${idx}`}
                      className="flex items-center gap-3 rounded-lg border bg-white p-3"
                    >
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border bg-ce-neutral-20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs text-muted-foreground">{img.url}</div>
                        {img.isPrimary ? (
                          <div className="mt-1 text-xs font-semibold text-ce-primary">
                            {t('products.form.primary') || 'Primary'}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title={t('products.form.setPrimary') || 'Set primary'}
                          onClick={() =>
                            setImages((prev) =>
                              prev.map((p, i) => ({ ...p, isPrimary: i === idx }))
                            )
                          }
                        >
                          <Star
                            className={
                              img.isPrimary ? 'h-4 w-4 fill-yellow-400 text-yellow-400' : 'h-4 w-4'
                            }
                          />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title={t('common.delete') || 'Remove'}
                          onClick={() =>
                            setImages((prev) => {
                              const next = prev.filter((_, i) => i !== idx);
                              if (next.length && !next.some((x) => x.isPrimary))
                                next[0].isPrimary = true;
                              return next;
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  {t('products.form.noImages') || 'No images yet.'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t('products.table.status')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive">{t('products.form.active')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  {...register('isFeatured')}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isFeatured">{t('products.form.featured')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isOnSale"
                  {...register('isOnSale')}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isOnSale">{t('products.form.onSale')}</Label>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>{t('products.form.categoriesTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('products.form.group')}</Label>
                <Select
                  value={watch('groupId') || NONE_VALUE}
                  onValueChange={(value) =>
                    setValue('groupId', value === NONE_VALUE ? null : value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('products.form.selectGroup')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>{t('products.form.none')}</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('products.form.brand')}</Label>
                <Select
                  value={watch('brandId') || NONE_VALUE}
                  onValueChange={(value) =>
                    setValue('brandId', value === NONE_VALUE ? null : value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('products.form.selectBrand')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>{t('products.form.none')}</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('products.form.industry')}</Label>
                <Select
                  value={watch('industryId') || NONE_VALUE}
                  onValueChange={(value) =>
                    setValue('industryId', value === NONE_VALUE ? null : value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('products.form.selectIndustry')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>{t('products.form.none')}</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry.id} value={industry.id}>
                        {industry.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-6">
        <Button variant="outline" type="button" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.cancel')}
          </Link>
        </Button>
        <Button type="submit" variant="ce" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('products.form.saving')}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('products.form.save')}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
