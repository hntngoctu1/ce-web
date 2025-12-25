'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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

const postSchema = z.object({
  titleEn: z.string().min(1),
  titleVi: z.string().min(1),
  slug: z.string().min(1),
  excerptEn: z.string().optional(),
  excerptVi: z.string().optional(),
  contentEn: z.string().optional(),
  contentVi: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  coverImage: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

const NONE_VALUE = '__none__';

interface BlogPostFormProps {
  post?: {
    id: string;
    titleEn: string;
    titleVi: string;
    slug: string;
    excerptEn: string | null;
    excerptVi: string | null;
    contentEn: string | null;
    contentVi: string | null;
    categoryId: string | null;
    isPublished: boolean;
    isFeatured: boolean;
    coverImage: string | null;
  } | null;
  categories: { id: string; nameEn: string }[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function BlogPostForm({ post, categories }: BlogPostFormProps) {
  const router = useRouter();
  const t = useTranslations('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(
      postSchema.extend({
        titleEn: z.string().min(1, t('blog.validation.titleEnRequired')),
        titleVi: z.string().min(1, t('blog.validation.titleViRequired')),
        slug: z.string().min(1, t('blog.validation.slugRequired')),
      })
    ),
    defaultValues: post
      ? {
          ...post,
          excerptEn: post.excerptEn || '',
          excerptVi: post.excerptVi || '',
          contentEn: post.contentEn || '',
          contentVi: post.contentVi || '',
          coverImage: post.coverImage || '',
        }
      : {
          titleEn: '',
          titleVi: '',
          slug: '',
          excerptEn: '',
          excerptVi: '',
          contentEn: '',
          contentVi: '',
          categoryId: null,
          isPublished: false,
          isFeatured: false,
          coverImage: '',
        },
  });

  const coverImage = watch('coverImage');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('titleEn', value);
    if (!post) {
      setValue('slug', slugify(value));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(t('blog.form.uploadFailed'));

      const data = await res.json();
      setValue('coverImage', data.url);
    } catch (err) {
      console.error('Upload error', err);
      setError(err instanceof Error ? err.message : t('blog.form.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = post ? `/api/admin/blog/${post.id}` : '/api/admin/blog';
      const method = post ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || t('blog.form.saveFailed'));
      }

      router.push('/admin/blog');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('blog.form.genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <div className="rounded-md bg-destructive/10 p-4 text-destructive">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('blog.form.contentSection')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titleEn">{t('blog.form.titleEn')}</Label>
                <Input
                  id="titleEn"
                  {...register('titleEn')}
                  onChange={handleTitleChange}
                  disabled={isLoading}
                />
                {errors.titleEn && (
                  <p className="text-sm text-destructive">{errors.titleEn.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="titleVi">{t('blog.form.titleVi')}</Label>
                <Input id="titleVi" {...register('titleVi')} disabled={isLoading} />
                {errors.titleVi && (
                  <p className="text-sm text-destructive">{errors.titleVi.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">{t('blog.form.slug')}</Label>
                <Input id="slug" {...register('slug')} disabled={isLoading} />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('blog.form.excerptEn')}</Label>
                  <textarea
                    {...register('excerptEn')}
                    className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('blog.form.excerptVi')}</Label>
                  <textarea
                    {...register('excerptVi')}
                    className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('blog.form.contentEn')}</Label>
                  <textarea
                    {...register('contentEn')}
                    className="min-h-[220px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
                    disabled={isLoading}
                    placeholder="<p>...</p>"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('blog.form.contentVi')}</Label>
                  <textarea
                    {...register('contentVi')}
                    className="min-h-[220px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
                    disabled={isLoading}
                    placeholder="<p>...</p>"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('blog.table.status')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  {...register('isPublished')}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isPublished">{t('blog.form.published')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  {...register('isFeatured')}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isFeatured">{t('blog.form.featured')}</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('blog.form.category')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={watch('categoryId') || NONE_VALUE}
                onValueChange={(value) =>
                  setValue('categoryId', value === NONE_VALUE ? null : value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('blog.form.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>{t('blog.form.none')}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('blog.form.coverImage')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {uploading ? t('blog.form.uploading') : t('blog.form.upload')}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {coverImage ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                  <Image
                    src={coverImage}
                    alt={t('blog.form.coverImage')}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 800px"
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-6">
        <Button variant="outline" type="button" asChild>
          <Link href="/admin/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.cancel')}
          </Link>
        </Button>
        <Button type="submit" variant="ce" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('blog.form.saving')}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('blog.form.save')}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
