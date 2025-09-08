import React from 'react'
import clsx from 'clsx'
import { Card } from './Card'

export interface DataCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  avatar?: React.ReactNode
  actions?: React.ReactNode
  footer?: React.ReactNode
  loading?: boolean
  dense?: boolean
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  subtitle,
  avatar,
  actions,
  footer,
  children,
  loading,
  dense = false,
  className,
  ...rest
}) => {
  return (
    <Card className={clsx('flex flex-col', dense ? 'p-3' : 'p-5', className)} loading={loading} {...rest}>
      {(title || actions) && (
        <div className={clsx('flex items-start gap-3', children && 'mb-4')}>
          {avatar && <div className="shrink-0">{avatar}</div>}
          <div className="flex-1 min-w-0">
            {title && <h3 className="text-sm font-semibold leading-tight text-neutral-800 truncate">{title}</h3>}
            {subtitle && <p className="text-xs text-neutral-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0 ml-auto flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children && (
        <div className={clsx('text-sm text-neutral-700 space-y-3', footer && 'mb-4')}>
          {children}
        </div>
      )}
      {footer && (
        <div className="pt-3 mt-auto border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between gap-3">
          {footer}
        </div>
      )}
    </Card>
  )
}
