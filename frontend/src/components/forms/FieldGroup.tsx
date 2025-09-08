import React from 'react'
import clsx from 'clsx'

export interface FieldGroupProps {
  columns?: 1 | 2 | 3 | 4
  children: React.ReactNode
  gap?: number // tailwind spacing value e.g., 4
  className?: string
}

export const FieldGroup: React.FC<FieldGroupProps> = ({ columns = 2, children, gap = 4, className }) => {
  return (
    <div className={clsx(
      'grid',
      columns === 1 && 'grid-cols-1',
      columns === 2 && 'grid-cols-1 sm:grid-cols-2',
      columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      `gap-${gap}`,
      className
    )}>
      {children}
    </div>
  )
}
