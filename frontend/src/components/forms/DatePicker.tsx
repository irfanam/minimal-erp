import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { useFormField } from './FormField'
import { format, startOfMonth, endOfMonth, addMonths, eachDayOfInterval, isSameDay, isToday } from 'date-fns'

export interface DatePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  disabled?: boolean
  loading?: boolean
  placeholder?: string
  error?: string
  className?: string
  name?: string
  minDate?: Date
  maxDate?: Date
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  disabled,
  loading,
  placeholder = 'Select date',
  error,
  className,
  name,
  minDate,
  maxDate,
}) => {
  const ctx = useFormField()
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(value || new Date())
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const popRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return
      if (buttonRef.current?.contains(e.target as Node)) return
      if (popRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const weekdayLabels = ['Su','Mo','Tu','We','Th','Fr','Sa']

  function select(d: Date) {
    if (disabled) return
    if (minDate && d < minDate) return
    if (maxDate && d > maxDate) return
    onChange?.(d)
    setOpen(false)
  }

  function monthNav(delta: number) {
    setMonth(m => addMonths(m, delta))
  }

  return (
    <div className={clsx('relative', className)}>
      <input type="hidden" name={name} value={value ? format(value, 'yyyy-MM-dd') : ''} />
      <button
        ref={buttonRef}
        id={ctx?.inputId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open || undefined}
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
        <span className={clsx(!value && 'text-neutral-400')}>{value ? format(value, 'yyyy-MM-dd') : placeholder}</span>
        <svg className={clsx('h-4 w-4 text-neutral-400')} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
        <div ref={popRef} className="absolute z-40 mt-1 w-72 rounded-md border border-neutral-200 bg-white shadow-lg p-3" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => monthNav(-1)} className="p-1 rounded hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Previous month">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="text-sm font-medium">{format(month, 'MMMM yyyy')}</div>
            <button type="button" onClick={() => monthNav(1)} className="p-1 rounded hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Next month">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs text-neutral-500 mb-1">
            {weekdayLabels.map(d => <div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 text-sm">
            {days.map(d => {
              const selected = value && isSameDay(d, value)
              const today = isToday(d)
              const outOfRange = (minDate && d < minDate) || (maxDate && d > maxDate)
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => select(d)}
                  disabled={outOfRange}
                  className={clsx(
                    'h-8 w-8 m-0.5 rounded-md flex items-center justify-center transition',
                    today && 'ring-1 ring-primary-400',
                    selected && 'bg-primary-500 text-white hover:bg-primary-600',
                    !selected && !outOfRange && 'hover:bg-neutral-100',
                    outOfRange && 'text-neutral-300 cursor-not-allowed'
                  )}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex justify-between">
            <button type="button" onClick={() => onChange?.(null)} className="text-xs text-neutral-500 hover:text-neutral-700">Clear</button>
            <button type="button" onClick={() => { setMonth(new Date()); }} className="text-xs text-neutral-500 hover:text-neutral-700">Today</button>
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  )
}
