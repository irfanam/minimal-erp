/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { Button } from '../ui'
import { DatePicker } from '../forms/DatePicker'
import { Input } from '../forms/Input'
import { Select } from '../forms/Select'

export interface TableFiltersProps {
  statuses?: { label: string; value: string }[]
  onChange?: (filters: Record<string, any>) => void
  savedFilters?: { name: string; values: Record<string, any> }[]
}

export const TableFilters: React.FC<TableFiltersProps> = ({ statuses = [], onChange, savedFilters = [] }) => {
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  function emit() {
    onChange?.({ dateFrom, dateTo, status, search })
  }

  return (
    <div className="border rounded-md p-4 bg-white space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-medium text-neutral-600 mb-1">Date From</p>
          <DatePicker value={dateFrom} onChange={(d) => { setDateFrom(d); emit() }} />
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-600 mb-1">Date To</p>
          <DatePicker value={dateTo} onChange={(d) => { setDateTo(d); emit() }} />
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-600 mb-1">Status</p>
          <Select options={[{label:'All', value:''}, ...statuses]} value={status} onChange={(v) => { setStatus(v); emit() }} />
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-600 mb-1">Search</p>
          <Input value={search} onChange={(e) => { setSearch(e.target.value); emit() }} placeholder="Search..." />
        </div>
      </div>
      {savedFilters.length > 0 && (
        <div>
          <p className="text-xs font-medium text-neutral-600 mb-1">Saved Filters</p>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map(f => (
              <Button key={f.name} size="sm" variant="ghost" onClick={() => { setDateFrom(f.values.dateFrom||null); setDateTo(f.values.dateTo||null); setStatus(f.values.status||''); setSearch(f.values.search||''); emit() }}>{f.name}</Button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => { setDateFrom(null); setDateTo(null); setStatus(''); setSearch(''); emit() }}>Clear All</Button>
      </div>
    </div>
  )
}
