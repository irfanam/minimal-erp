import React from 'react'
import clsx from 'clsx'
import { useFormField } from './FormField'

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  loading?: boolean
  error?: string
  autoResize?: boolean
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea({
  className,
  disabled,
  loading,
  error,
  autoResize = false,
  onInput,
  ...props
}, ref) {
  const ctx = useFormField()
  const describedBy = [ctx?.descriptionId, ctx?.errorId].filter(Boolean).join(' ') || undefined

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    if (autoResize) {
      const el = e.currentTarget
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
    onInput?.(e)
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        id={ctx?.inputId}
        aria-invalid={!!error || !!ctx?.errorId || undefined}
        aria-describedby={describedBy}
        disabled={disabled || loading}
        onInput={handleInput}
        className={clsx(
          'block w-full rounded-md border bg-white text-sm placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition shadow-sm resize-y',
          'border-neutral-300 hover:border-neutral-400',
          'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500',
          (error || ctx?.errorId) && 'border-danger-500 focus:ring-danger-500 focus:border-danger-500',
          loading && 'text-transparent',
          autoResize && 'overflow-hidden resize-none',
          className
        )}
        {...props}
      />
      {loading && (
        <span className="absolute top-2 right-2 flex items-center">
          <svg className="animate-spin h-4 w-4 text-neutral-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </span>
      )}
    </div>
  )
})
