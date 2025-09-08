import React from 'react'

export interface FilterDefinition {
  field: string
  label: string
  type: 'text' | 'select' | 'date' | 'number'
  options?: string[]
}

interface Props {
  filters: FilterDefinition[]
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
}

export const ReportFilter: React.FC<Props> = ({ filters, values, onChange }) => {
  const update = (field: string, value: any) => onChange({ ...values, [field]: value })
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map(f => (
        <div key={f.field} className="space-y-1">
          <label className="block text-[10px] font-medium text-neutral-600 uppercase tracking-wide">{f.label}</label>
          {f.type === 'select' ? (
            <select value={values[f.field] || ''} onChange={e => update(f.field, e.target.value)} className="h-8 rounded-md border border-neutral-300 px-2 text-xs min-w-[140px]">
              <option value="">All</option>
              {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : f.type === 'date' ? (
            <input type="date" value={values[f.field]?.slice(0,10) || ''} onChange={e => update(f.field, e.target.value)} className="h-8 rounded-md border border-neutral-300 px-2 text-xs" />
          ) : (
            <input type={f.type === 'number' ? 'number' : 'text'} value={values[f.field] || ''} onChange={e => update(f.field, e.target.value)} className="h-8 rounded-md border border-neutral-300 px-2 text-xs min-w-[140px]" />
          )}
        </div>
      ))}
    </div>
  )
}
