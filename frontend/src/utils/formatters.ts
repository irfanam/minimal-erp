import { format, parseISO } from 'date-fns'

export function formatDate(value?: string | Date | null, pattern = 'yyyy-MM-dd') {
  if (!value) return ''
  const d = typeof value === 'string' ? parseISO(value) : value
  return format(d, pattern)
}

export function formatCurrency(amount?: number | null, currency = 'USD', locale = 'en-US') {
  if (amount == null) return ''
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
}

export function formatNumber(n?: number | null, decimals = 2, locale = 'en-US') {
  if (n == null) return ''
  return new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n)
}
