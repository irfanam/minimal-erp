import React, { useMemo, useRef, useState, useEffect } from 'react'
import clsx from 'clsx'
import { useFormField } from './FormField'

export interface SelectOption { value: string; label: string }

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  loading?: boolean
  placeholder?: string
  searchable?: boolean
  error?: string
  className?: string
  name?: string
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  disabled,
  loading,
  placeholder = 'Select...',
  searchable = true,
  error,
  className,
  name,
}) => {
  const ctx = useFormField()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)

  const filtered = useMemo(() => {
    if (!searchable || !query) return options
    const q = query.toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(q))
  }, [options, searchable, query])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return
      if (buttonRef.current?.contains(e.target as Node)) return
      if (listRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  function select(val: string) {
    onChange?.(val)
    setOpen(false)
  }

  const activeOption = options.find(o => o.value === value)

  return (
    <div className={clsx('relative', className)}>
      <input type="hidden" name={name} value={value || ''} />
      <button
        ref={buttonRef}
        id={ctx?.inputId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open || undefined}
        aria-controls={open ? `${ctx?.inputId}-listbox` : undefined}
        disabled={disabled || loading}
        className={clsx(
          'w-full rounded-md border bg-white text-left text-sm px-3 py-2 shadow-sm transition flex items-center justify-between gap-2',
            'border-neutral-300 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500',
          'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500',
          (error || ctx?.errorId) && 'border-danger-500 focus:ring-danger-500',
          loading && 'text-transparent'
        )}
        onClick={() => setOpen(o => !o)}
      >
        <span className={clsx(!activeOption && 'text-neutral-400')}>{activeOption ? activeOption.label : placeholder}</span>
        <svg className={clsx('h-4 w-4 text-neutral-400 transition-transform', open && 'rotate-180')} viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <path d="M6 8l4 4 4-4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {loading && (
        <span className="absolute inset-y-0 right-2 flex items-center">
          <svg className="animate-spin h-4 w-4 text-neutral-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </span>
      )}
      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-neutral-200 bg-white shadow-lg focus:outline-none" role="dialog">
          {searchable && (
            <div className="p-2 border-b border-neutral-200">
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-neutral-400"
              />
            </div>
          )}
          <ul
            ref={listRef}
            id={`${ctx?.inputId}-listbox`}
            role="listbox"
            tabIndex={-1}
            className="max-h-60 overflow-auto py-1 text-sm"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-neutral-500">No results</li>
            )}
            {filtered.map(o => {
              const selected = o.value === value
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={selected || undefined}
                  onClick={() => select(o.value)}
                  onKeyDown={(e) => e.key === 'Enter' && select(o.value)}
                  tabIndex={0}
                  className={clsx(
                    'px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none',
                    selected && 'bg-primary-50 text-primary-700 font-medium'
                  )}
                >
                  {o.label}
                  {selected && (
                    <svg className="h-4 w-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  )
}
