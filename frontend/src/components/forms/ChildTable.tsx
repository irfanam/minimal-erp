import React, { useState } from 'react'
import { PlusIcon, TrashIcon, Bars2Icon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export interface ChildTableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  key: string
  header: string
  width?: string | number
  render?: (row: T, onChange: (patch: Partial<T>) => void, rowIndex: number) => React.ReactNode
  className?: string
  isNumber?: boolean
  computed?: (row: T, all: T[]) => unknown
  editable?: boolean
}

export interface ChildTableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  value: T[]
  onChange: (rows: T[]) => void
  columns: ChildTableColumn<T>[]
  newRow: () => T
  allowDelete?: boolean
  minRows?: number
  maxRows?: number
  footerTotals?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export function ChildTable<T extends Record<string, unknown> = Record<string, unknown>>({
  value,
  onChange,
  columns,
  newRow,
  allowDelete = true,
  minRows = 0,
  maxRows,
  footerTotals = true,
  className,
  size = 'md'
}: ChildTableProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const handleAdd = () => {
    if (maxRows && value.length >= maxRows) return
    onChange([...value, newRow()])
  }

  const handleDelete = (idx: number) => {
    if (!allowDelete) return
    if (value.length <= minRows) return
    const next = [...value]
    next.splice(idx, 1)
    onChange(next)
  }

  const patchRow = (idx: number, patch: Partial<T>) => {
    const next = value.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    onChange(next)
  }

  const totals: Record<string, number> = {}
  if (footerTotals) {
    columns.forEach(c => {
      if (c.isNumber) {
  totals[c.key] = value.reduce((sum, row) => sum + (Number((row as Record<string, unknown>)[c.key]) || 0), 0)
      }
    })
  }

  return (
    <div className={clsx('border rounded-md overflow-hidden bg-white shadow-sm', className)}>
      <table className={clsx('w-full text-sm', size === 'sm' && 'text-xs')}>
        <thead className="bg-muted/40">
          <tr>
            <th className="w-6" />
            {columns.map(col => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined} className={clsx('text-left font-medium px-2 py-2 border-b border-border/40', col.className)}>{col.header}</th>
            ))}
            {allowDelete && <th className="w-8" />}
          </tr>
        </thead>
        <tbody>
          {value.length === 0 && (
            <tr>
              <td colSpan={columns.length + (allowDelete ? 2 : 1)} className="text-center text-muted-foreground py-4">No rows</td>
            </tr>
          )}
          {value.map((row, idx) => (
            <tr key={idx} className={clsx('group border-b border-border/30 hover:bg-muted/20 transition-colors', dragIndex === idx && 'opacity-50')}
              draggable
              onDragStart={() => setDragIndex(idx)}
              onDragOver={e => {
                e.preventDefault()
                if (dragIndex === null || dragIndex === idx) return
              }}
              onDrop={e => {
                e.preventDefault()
                if (dragIndex === null || dragIndex === idx) return
                const next = [...value]
                const [moved] = next.splice(dragIndex, 1)
                next.splice(idx, 0, moved)
                onChange(next)
                setDragIndex(null)
              }}
              onDragEnd={() => setDragIndex(null)}
            >
              <td className="pl-2 pr-1 align-top py-1 cursor-move text-muted-foreground"><Bars2Icon className="h-4 w-4" /></td>
              {columns.map(col => {
                const computed = col.computed ? col.computed(row, value) : undefined
                const cellValue = computed !== undefined ? computed : (row as Record<string, unknown>)[col.key]
                return (
                  <td key={col.key} className={clsx('px-2 py-1 align-top', col.isNumber && 'text-right tabular-nums', col.className)}>
                    {col.render && col.editable !== false
                      ? col.render(row, patch => patchRow(idx, patch), idx)
                      : <span>{String(cellValue ?? '')}</span>}
                  </td>
                )
              })}
              {allowDelete && (
                <td className="pr-2 pl-1 align-top py-1">
                  <button type="button" onClick={() => handleDelete(idx)} className="opacity-0 group-hover:opacity-100 transition text-red-600 hover:text-red-700">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        {footerTotals && value.length > 0 && (
          <tfoot>
            <tr className="bg-muted/30 font-medium">
              <td />
              {columns.map(col => (
                <td key={col.key} className={clsx('px-2 py-1', col.isNumber && 'text-right tabular-nums')}>
                  {col.isNumber ? totals[col.key]?.toFixed(2) : ''}
                </td>
              ))}
              {allowDelete && <td />}
            </tr>
          </tfoot>
        )}
      </table>
      <div className="p-2 border-t bg-muted/30 flex justify-between items-center">
        <button type="button" onClick={handleAdd} className="inline-flex items-center gap-1 text-primary hover:text-primary-600 text-xs font-medium">
          <PlusIcon className="h-4 w-4" /> Add Row
        </button>
        <div className="text-xs text-muted-foreground">{value.length} row{value.length !== 1 && 's'}</div>
      </div>
    </div>
  )
}
