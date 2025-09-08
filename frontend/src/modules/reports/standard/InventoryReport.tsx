import React from 'react'
import { ReportChart } from '../components/ReportChart'
import { ReportTable, type TableColumn } from '../components/ReportTable'

interface Row { id: string; item: string; opening: number; inQty: number; outQty: number; closing: number }

const columns: TableColumn<Row>[] = [
  { key: 'item', header: 'Item' },
  { key: 'opening', header: 'Opening', align: 'right' },
  { key: 'inQty', header: 'In', align: 'right' },
  { key: 'outQty', header: 'Out', align: 'right' },
  { key: 'closing', header: 'Closing', align: 'right' }
]

const mock: Row[] = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i+1),
  item: 'Item ' + (i+1),
  opening: 100 + i * 5,
  inQty: 40 + i * 3,
  outQty: 30 + i * 2,
  closing: 100 + i * 5 + 40 + i * 3 - (30 + i * 2)
}))

export const InventoryReport: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-neutral-800">Inventory Report</h2>
      <ReportChart type="line" labels={mock.map(r => r.item)} datasets={[{ label: 'Closing', data: mock.map(r => r.closing), backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' }]} />
      <ReportTable columns={columns} data={mock} />
    </div>
  )
}
