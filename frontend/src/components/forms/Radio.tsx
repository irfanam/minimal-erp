import React from 'react'
import clsx from 'clsx'

export interface RadioOption { value: string; label: string; description?: string }

export interface RadioGroupProps {
  name: string
  value?: string
  onChange?: (value: string) => void
  options: RadioOption[]
  disabled?: boolean
  error?: string
  inline?: boolean
  className?: string
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  options,
  disabled,
  error,
  inline,
  className,
}) => {
  return (
    <div className={clsx('space-y-2', inline && 'flex flex-wrap gap-4 items-center space-y-0', className)} role="radiogroup" aria-invalid={!!error || undefined}>
      {options.map(opt => {
        const id = `${name}-${opt.value}`
        return (
          <label key={opt.value} htmlFor={id} className={clsx('flex items-start gap-2 cursor-pointer', disabled && 'cursor-not-allowed opacity-60')}>
            <input
              type="radio"
              name={name}
              id={id}
              value={opt.value}
              disabled={disabled}
              checked={value === opt.value}
              onChange={(e) => onChange?.(e.target.value)}
              className={clsx(
                'h-4 w-4 border-neutral-300 text-primary-600 focus:ring-primary-500',
                error && 'border-danger-500 text-danger-600 focus:ring-danger-500'
              )}
            />
            <span className="text-sm">
              <span className={clsx('font-medium', error ? 'text-danger-600' : 'text-neutral-700')}>{opt.label}</span>
              {opt.description && <span className="block text-neutral-500 text-xs mt-0.5">{opt.description}</span>}
            </span>
          </label>
        )
      })}
      {error && <p className="text-xs text-danger-600 mt-1">{error}</p>}
    </div>
  )
}
