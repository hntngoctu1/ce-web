/**
 * Money Utilities
 * 
 * Handles currency formatting and calculations with proper precision.
 */

import { Prisma } from '@prisma/client';

/**
 * Default currency
 */
export const DEFAULT_CURRENCY = 'VND';

/**
 * Currency decimal places
 */
const CURRENCY_DECIMALS: Record<string, number> = {
  VND: 0,
  USD: 2,
  EUR: 2,
  JPY: 0,
  KRW: 0,
  CNY: 2,
};

/**
 * Get decimal places for a currency
 */
export function getCurrencyDecimals(currency: string): number {
  return CURRENCY_DECIMALS[currency.toUpperCase()] ?? 2;
}

/**
 * Format money for display
 */
export function formatMoney(
  amount: number | Prisma.Decimal | string,
  currency = DEFAULT_CURRENCY,
  locale = 'vi-VN'
): string {
  const numericAmount = typeof amount === 'number' 
    ? amount 
    : Number(amount);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: getCurrencyDecimals(currency),
    maximumFractionDigits: getCurrencyDecimals(currency),
  }).format(numericAmount);
}

/**
 * Format number without currency symbol
 */
export function formatNumber(
  amount: number | Prisma.Decimal | string,
  locale = 'vi-VN'
): string {
  const numericAmount = typeof amount === 'number' 
    ? amount 
    : Number(amount);

  return new Intl.NumberFormat(locale).format(numericAmount);
}

/**
 * Convert to Prisma Decimal
 */
export function toDecimal(value: number | string): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

/**
 * Add Decimals
 */
export function addDecimals(...values: (Prisma.Decimal | number | string)[]): Prisma.Decimal {
  return values.reduce<Prisma.Decimal>((sum, val) => {
    return sum.add(new Prisma.Decimal(val));
  }, new Prisma.Decimal(0));
}

/**
 * Multiply Decimals
 */
export function multiplyDecimal(
  a: Prisma.Decimal | number | string,
  b: Prisma.Decimal | number | string
): Prisma.Decimal {
  return new Prisma.Decimal(a).mul(new Prisma.Decimal(b));
}

/**
 * Compare Decimals
 */
export function compareDecimals(
  a: Prisma.Decimal | number | string,
  b: Prisma.Decimal | number | string
): number {
  return new Prisma.Decimal(a).comparedTo(new Prisma.Decimal(b));
}

/**
 * Check if Decimal is zero
 */
export function isZero(value: Prisma.Decimal | number | string): boolean {
  return new Prisma.Decimal(value).isZero();
}

/**
 * Check if Decimal is positive
 */
export function isPositive(value: Prisma.Decimal | number | string): boolean {
  return new Prisma.Decimal(value).isPositive() && !isZero(value);
}

/**
 * Check if Decimal is negative
 */
export function isNegative(value: Prisma.Decimal | number | string): boolean {
  return new Prisma.Decimal(value).isNegative();
}

/**
 * Round to currency precision
 */
export function roundToCurrency(
  amount: Prisma.Decimal | number | string,
  currency = DEFAULT_CURRENCY
): Prisma.Decimal {
  const decimals = getCurrencyDecimals(currency);
  return new Prisma.Decimal(amount).toDecimalPlaces(decimals);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(
  amount: Prisma.Decimal | number | string,
  percentage: number
): Prisma.Decimal {
  return new Prisma.Decimal(amount).mul(percentage).div(100);
}

