import React, { useState, useMemo, useEffect } from 'react'
import clsx from 'clsx'
import { TablePagination } from './TablePagination'
import { TableActions } from './TableActions'
import type { TableAction } from './TableActions'
import { TableFilters } from './TableFilters'
import { Card, CardSkeleton } from '../ui'

export interface DataTableColumn<T> {
  key: keyof T | string
  header: string
  width?: number
  sortable?: boolean
  render?: (row: T) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  hidden?: boolean
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  loading?: boolean
  total?: number
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  actions?: TableAction[]
  onSelectionChange?: (selected: T[]) => void
  getRowId?: (row: T) => string
  filtersEnabled?: boolean
  emptyMessage?: string
  responsiveCards?: boolean
  exportable?: boolean
}

interface InternalRow<T> { id: string; original: T; selected: boolean }

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  total,
  page = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  actions,
  onSelectionChange,
  getRowId = (r: any) => r.id || JSON.stringify(r),
  filtersEnabled = true,
  emptyMessage = 'No records found',
  responsiveCards = true,
  exportable = true,
}: DataTableProps<T>) {
  const [rows, setRows] = useState<InternalRow<T>[]>([])
  const [allSelected, setAllSelected] = useState(false)
  const [search, setSearch] = useState('')
  const [showColumnsMenu, setShowColumnsMenu] = useState(false)

  useEffect(() => {
    setRows(data.map(d => ({ id: getRowId(d), original: d, selected: false })))
  }, [data, getRowId])

  const visibleCols = columns.filter(c => !c.hidden)

  const filteredRows = useMemo(() => {
    if (!search) return rows
    return rows.filter(r => JSON.stringify(r.original).toLowerCase().includes(search.toLowerCase()))
  }, [rows, search])

  function toggleRow(id: string) {
    setRows(rs => rs.map(r => r.id === id ? { ...r, selected: !r.selected } : r))
  }

  function toggleAll() {
    setAllSelected(a => !a)
    setRows(rs => rs.map(r => ({ ...r, selected: !allSelected })))
  }

  useEffect(() => {
    onSelectionChange?.(rows.filter(r => r.selected).map(r => r.original))
  }, [rows, onSelectionChange])

  function exportCSV() {
    const headers = visibleCols.map(c => c.header)
    const lines = filteredRows.map(r => visibleCols.map(c => {
      const val = c.render ? c.render(r.original) : (r.original as any)[c.key as any]
      return typeof val === 'string' ? '"' + val.replace(/"/g, '""') + '"' : JSON.stringify(val)
    }))
    const csv = [headers.join(','), ...lines.map(l => l.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-56 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {exportable && (
          <button onClick={exportCSV} className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500">Export CSV</button>
        )}
        <button onClick={() => setShowColumnsMenu(s => !s)} className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500">Columns</button>
        {showColumnsMenu && (
          <div className="z-40 absolute mt-40 w-56 rounded-md border border-neutral-200 bg-white shadow-lg p-2 text-sm space-y-1">
            {columns.map((c,i) => (
              <label key={i} className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={!c.hidden} onChange={() => { c.hidden = !c.hidden; setShowColumnsMenu(false) }} /> {c.header}
              </label>
            ))}
          </div>
        )}
      </div>
      {actions && <TableActions actions={actions} selectedCount={rows.filter(r => r.selected).length} onClearSelection={() => setRows(rs => rs.map(r => ({...r, selected:false})))} />}
      {filtersEnabled && <TableFilters onChange={() => { /* integrate filter logic externally */ }} />}
  <Card padded className={clsx('overflow-x-auto', responsiveCards && 'md:overflow-visible')}>
        {loading ? (
          <CardSkeleton lines={8} />
        ) : filteredRows.length === 0 ? (
          <div className="py-16 text-center text-sm text-neutral-500">
            <p className="mb-2">{emptyMessage}</p>
            <p className="text-xs text-neutral-400">Try adjusting filters or create a new record.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-neutral-200 text-xs text-neutral-500">
                <th className="py-2 pr-2 w-6">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
                </th>
                {visibleCols.map(c => (
                  <th key={String(c.key)} className={clsx('py-2 pr-4 font-medium', c.align === 'right' && 'text-right', c.align === 'center' && 'text-center')} style={{ width: c.width }}>{c.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRows.map(r => (
                <tr key={r.id} className={clsx('hover:bg-neutral-50 transition', r.selected && 'bg-primary-50')}>
                  <td className="py-2 pr-2 align-top">
                    <input type="checkbox" checked={r.selected} onChange={() => toggleRow(r.id)} aria-label="Select row" />
                  </td>
                  {visibleCols.map(c => (
                    <td key={String(c.key)} className={clsx('py-2 pr-4 align-top', c.align === 'right' && 'text-right', c.align === 'center' && 'text-center')}>
                      {c.render ? c.render(r.original) : String(r.original[c.key as keyof typeof r.original] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      <TablePagination page={page} pageSize={pageSize} total={total ?? filteredRows.length} onPageChange={onPageChange || (()=>{})} onPageSizeChange={onPageSizeChange || (()=>{})} />
    </div>
  )
}
