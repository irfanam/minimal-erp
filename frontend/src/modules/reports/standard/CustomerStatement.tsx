import React from 'react'
import { ReportTable, type TableColumn } from '../components/ReportTable'

interface Row { id: string; date: string; ref: string; description: string; debit: number; credit: number; balance: number }

const columns: TableColumn<Row>[] = [
  { key: 'date', header: 'Date' },
  { key: 'ref', header: 'Ref' },
  { key: 'description', header: 'Description' },
  { key: 'debit', header: 'Debit', align: 'right' },
  { key: 'credit', header: 'Credit', align: 'right' },
  { key: 'balance', header: 'Balance', align: 'right' }
]

const mock: Row[] = Array.from({ length: 18 }).map((_, i) => ({
  id: String(i+1),
  date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
  ref: 'INV-' + (1000 + i),
  description: 'Invoice Payment',
  debit: i % 3 === 0 ? 0 : 0,
  credit: i % 3 === 0 ? 0 : 1200 + i * 10,
  balance: 5000 - i * 120
}))

export const CustomerStatement: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-neutral-800">Customer Statement</h2>
      <ReportTable columns={columns} data={mock} />
    </div>
  )
}
