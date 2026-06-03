/**
 * Formatting utilities for currency and numbers
 */

/**
 * Format a number as INR currency.
 * Example: formatINR(1234.56) → "₹1,234.56"
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number as INR with more precision for unit prices.
 * Example: formatINRPrecise(0.05) → "₹0.0500"
 */
export function formatINRPrecise(amount: number): string {
  if (amount < 1) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(amount);
  }
  return formatINR(amount);
}

/**
 * Format a number with commas (Indian numbering system).
 * Example: formatNumber(1234567) → "12,34,567"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Generate a unique order number.
 * Format: ORD-YYYYMMDD-XXXX (random 4 hex chars)
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  const rand = Math.random().toString(16).substring(2, 6).toUpperCase();
  return `ORD-${dateStr}-${rand}`;
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Safely parse a numeric string from the DB (NUMERIC type returns strings in Drizzle).
 */
export function parseNumeric(value: string | number | null): number {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(parsed) ? 0 : parsed;
}
