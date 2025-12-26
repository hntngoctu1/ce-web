'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/utils';
import { getProductImageFallback } from '@/lib/placeholders';

export default function CartPage() {
  const locale = useLocale();
  const t = useTranslations('cart');
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const isVi = locale?.toLowerCase().startsWith('vi');

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="ce-container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              {t('emptyTitle')}
            </h1>
            <p className="mb-8 text-gray-600">
              {t('emptySubtitle')}
            </p>
            <Button variant="ce" size="lg" asChild>
              <Link href="/menu/product">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('continueShopping')}
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 lg:py-12">
      <div className="ce-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            {t('title')}
          </h1>
          <p className="mt-1 text-gray-600">
            {isVi 
              ? `${totalItems} sản phẩm trong giỏ hàng` 
              : `${totalItems} item${totalItems > 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => {
                const imageSrc = item.image || getProductImageFallback(item.slug);
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Product Image */}
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      <Image
                        src={imageSrc}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link
                            href={`/product/${item.slug}`}
                            className="font-medium text-gray-900 hover:text-ce-primary"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-1 text-sm text-gray-500">
                            {formatPrice(item.price)} / {isVi ? 'sản phẩm' : 'item'}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Quantity & Total */}
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-white text-gray-600 transition-colors hover:bg-gray-50"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-lg font-bold text-ce-primary">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Button variant="outline" asChild>
                <Link href="/menu/product">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('continueShopping')}
                </Link>
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 rounded-2xl border bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                {isVi ? 'Tóm tắt đơn hàng' : 'Order Summary'}
              </h2>

              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between text-gray-600">
                  <span>{t('subtotal')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{isVi ? 'Phí vận chuyển' : 'Shipping'}</span>
                  <span className="text-green-600">
                    {isVi ? 'Miễn phí' : 'Free'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between py-4 text-lg font-bold">
                <span>{isVi ? 'Tổng cộng' : 'Total'}</span>
                <span className="text-ce-primary">{formatPrice(subtotal)}</span>
              </div>

              <Button variant="ce" size="lg" className="w-full" asChild>
                <Link href="/checkout">
                  {t('checkout')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <p className="mt-4 text-center text-xs text-gray-500">
                {isVi 
                  ? 'Thanh toán an toàn & bảo mật' 
                  : 'Secure & encrypted checkout'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

