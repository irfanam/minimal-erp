// Component variants mapping to Tailwind utility class strings
export const components = {
  button: {
    base: 'inline-flex items-center gap-2 font-medium rounded-md shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2',
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-400',
    secondary: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 focus-visible:ring-primary-400',
    outline: 'border border-neutral-300 text-neutral-800 bg-white hover:bg-neutral-50 focus-visible:ring-primary-400',
    ghost: 'text-neutral-600 hover:bg-neutral-100',
    danger: 'bg-danger-500 text-white hover:bg-danger-600 focus-visible:ring-danger-400',
  },
  card: {
    base: 'bg-white rounded-lg shadow-card border border-neutral-100',
    header: 'px-5 py-4 border-b border-neutral-100 flex items-center justify-between gap-4',
    body: 'px-5 py-4 space-y-4',
    section: 'border-t border-neutral-100 px-5 py-4',
  },
  badge: {
    base: 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
    neutral: 'bg-neutral-100 text-neutral-700',
    success: 'bg-success-100 text-success-600',
    danger: 'bg-danger-100 text-danger-600',
    warning: 'bg-warning-100 text-warning-600',
    info: 'bg-primary-100 text-primary-700',
  },
  input: {
    base: 'block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
    error: 'border-danger-500 focus:border-danger-600 focus:ring-danger-500',
  },
}
export type ComponentToken = typeof components
