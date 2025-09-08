import React from 'react'
import type { CustomerMetricSummary } from '../../customers/types'

export const CustomerMetrics: React.FC<{ metrics: CustomerMetricSummary }> = ({ metrics }) => {
  const items: { label: string; value: string | number; hint?: string }[] = [
    { label: 'Invoices', value: metrics.totalInvoices },
    { label: 'Outstanding', value: metrics.outstanding.toFixed(2) },
    { label: 'Overdue', value: metrics.overdue.toFixed(2) },
    { label: 'Avg Pay Days', value: metrics.avgPaymentDays || '-' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map(i => (
        <div key={i.label} className="rounded-md border border-neutral-200 bg-white p-3 flex flex-col gap-1">
          <p className="text-[10px] font-medium tracking-wide text-neutral-500 uppercase">{i.label}</p>
          <p className="text-sm font-semibold text-neutral-800">{i.value}</p>
          {i.hint && <p className="text-[10px] text-neutral-400">{i.hint}</p>}
        </div>
      ))}
    </div>
  )
}
