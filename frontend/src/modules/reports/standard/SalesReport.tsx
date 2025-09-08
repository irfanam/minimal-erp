import React, { useState } from 'react'
import { ReportFilter, type FilterDefinition } from '../components/ReportFilter'
import { ReportChart } from '../components/ReportChart'
import { ReportTable, type TableColumn } from '../components/ReportTable'
import { ReportExport } from '../components/ReportExport'

interface Row { id: string; date: string; customer: string; amount: number; gst: number; total: number }

const filters: FilterDefinition[] = [
  { field: 'from', label: 'From', type: 'date' },
  { field: 'to', label: 'To', type: 'date' },
  { field: 'customer', label: 'Customer', type: 'select', options: ['Customer 1','Customer 2','Customer 3'] }
]

const columns: TableColumn<Row>[] = [
  { key: 'date', header: 'Date' },
  { key: 'customer', header: 'Customer' },
  { key: 'amount', header: 'Net', align: 'right' },
  { key: 'gst', header: 'GST', align: 'right' },
  { key: 'total', header: 'Total', align: 'right' }
]

const mock: Row[] = Array.from({ length: 14 }).map((_, i) => ({
  id: String(i+1),
  date: new Date(Date.now() - i * 86400000).toISOString(),
  customer: 'Customer ' + ((i % 3) + 1),
  amount: 1000 + i * 120,
  gst: (1000 + i * 120) * 0.18,
  total: (1000 + i * 120) * 1.18
}))

export const SalesReport: React.FC = () => {
  const [values, setValues] = useState<Record<string, any>>({})
  const filtered = mock.filter(r => (!values.customer || r.customer === values.customer))
  const totals = filtered.reduce((a,b) => ({ amount: a.amount + b.amount, gst: a.gst + b.gst, total: a.total + b.total }), { amount: 0, gst: 0, total: 0 })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-800">Sales Report</h2>
        <ReportExport onExport={f => console.log('export', f)} />
      </div>
      <ReportFilter filters={filters} values={values} onChange={setValues} />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <ReportChart type="bar" labels={filtered.map(r => new Date(r.date).toLocaleDateString())} datasets={[{ label: 'Sales', data: filtered.map(r => r.total), backgroundColor: '#2563eb' }]} />
          <ReportTable columns={columns} data={filtered.map(r => ({ ...r, date: new Date(r.date).toLocaleDateString() }))} />
        </div>
        <div className="space-y-4">
          <div className="rounded-md border border-neutral-200 bg-white p-4 text-[11px] space-y-1">
            <p className="flex justify-between"><span>Net</span><span>{totals.amount.toFixed(2)}</span></p>
            <p className="flex justify-between"><span>GST</span><span>{totals.gst.toFixed(2)}</span></p>
            <p className="flex justify-between font-medium text-neutral-800"><span>Total</span><span>{totals.total.toFixed(2)}</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
