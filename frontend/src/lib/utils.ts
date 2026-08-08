import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS classes with clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number with locale commas or compact format.
 */
export function formatNumber(num: number): string {
  if (isNaN(num) || num === null || num === undefined) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Formats a ratio/number as a percentage string.
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (isNaN(value) || value === null || value === undefined) return '0%'
  const formatted = value.toFixed(decimals)
  return `${formatted}%`
}

/**
 * Formats a date string, number, or Date instance into human readable format.
 */
export function formatDate(
  date: string | Date | number,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', options).format(d)
}

/**
 * Formats a numeric value as currency.
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Formats byte size into human readable string (KB, MB, GB, etc.).
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  if (isNaN(bytes) || bytes < 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Truncates text with trailing ellipsis if length exceeded.
 */
export function truncateText(text: string, length: number): string {
  if (!text) return ''
  if (text.length <= length) return text
  return `${text.slice(0, length)}...`
}

/**
 * Creates a debounced function that delays invoking fn until delay ms have elapsed.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * Returns uppercase initials from a user's full name (e.g. "John Doe" -> "JD").
 */
export function getInitials(name: string): string {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
