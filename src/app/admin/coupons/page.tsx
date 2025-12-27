import { Suspense } from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Plus, Ticket, Search, MoreVertical, Copy, Trash2, Edit } from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/shared/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const dynamic = 'force-dynamic';

async function getCoupons() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      _count: { select: { usages: true } },
    },
  });

  return coupons;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(value: number) {
  return value.toLocaleString('vi-VN') + ' ₫';
}

function getStatusBadge(coupon: any) {
  const now = new Date();
  
  if (coupon.status === 'INACTIVE') {
    return <Badge variant="secondary">Không hoạt động</Badge>;
  }
  
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return <Badge variant="destructive">Đã hết hạn</Badge>;
  }
  
  if (coupon.startsAt > now) {
    return <Badge variant="outline">Chưa bắt đầu</Badge>;
  }
  
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return <Badge variant="secondary">Đã hết lượt</Badge>;
  }
  
  return <Badge variant="ce">Đang hoạt động</Badge>;
}

function getDiscountDisplay(coupon: any) {
  const value = Number(coupon.discountValue);
  
  switch (coupon.discountType) {
    case 'PERCENTAGE':
      return `${value}%`;
    case 'FIXED_AMOUNT':
      return formatCurrency(value);
    case 'FREE_SHIPPING':
      return 'Miễn phí ship';
    case 'BUY_X_GET_Y':
      return 'Mua X tặng Y';
    case 'BUNDLE':
      return 'Bundle';
    default:
      return formatCurrency(value);
  }
}

export default async function AdminCouponsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role as string)) {
    redirect('/login');
  }

  const coupons = await getCoupons();

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mã giảm giá</h1>
          <p className="mt-1 text-gray-500">
            Quản lý mã giảm giá và khuyến mãi
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/coupons/new">
            <Plus className="mr-2 h-4 w-4" />
            Tạo mã mới
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-2xl font-bold text-gray-900">{coupons.length}</div>
          <div className="text-sm text-gray-500">Tổng mã giảm giá</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-2xl font-bold text-green-600">
            {coupons.filter((c) => c.status === 'ACTIVE').length}
          </div>
          <div className="text-sm text-gray-500">Đang hoạt động</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-2xl font-bold text-blue-600">
            {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
          </div>
          <div className="text-sm text-gray-500">Lượt sử dụng</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-2xl font-bold text-amber-600">
            {coupons.filter((c) => c.expiresAt && c.expiresAt < new Date()).length}
          </div>
          <div className="text-sm text-gray-500">Đã hết hạn</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm mã giảm giá..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Giảm giá</TableHead>
              <TableHead>Sử dụng</TableHead>
              <TableHead>Thời hạn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                  <Ticket className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  Chưa có mã giảm giá nào
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm font-semibold">
                        {coupon.code}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(coupon.code)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{coupon.name}</div>
                      {coupon.description && (
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {coupon.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-ce-primary">
                      {getDiscountDisplay(coupon)}
                    </span>
                    {coupon.maxDiscount && (
                      <div className="text-xs text-gray-500">
                        Tối đa {formatCurrency(Number(coupon.maxDiscount))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {coupon.usedCount}
                      {coupon.usageLimit && (
                        <span className="text-gray-400">/{coupon.usageLimit}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(coupon.startsAt)}</div>
                      {coupon.expiresAt && (
                        <div className="text-gray-500">
                          → {formatDate(coupon.expiresAt)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(coupon)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/coupons/${coupon.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

