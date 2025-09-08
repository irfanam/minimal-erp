import React from 'react'
import clsx from 'clsx'
import { Button } from '../ui'

export interface PageAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  disabled?: boolean
  loading?: boolean
}

export interface PageHeaderProps {
  title: string
  breadcrumbs?: { label: string; to?: string }[]
  actions?: PageAction[]
  status?: React.ReactNode
  onBack?: () => void
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  breadcrumbs,
  actions,
  status,
  onBack,
  className,
}) => {
  return (
    <div className={clsx('mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between', className)}>
      <div className="flex items-start gap-3">
        {onBack && (
          <button onClick={onBack} className="h-9 w-9 rounded-md border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Back">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <div className="space-y-1">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1 text-xs text-neutral-500" aria-label="Breadcrumb">
              {breadcrumbs.map((b, i) => (
                <span key={i} className="flex items-center gap-1">
                  {b.to ? <a href={b.to} className="hover:text-neutral-700">{b.label}</a> : <span>{b.label}</span>}
                  {i < breadcrumbs.length - 1 && <span>/</span>}
                </span>
              ))}
            </nav>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold tracking-tight text-neutral-800">{title}</h1>
            {status && <span>{status}</span>}
          </div>
        </div>
      </div>
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {actions.map(a => (
            <Button key={a.label} variant={a.variant} disabled={a.disabled} loading={a.loading}>{a.label}</Button>
          ))}
        </div>
      )}
    </div>
  )
}
