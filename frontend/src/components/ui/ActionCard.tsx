import React from 'react'
import clsx from 'clsx'
import { Card } from './Card'

export interface ActionCardAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  disabled?: boolean
}

export interface ActionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  actions: ActionCardAction[]
  loading?: boolean
  compact?: boolean
}

const variantClass: Record<NonNullable<ActionCardAction['variant']>, string> = {
  primary: 'text-primary-600 hover:text-primary-700',
  secondary: 'text-neutral-600 hover:text-neutral-700',
  danger: 'text-danger-600 hover:text-danger-700',
  ghost: 'text-neutral-500 hover:text-neutral-700',
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  actions,
  children,
  loading,
  compact = false,
  className,
  ...rest
}) => {
  return (
    <Card className={clsx('flex flex-col gap-3 group', compact ? 'p-3' : 'p-5', className, 'hover:shadow-md')} loading={loading} {...rest}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h3 className="text-sm font-semibold leading-tight text-neutral-800 truncate">{title}</h3>
          {description && <p className="text-xs text-neutral-500 truncate">{description}</p>}
        </div>
        <div className="flex gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {actions.map(a => (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              disabled={a.disabled || loading}
              className={clsx('inline-flex items-center gap-1 text-xs font-medium rounded-md px-2 py-1 transition focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed',
                variantClass[a.variant || 'secondary'],
                'hover:bg-neutral-50'
              )}
            >
              {a.icon && <span className="h-3.5 w-3.5 inline-flex items-center justify-center">{a.icon}</span>}
              {a.label}
            </button>
          ))}
        </div>
      </div>
      {children && (
        <div className="text-xs text-neutral-600 leading-relaxed space-y-2">
          {children}
        </div>
      )}
    </Card>
  )
}
