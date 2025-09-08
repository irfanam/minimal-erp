import React from 'react'
import { ReportTable, type TableColumn } from '../components/ReportTable'

interface Row { id: string; period: string; taxable: number; cgst: number; sgst: number; igst: number; total: number }

const columns: TableColumn<Row>[] = [
  { key: 'period', header: 'Period' },
  { key: 'taxable', header: 'Taxable', align: 'right' },
  { key: 'cgst', header: 'CGST', align: 'right' },
  { key: 'sgst', header: 'SGST', align: 'right' },
  { key: 'igst', header: 'IGST', align: 'right' },
  { key: 'total', header: 'Total GST', align: 'right' }
]

const mock: Row[] = Array.from({ length: 6 }).map((_, i) => ({
  id: String(i+1),
  period: `2025-0${i+1}`,
  taxable: 50000 + i * 5000,
  cgst: (50000 + i * 5000) * 0.09,
  sgst: (50000 + i * 5000) * 0.09,
  igst: 0,
  total: (50000 + i * 5000) * 0.18
}))

export const GSTReport: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-neutral-800">GST Report</h2>
      <ReportTable columns={columns} data={mock} />
    </div>
  )
}
