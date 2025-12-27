import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert any value to number (handles Prisma Decimal, string, number)
 */
export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  // Handle Prisma Decimal type
  if (typeof value === 'object' && value !== null) {
    const obj = value as { toNumber?: () => number; toString?: () => string };
    if (typeof obj.toNumber === 'function') return obj.toNumber();
    if (typeof obj.toString === 'function') return parseFloat(obj.toString()) || 0;
  }
  return 0;
}

export function formatPrice(
  price: number | string | unknown,
  currency: string = 'VND',
  locale: string = 'vi-VN'
): string {
  const numPrice = toNumber(price);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
}

export function formatDate(
  date: Date | string,
  locale: string = 'vi-VN',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

/**
 * @deprecated Use allocateOrderCode from '@/lib/orders/order-code' instead.
 * This generates a random order number, while allocateOrderCode provides
 * sequential, human-friendly codes (CE-YYYY-000123).
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CE-${timestamp}-${random}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getLocalizedField<T extends Record<string, unknown>>(
  obj: T,
  field: string,
  locale: string = 'en'
): string {
  const localizedKey = `${field}${locale.charAt(0).toUpperCase()}${locale.slice(1)}` as keyof T;
  const fallbackKey = `${field}En` as keyof T;

  return (obj[localizedKey] as string) || (obj[fallbackKey] as string) || '';
}
