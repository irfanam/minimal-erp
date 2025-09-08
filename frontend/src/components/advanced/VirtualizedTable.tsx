import React, { useCallback, useRef, useState } from 'react'

interface Column<T> { key: keyof T | string; header: string; width: number; render?: (row: T) => React.ReactNode }
interface Props<T> { columns: Column<T>[]; data: T[]; height?: number; rowHeight?: number }

export function VirtualizedTable<T extends { id?: string }>({ columns, data, height = 400, rowHeight = 34 }: Props<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const totalHeight = data.length * rowHeight
  const start = Math.floor(scrollTop / rowHeight)
  const end = Math.min(data.length, start + Math.ceil(height / rowHeight) + 5)
  const visible = data.slice(start, end)

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div className="border border-neutral-200 rounded-md bg-white overflow-hidden">
      <div className="flex text-[11px] bg-neutral-50 border-b border-neutral-200">
        {columns.map(c => (
          <div key={String(c.key)} style={{ width: c.width }} className="px-2 py-2 font-medium text-neutral-600 truncate">{c.header}</div>
        ))}
      </div>
      <div ref={containerRef} onScroll={onScroll} style={{ height }} className="relative overflow-auto text-[11px]">
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visible.map((row, i) => (
            <div key={(row.id || start + i) as any} style={{ position: 'absolute', top: (start + i) * rowHeight, height: rowHeight }} className={`flex items-center border-b border-neutral-100 hover:bg-neutral-50`}> 
              {columns.map(c => (
                <div key={String(c.key)} style={{ width: c.width }} className="px-2 truncate">{c.render ? c.render(row) : (row as any)[c.key]}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
