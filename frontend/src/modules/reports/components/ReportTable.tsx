import React from 'react'

export interface TableColumn<T> { key: keyof T | string; header: string; align?: 'left' | 'right' | 'center'; render?: (row: T) => React.ReactNode }

interface Props<T> {
  columns: TableColumn<T>[]
  data: T[]
  dense?: boolean
}

export function ReportTable<T extends { id?: string }>({ columns, data, dense }: Props<T>) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-[11px] border-separate border-spacing-y-1 ${dense ? 'tracking-tight' : ''}`}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={String(c.key)} className={`px-2 py-1 font-medium text-neutral-600 text-${c.align || 'left'}`}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} className="bg-white hover:bg-neutral-50">
              {columns.map(c => (
                <td key={String(c.key)} className={`px-2 py-1 text-${c.align || 'left'} ${c.align === 'right' ? 'font-medium text-neutral-800' : ''}`}>{c.render ? c.render(row) : (row as any)[c.key]}</td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-2 py-6 text-center text-[11px] text-neutral-500">No data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
