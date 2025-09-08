import React from 'react'
import clsx from 'clsx'
import { Card } from './Card'

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  icon?: React.ReactNode
  change?: number // percentage (+/-)
  loading?: boolean
  trendLabel?: string
  muted?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  change,
  loading,
  trendLabel,
  className,
  muted = false,
  ...rest
}) => {
  const positive = typeof change === 'number' && change > 0
  const negative = typeof change === 'number' && change < 0
  return (
    <Card className={clsx('p-4 flex flex-col gap-2', muted && 'bg-neutral-50')} loading={loading} {...rest}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase truncate">{label}</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-semibold text-neutral-800 leading-tight truncate">{value}</p>
            {typeof change === 'number' && (
              <span className={clsx(
                'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset',
                positive && 'bg-success-50 text-success-700 ring-success-600/20',
                negative && 'bg-danger-50 text-danger-700 ring-danger-600/20',
                !positive && !negative && 'bg-neutral-100 text-neutral-600 ring-neutral-500/20'
              )}>
                {positive && <svg className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3l5.5 5.5h-4v8h-3v-8h-4L10 3z"/></svg>}
                {negative && <svg className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 17l-5.5-5.5h4v-8h3v8h4L10 17z"/></svg>}
                {Math.abs(change)}%
              </span>
            )}
          </div>
          {trendLabel && (
            <p className="text-[11px] text-neutral-500 truncate">{trendLabel}</p>
          )}
        </div>
        {icon && (
          <div className={clsx('h-10 w-10 flex items-center justify-center rounded-md',
            positive && 'bg-success-50 text-success-600',
            negative && 'bg-danger-50 text-danger-600',
            !positive && !negative && 'bg-primary-50 text-primary-600'
          )}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
