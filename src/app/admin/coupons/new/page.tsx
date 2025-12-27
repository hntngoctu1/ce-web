'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Ticket } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const couponSchema = z.object({
  code: z.string().min(3, 'Mã tối thiểu 3 ký tự').max(50),
  name: z.string().min(1, 'Vui lòng nhập tên'),
  description: z.string().max(1000).optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  discountValue: z.coerce.number().min(0, 'Giá trị phải >= 0'),
  maxDiscount: z.coerce.number().min(0).optional(),
  minOrderAmount: z.coerce.number().min(0).optional(),
  minQuantity: z.coerce.number().min(1).optional(),
  usageLimit: z.coerce.number().min(1).optional(),
  usagePerUser: z.coerce.number().min(1).default(1),
  startsAt: z.string(),
  expiresAt: z.string().optional(),
  targetType: z.enum(['ALL', 'SPECIFIC_PRODUCTS', 'SPECIFIC_CATEGORIES', 'FIRST_ORDER']),
  isStackable: z.boolean().default(false),
});

type CouponFormData = z.infer<typeof couponSchema>;

export default function NewCouponPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      discountType: 'PERCENTAGE',
      targetType: 'ALL',
      usagePerUser: 1,
      startsAt: new Date().toISOString().slice(0, 16),
      isStackable: false,
    },
  });

  const discountType = watch('discountType');

  const onSubmit = async (data: CouponFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Có lỗi xảy ra');
      }

      router.push('/admin/coupons');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'CE';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('code', code);
  };

  return (
    <div className="container mx-auto max-w-3xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/coupons"
          className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Quay lại
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Tạo mã giảm giá mới</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Ticket className="h-5 w-5 text-ce-primary" />
            Thông tin cơ bản
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Mã giảm giá *</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  placeholder="VD: NEWYEAR2024"
                  className={cn('font-mono uppercase', errors.code && 'border-red-500')}
                  {...register('code')}
                />
                <Button type="button" variant="outline" onClick={generateCode}>
                  Tạo tự động
                </Button>
              </div>
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Tên mã giảm giá *</Label>
              <Input
                id="name"
                placeholder="VD: Khuyến mãi năm mới"
                className={cn(errors.name && 'border-red-500')}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về mã giảm giá..."
                rows={3}
                {...register('description')}
              />
            </div>
          </div>
        </div>

        {/* Discount Settings */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Cài đặt giảm giá</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Discount Type */}
            <div className="space-y-2">
              <Label>Loại giảm giá *</Label>
              <Select
                value={discountType}
                onValueChange={(value) => setValue('discountType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Số tiền cố định (VND)</SelectItem>
                  <SelectItem value="FREE_SHIPPING">Miễn phí vận chuyển</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Discount Value */}
            <div className="space-y-2">
              <Label htmlFor="discountValue">
                Giá trị giảm {discountType === 'PERCENTAGE' ? '(%)' : '(VND)'} *
              </Label>
              <Input
                id="discountValue"
                type="number"
                placeholder={discountType === 'PERCENTAGE' ? '10' : '100000'}
                className={cn(errors.discountValue && 'border-red-500')}
                {...register('discountValue')}
              />
              {errors.discountValue && (
                <p className="text-sm text-red-500">{errors.discountValue.message}</p>
              )}
            </div>

            {/* Max Discount (for percentage) */}
            {discountType === 'PERCENTAGE' && (
              <div className="space-y-2">
                <Label htmlFor="maxDiscount">Giảm tối đa (VND)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  placeholder="500000"
                  {...register('maxDiscount')}
                />
                <p className="text-xs text-gray-500">
                  Để trống nếu không giới hạn
                </p>
              </div>
            )}

            {/* Min Order Amount */}
            <div className="space-y-2">
              <Label htmlFor="minOrderAmount">Đơn hàng tối thiểu (VND)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                placeholder="1000000"
                {...register('minOrderAmount')}
              />
            </div>

            {/* Min Quantity */}
            <div className="space-y-2">
              <Label htmlFor="minQuantity">Số lượng sản phẩm tối thiểu</Label>
              <Input
                id="minQuantity"
                type="number"
                placeholder="2"
                {...register('minQuantity')}
              />
            </div>
          </div>
        </div>

        {/* Usage Limits */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Giới hạn sử dụng</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Usage Limit */}
            <div className="space-y-2">
              <Label htmlFor="usageLimit">Tổng số lượt sử dụng</Label>
              <Input
                id="usageLimit"
                type="number"
                placeholder="100"
                {...register('usageLimit')}
              />
              <p className="text-xs text-gray-500">
                Để trống nếu không giới hạn
              </p>
            </div>

            {/* Usage Per User */}
            <div className="space-y-2">
              <Label htmlFor="usagePerUser">Số lần sử dụng/khách hàng</Label>
              <Input
                id="usagePerUser"
                type="number"
                min="1"
                {...register('usagePerUser')}
              />
            </div>

            {/* Target Type */}
            <div className="space-y-2">
              <Label>Áp dụng cho</Label>
              <Select
                value={watch('targetType')}
                onValueChange={(value) => setValue('targetType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả sản phẩm</SelectItem>
                  <SelectItem value="SPECIFIC_PRODUCTS">Sản phẩm cụ thể</SelectItem>
                  <SelectItem value="SPECIFIC_CATEGORIES">Danh mục cụ thể</SelectItem>
                  <SelectItem value="FIRST_ORDER">Đơn hàng đầu tiên</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stackable */}
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="isStackable"
                checked={watch('isStackable')}
                onCheckedChange={(checked) => setValue('isStackable', checked as boolean)}
              />
              <Label htmlFor="isStackable" className="font-normal">
                Cho phép kết hợp với mã khác
              </Label>
            </div>
          </div>
        </div>

        {/* Time Range */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Thời gian hiệu lực</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startsAt">Ngày bắt đầu *</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                className={cn(errors.startsAt && 'border-red-500')}
                {...register('startsAt')}
              />
              {errors.startsAt && (
                <p className="text-sm text-red-500">{errors.startsAt.message}</p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Ngày kết thúc</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                {...register('expiresAt')}
              />
              <p className="text-xs text-gray-500">
                Để trống nếu không có hạn
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              'Tạo mã giảm giá'
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/coupons">Hủy</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

