'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Camera, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AnimatedStarRating } from './star-rating';
import { cn } from '@/lib/utils';

// Validation schema
const reviewSchema = z.object({
  overallRating: z.number().min(1, 'Vui lòng chọn đánh giá').max(5),
  qualityRating: z.number().min(0).max(5).optional(),
  valueRating: z.number().min(0).max(5).optional(),
  title: z.string().max(200, 'Tiêu đề tối đa 200 ký tự').optional(),
  content: z
    .string()
    .min(20, 'Nội dung đánh giá tối thiểu 20 ký tự')
    .max(5000, 'Nội dung đánh giá tối đa 5000 ký tự'),
  pros: z.string().max(500, 'Ưu điểm tối đa 500 ký tự').optional(),
  cons: z.string().max(500, 'Nhược điểm tối đa 500 ký tự').optional(),
  isAnonymous: z.boolean().default(false),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  productName: string;
  orderId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  productId,
  productName,
  orderId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations('reviews');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      overallRating: 0,
      qualityRating: 0,
      valueRating: 0,
      title: '',
      content: '',
      pros: '',
      cons: '',
      isAnonymous: false,
    },
  });

  const overallRating = watch('overallRating');
  const qualityRating = watch('qualityRating');
  const valueRating = watch('valueRating');
  const content = watch('content');

  // Check if user is logged in
  if (!session?.user) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="mb-4 text-gray-600">
          Vui lòng đăng nhập để viết đánh giá
        </p>
        <Button asChild>
          <Link href={`/${locale}/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`}>
            Đăng nhập
          </Link>
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          orderId,
          ...data,
          media: uploadedImages.map((url, index) => ({
            type: 'IMAGE',
            url,
            order: index,
          })),
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Có lỗi xảy ra');
      }

      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="mb-3 text-4xl">🎉</div>
        <h3 className="mb-2 text-lg font-semibold text-green-800">
          Cảm ơn bạn đã đánh giá!
        </h3>
        <p className="text-sm text-green-600">
          Đánh giá của bạn đang được xem xét và sẽ hiển thị sau khi được duyệt.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Product info */}
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-sm text-gray-500">Đánh giá sản phẩm</p>
        <p className="font-medium text-gray-900">{productName}</p>
        {orderId && (
          <p className="mt-1 text-xs text-green-600">
            ✓ Đã mua hàng - Verified Purchase
          </p>
        )}
      </div>

      {/* Overall Rating */}
      <AnimatedStarRating
        value={overallRating}
        onChange={(value) => setValue('overallRating', value)}
        label="Đánh giá tổng thể"
        error={errors.overallRating?.message}
        required
      />

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Tiêu đề đánh giá</Label>
        <Input
          id="title"
          placeholder="Tóm tắt trải nghiệm của bạn..."
          {...register('title')}
          className={cn(errors.title && 'border-red-500')}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">
          Nội dung đánh giá <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="content"
          placeholder="Chia sẻ chi tiết về trải nghiệm sử dụng sản phẩm của bạn..."
          rows={5}
          {...register('content')}
          className={cn(errors.content && 'border-red-500')}
        />
        <div className="flex justify-between text-xs">
          <span className={cn(errors.content ? 'text-red-500' : 'text-gray-500')}>
            {errors.content?.message || 'Tối thiểu 20 ký tự'}
          </span>
          <span className="text-gray-400">{content.length}/5000</span>
        </div>
      </div>

      {/* Pros & Cons */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pros" className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-green-500" />
            Ưu điểm
          </Label>
          <Textarea
            id="pros"
            placeholder="Điều bạn thích về sản phẩm..."
            rows={3}
            {...register('pros')}
            className="border-green-200 focus:border-green-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cons" className="flex items-center gap-2">
            <ThumbsDown className="h-4 w-4 text-red-500" />
            Nhược điểm
          </Label>
          <Textarea
            id="cons"
            placeholder="Điều cần cải thiện..."
            rows={3}
            {...register('cons')}
            className="border-red-200 focus:border-red-400"
          />
        </div>
      </div>

      {/* Advanced ratings toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-ce-primary hover:underline"
      >
        {showAdvanced ? '− Ẩn đánh giá chi tiết' : '+ Thêm đánh giá chi tiết'}
      </button>

      {/* Advanced ratings */}
      {showAdvanced && (
        <div className="grid gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
          <div>
            <Label className="mb-2 block text-sm">Chất lượng sản phẩm</Label>
            <AnimatedStarRating
              value={qualityRating || 0}
              onChange={(value) => setValue('qualityRating', value)}
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm">Đáng giá tiền</Label>
            <AnimatedStarRating
              value={valueRating || 0}
              onChange={(value) => setValue('valueRating', value)}
            />
          </div>
        </div>
      )}

      {/* Image upload placeholder */}
      <div className="space-y-2">
        <Label>Thêm hình ảnh (Tối đa 10 ảnh)</Label>
        <div className="flex flex-wrap gap-2">
          {uploadedImages.map((url, index) => (
            <div key={index} className="relative h-20 w-20">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== index))}
                className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {uploadedImages.length < 10 && (
            <button
              type="button"
              className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-ce-primary hover:text-ce-primary"
              onClick={() => {
                // TODO: Implement file upload
                alert('Tính năng upload ảnh sẽ được triển khai trong Phase 1.2');
              }}
            >
              <Camera className="h-6 w-6" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Hỗ trợ: JPG, PNG, WebP. Tối đa 5MB/ảnh.
        </p>
      </div>

      {/* Anonymous option */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isAnonymous"
          checked={watch('isAnonymous')}
          onCheckedChange={(checked) => setValue('isAnonymous', checked as boolean)}
        />
        <Label htmlFor="isAnonymous" className="text-sm font-normal">
          Đăng ẩn danh (tên của bạn sẽ không hiển thị)
        </Label>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || overallRating === 0}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang gửi...
            </>
          ) : (
            'Gửi đánh giá'
          )}
        </Button>

        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        )}
      </div>

      {/* Terms */}
      <p className="text-center text-xs text-gray-500">
        Bằng việc gửi đánh giá, bạn đồng ý với{' '}
        <Link href={`/${locale}/terms`} className="text-ce-primary hover:underline">
          Điều khoản sử dụng
        </Link>
        {' '}của chúng tôi.
      </p>
    </form>
  );
}

