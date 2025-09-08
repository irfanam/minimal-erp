import React, { useEffect, useMemo, useState, useRef } from 'react'
import { DataTable } from '../../components/tables/DataTable'
import type { DataTableColumn } from '../../components/tables/DataTable'
import type { Customer } from './types'
import { Button } from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '../../hooks/useCustomers'

const CustomerList: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 25

  // debounce search input
  // lightweight debounce without external util
  const debounceRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => setDebouncedSearch(search), 400)
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current) }
  }, [search])

  const { items, total, isLoading, isFetching, error } = useCustomers({ page, page_size: pageSize, search: debouncedSearch })

  const columns: DataTableColumn<Customer>[] = useMemo(() => ([
    { key: 'name', header: 'Name', render: c => <span className="font-medium text-neutral-800">{c.name}</span> },
    { key: 'email', header: 'Email', render: c => c.email || <span className="text-neutral-400">—</span> },
    { key: 'phone', header: 'Phone', render: c => c.phone || <span className="text-neutral-400">—</span> },
    { key: 'status', header: 'Status', render: c => <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.status === 'Active' ? 'bg-success-50 text-success-700 ring-1 ring-success-600/20' : 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-500/20'}`}>{c.status}</span> },
    { key: 'type', header: 'Type' },
    { key: 'territory', header: 'Territory' },
    { key: 'customerGroup', header: 'Group' },
    { key: 'balance', header: 'Balance', render: c => c.balance ? c.currency + c.balance.toFixed(2) : '—', align: 'right' },
    { key: 'actions', header: '', render: c => (
      <div className="flex items-center gap-2 text-xs">
        <button onClick={() => navigate(`/customers/${c.id}`)} className="text-primary-600 hover:underline">View</button>
        <button onClick={() => navigate(`/customers/${c.id}/edit`)} className="text-neutral-600 hover:underline">Edit</button>
      </div>
    ) }
  ]), [navigate])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-neutral-800">Customers</h1>
          {isFetching && !isLoading && <span className="text-[10px] text-neutral-400">Refreshing…</span>}
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            placeholder="Search customers..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="h-9 flex-1 md:w-64 rounded-md border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
          <Button size="sm" onClick={() => navigate('/customers/new')}>New Customer</Button>
        </div>
      </div>
      {error && (
        <div className="rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700">
          Failed to load customers. <button className="underline" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
      {isLoading ? (
        <div className="grid gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-neutral-100" />
          ))}
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={items as Customer[]} exportable responsiveCards />
          <div className="flex items-center justify-between text-xs text-neutral-600 mt-2">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="secondary" disabled={page===1} onClick={() => setPage(p=>p-1)}>Prev</Button>
              <Button size="sm" variant="secondary" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>Next</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CustomerList
