import React, { useMemo, useState } from 'react'
import type { DataTableColumn } from '../../components/tables/DataTable'
import { DataTable } from '../../components/tables/DataTable'
import { PaymentTracker } from './components/PaymentTracker'
import { Button } from '../../components/ui/Button'

interface Invoice {
  id: string
  invoiceNo: string
  customer: string
  date: string
  dueDate: string
  status: 'Draft' | 'Submitted' | 'Paid'
  total: number
  paid: number
  currency: string
}

const mockInvoices: Invoice[] = Array.from({ length: 28 }).map((_, i) => ({
  id: String(i+1),
  invoiceNo: 'INV-' + (1000 + i),
  customer: 'Customer ' + ((i % 10) + 1),
  date: new Date(Date.now() - i * 86400000).toISOString(),
  dueDate: new Date(Date.now() + (7 - i % 14) * 86400000).toISOString(),
  status: (['Draft','Submitted','Paid'] as const)[i % 3],
  total: 4000 + i * 150,
  paid: i % 3 === 2 ? 4000 + i * 150 : (i % 3 === 1 ? (4000 + i * 150) * 0.5 : 0),
  currency: '₹'
}))

const InvoiceList: React.FC = () => {
  const [customerFilter, setCustomerFilter] = useState('')
  const filtered = mockInvoices.filter(i => !customerFilter || i.customer === customerFilter)

  const columns: DataTableColumn<Invoice>[] = useMemo(() => ([
    { key: 'invoiceNo', header: 'Invoice', render: i => <span className="font-medium text-neutral-800">{i.invoiceNo}</span> },
    { key: 'customer', header: 'Customer' },
    { key: 'date', header: 'Date', render: i => new Date(i.date).toLocaleDateString() },
    { key: 'dueDate', header: 'Due', render: i => new Date(i.dueDate).toLocaleDateString() },
    { key: 'status', header: 'Status', render: i => <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ring-1 ${i.status === 'Paid' ? 'bg-success-50 text-success-700 ring-success-600/20' : i.status === 'Submitted' ? 'bg-primary-50 text-primary-700 ring-primary-600/20' : 'bg-neutral-100 text-neutral-600 ring-neutral-500/20'}`}>{i.status}</span> },
    { key: 'payment', header: 'Payment', render: i => <PaymentTracker info={{ total: i.total, paid: i.paid, dueDate: i.dueDate }} /> },
    { key: 'total', header: 'Total', render: i => i.currency + i.total.toFixed(2), align: 'right' },
  ]), [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-neutral-800">Invoices</h1>
          <p className="text-[11px] text-neutral-500">{filtered.length} invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} className="h-8 rounded-md border border-neutral-300 px-2 text-xs">
            <option value="">All Customers</option>
            {[...new Set(mockInvoices.map(o => o.customer))].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button size="sm">New Invoice</Button>
        </div>
      </div>
      <DataTable columns={columns} data={filtered} exportable responsiveCards />
    </div>
  )
}

export default InvoiceList
