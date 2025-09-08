import React, { useState } from 'react'
import { ReportFilter, type FilterDefinition } from './components/ReportFilter'
import { ReportChart, type ChartKind } from './components/ReportChart'
import { ReportExport } from './components/ReportExport'

interface Field { key: string; label: string; numeric?: boolean }

const availableFields: Field[] = [
  { key: 'date', label: 'Date' },
  { key: 'customer', label: 'Customer' },
  { key: 'amount', label: 'Amount', numeric: true },
  { key: 'gst', label: 'GST', numeric: true },
  { key: 'total', label: 'Total', numeric: true }
]

const filters: FilterDefinition[] = [
  { field: 'from', label: 'From', type: 'date' },
  { field: 'to', label: 'To', type: 'date' },
  { field: 'customer', label: 'Customer', type: 'text' }
]

interface Row { id: string; date: string; customer: string; amount: number; gst: number; total: number }
const baseData: Row[] = Array.from({ length: 20 }).map((_, i) => ({
  id: String(i+1),
  date: new Date(Date.now() - i * 86400000).toISOString(),
  customer: 'Customer ' + ((i % 5) + 1),
  amount: 500 + i * 45,
  gst: (500 + i * 45) * 0.18,
  total: (500 + i * 45) * 1.18
}))

export const ReportBuilder: React.FC = () => {
  const [selected, setSelected] = useState<Field[]>([availableFields[0], availableFields[2], availableFields[4]])
  const [chartType, setChartType] = useState<ChartKind>('bar')
  const [values, setValues] = useState<Record<string, any>>({})
  const [saved, setSaved] = useState<{ id: string; name: string; fields: Field[]; chart: ChartKind }[]>([])
  const [name, setName] = useState('')

  const filtered = baseData.filter(r => (!values.customer || r.customer.includes(values.customer)))

  const save = () => {
    if (!name.trim()) return
    setSaved(s => [...s, { id: String(Date.now()), name: name.trim(), fields: selected, chart: chartType }])
    setName('')
  }

  const exportReport = (format: 'csv' | 'xlsx' | 'pdf') => {
    console.log('Export builder report', format)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-neutral-800">Report Builder</h1>
        <ReportExport onExport={exportReport} />
      </div>
      <ReportFilter filters={filters} values={values} onChange={setValues} />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="rounded-md border border-neutral-200 bg-white p-4 space-y-3">
            <h4 className="text-xs font-medium text-neutral-700">Fields</h4>
            <div className="flex flex-wrap gap-2">
              {availableFields.map(f => {
                const active = selected.some(s => s.key === f.key)
                return (
                  <button key={f.key} onClick={() => setSelected(s => active ? s.filter(x => x.key !== f.key) : [...s, f])} className={`h-7 px-2 rounded-md border text-[10px] font-medium ${active ? 'bg-primary-600 border-primary-600 text-white' : 'border-neutral-300 text-neutral-600 bg-white'}`}>{f.label}</button>
                )
              })}
            </div>
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-4 space-y-3">
            <h4 className="text-xs font-medium text-neutral-700">Chart</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {(['bar','line','doughnut'] as ChartKind[]).map(t => (
                <button key={t} onClick={() => setChartType(t)} className={`h-7 px-3 rounded-md text-[11px] font-medium border ${chartType === t ? 'bg-neutral-800 text-white border-neutral-800' : 'border-neutral-300 text-neutral-600 bg-white'}`}>{t}</button>
              ))}
            </div>
            <ReportChart
              type={chartType}
              labels={filtered.map(r => new Date(r.date).toLocaleDateString())}
              datasets={[{ label: 'Total', data: filtered.map(r => r.total), backgroundColor: '#2563eb', borderColor: '#2563eb' }]}
            />
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-4 space-y-3">
            <h4 className="text-xs font-medium text-neutral-700">Data</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-separate border-spacing-y-1">
                <thead>
                  <tr>
                    {selected.map(f => <th key={f.key} className="text-left font-medium text-neutral-600 px-2 py-1">{f.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className="bg-white hover:bg-neutral-50">
                      {selected.map(f => <td key={f.key} className="px-2 py-1">{f.numeric ? (r as any)[f.key].toFixed(2) : (f.key === 'date' ? new Date((r as any)[f.key]).toLocaleDateString() : (r as any)[f.key])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="space-y-6">
            <div className="rounded-md border border-neutral-200 bg-white p-4 space-y-3">
              <h4 className="text-xs font-medium text-neutral-700">Save Report</h4>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Report name" className="h-8 w-full rounded-md border border-neutral-300 px-2 text-xs" />
              <button onClick={save} className="h-8 w-full rounded-md bg-primary-600 text-white text-[11px] font-medium disabled:opacity-50" disabled={!name.trim()}>Save</button>
              <div className="space-y-2 border-t border-neutral-200 pt-2">
                {saved.map(s => (
                  <div key={s.id} className="flex items-center justify-between text-[11px] text-neutral-600">
                    <span className="truncate pr-2">{s.name}</span>
                    <span className="text-neutral-400">{s.chart}</span>
                  </div>
                ))}
                {saved.length === 0 && <p className="text-[11px] text-neutral-500">No saved reports.</p>}
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}
