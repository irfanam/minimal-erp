import React from 'react'
import type { ElementType } from 'react'
import clsx from 'clsx'

export interface CardOwnProps {
  padded?: boolean
  hoverable?: boolean
  loading?: boolean
  elevation?: 'none' | 'sm' | 'md'
}

export type CardProps<T extends ElementType = 'div'> = CardOwnProps & {
  as?: T
} & Omit<React.ComponentPropsWithoutRef<T>, keyof CardOwnProps | 'as'>

const elevationMap = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow',
}

export const Card = <T extends ElementType = 'div'>(props: CardProps<T>) => {
  const { className, padded = true, hoverable = false, loading = false, elevation = 'sm', as, children, ...rest } = props
  const Component = (as || 'div') as ElementType
  return (
    <Component
      className={clsx(
        'relative rounded-md bg-white border border-neutral-200/70 transition',
        elevationMap[elevation],
        hoverable && 'hover:shadow-md hover:border-neutral-300',
        padded && 'p-4',
        loading && 'overflow-hidden',
        className
      )}
      {...(rest as any)}
    >
      {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" aria-hidden />}
      {children}
    </Component>
  )
}

// Skeleton helper
export const CardSkeleton: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className }) => {
  return (
    <div className={clsx('animate-pulse space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded bg-neutral-200" />
      ))}
    </div>
  )
}
