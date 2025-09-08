import React from 'react'
import clsx from 'clsx'
import { useFormField } from './FormField'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  error?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({
  className,
  label,
  description,
  error,
  disabled,
  ...props
}, ref) {
  const id = useFormField()?.inputId || props.id || `chk-${Math.random().toString(36).slice(2)}`
  const descId = description ? `${id}-desc` : undefined
  const errorId = error ? `${id}-err` : undefined
  const describedBy = [errorId, descId].filter(Boolean).join(' ') || undefined
  return (
    <div className={clsx('flex items-start gap-2', disabled && 'opacity-60 cursor-not-allowed')}>
      <div className="relative flex items-center h-5">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          aria-describedby={describedBy}
          aria-invalid={!!error || undefined}
          disabled={disabled}
          className={clsx(
            'h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 transition',
            'disabled:cursor-not-allowed',
            error && 'border-danger-500 text-danger-600 focus:ring-danger-500',
            className
          )}
          {...props}
        />
      </div>
      <label htmlFor={id} className="text-sm">
        <span className={clsx('font-medium', error ? 'text-danger-600' : 'text-neutral-700')}>{label}</span>
        {description && (
          <span id={descId} className="block text-neutral-500 text-xs mt-0.5">{description}</span>
        )}
        {error && <span id={errorId} className="block text-danger-600 text-xs mt-0.5">{error}</span>}
      </label>
    </div>
  )
})
