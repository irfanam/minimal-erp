import React, { useState } from 'react'
import clsx from 'clsx'

export interface FormSectionProps {
  id: string
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultCollapsed?: boolean
  completionRatio?: number // 0..1 for progress indicator
  errorCount?: number
  className?: string
  collapsible?: boolean
}

export const FormSection: React.FC<FormSectionProps> = ({
  id,
  title,
  icon,
  children,
  defaultCollapsed = false,
  completionRatio,
  errorCount = 0,
  className,
  collapsible = true,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  return (
    <section id={id} className={clsx('border rounded-md bg-white', className)}>
      <header className="flex items-center gap-2 px-4 py-2 border-b">
        {collapsible && (
          <button
            type="button"
            onClick={() => setCollapsed(c => !c)}
            className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-expanded={!collapsed}
            aria-controls={id + '-body'}
          >
            <svg className={clsx('h-3.5 w-3.5 transition-transform', !collapsed && 'rotate-90')} viewBox="0 0 20 20" fill="currentColor"><path d="M7 5l6 5-6 5V5z" /></svg>
          </button>
        )}
        {icon && <span className="h-5 w-5 text-neutral-500 flex items-center justify-center">{icon}</span>}
        <h2 className="text-sm font-semibold tracking-tight text-neutral-800 flex-1 truncate">{title}</h2>
        {typeof completionRatio === 'number' && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 bg-neutral-200 rounded overflow-hidden">
              <div className="h-full bg-primary-500" style={{ width: `${Math.min(100, Math.round(completionRatio * 100))}%` }} />
            </div>
          </div>
        )}
        {errorCount > 0 && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-danger-50 text-danger-600">{errorCount}</span>}
      </header>
      <div id={id + '-body'} className={clsx(collapsible && collapsed && 'hidden', 'p-4 space-y-4')}>{children}</div>
    </section>
  )
}
