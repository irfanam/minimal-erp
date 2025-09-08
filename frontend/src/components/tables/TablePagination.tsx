import React from 'react'
import clsx from 'clsx'

export interface TablePaginationProps {
  page: number
  pageSize: number
  total: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  page,
  pageSize,
  total,
  pageSizeOptions = [10,20,50,100],
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const canPrev = page > 1
  const canNext = page < totalPages

  function pagesToRender() {
    const range: number[] = []
    const windowSize = 2
    for (let p = Math.max(1, page - windowSize); p <= Math.min(totalPages, page + windowSize); p++) {
      range.push(p)
    }
    if (range[0] !== 1) range.unshift(1)
    if (range[range.length - 1] !== totalPages) range.push(totalPages)
    return Array.from(new Set(range))
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs">
      <div className="flex items-center gap-2">
        <span className="text-neutral-600">Rows per page:</span>
        <select
          className="border border-neutral-300 rounded-md text-xs bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {pageSizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-neutral-500">{(page-1)*pageSize + 1}-{Math.min(page*pageSize, total)} of {total}</span>
      </div>
      <div className="flex items-center gap-1 justify-end">
        <button disabled={!canPrev} onClick={() => onPageChange(1)} className={clsx('px-2 py-1 rounded-md border text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed', !canPrev && 'pointer-events-none')} aria-label="First page">«</button>
        <button disabled={!canPrev} onClick={() => onPageChange(page-1)} className={clsx('px-2 py-1 rounded-md border text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed')} aria-label="Previous page">‹</button>
        {pagesToRender().map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={clsx('min-w-[2rem] px-2 py-1 rounded-md border text-neutral-600 hover:bg-neutral-50', p === page && 'bg-primary-500 border-primary-500 text-white hover:bg-primary-600')}
            aria-current={p === page || undefined}
          >{p}</button>
        ))}
        <button disabled={!canNext} onClick={() => onPageChange(page+1)} className={clsx('px-2 py-1 rounded-md border text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed')} aria-label="Next page">›</button>
        <button disabled={!canNext} onClick={() => onPageChange(totalPages)} className={clsx('px-2 py-1 rounded-md border text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed')} aria-label="Last page">»</button>
      </div>
    </div>
  )
}
