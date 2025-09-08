import React from 'react'
import { ChartWidget } from './ChartWidget'
import { DonutChart } from '../charts/ChartBase'

interface Props { metrics?: any; loading?: boolean; error?: string; fetching?: boolean }

export const InvoiceWidget: React.FC<Props> = ({ metrics, loading, error, fetching }) => {
  if (loading) return <ChartWidget title="Invoices" subtitle="Loading" footer=""><div className="animate-pulse h-20 bg-neutral-100 rounded" /></ChartWidget>
  if (error) return <ChartWidget title="Invoices" subtitle="Error" footer=""><span className="text-[11px] text-red-600">{error}</span></ChartWidget>
  const pending = metrics?.sales?.pending_invoices || metrics?.sales?.pendingInvoices || 0
  const outstanding = Number(metrics?.financial?.outstanding_receivables || 0)
  const revenue = Number(metrics?.financial?.monthly_revenue || 0)
  const labels = ['Pending', 'Outstanding', 'Revenue']
  const data = [pending, outstanding, revenue]
  return (
    <ChartWidget title="Invoices" subtitle="Financial" footer={fetching ? 'Refreshing…' : 'MTD'}>
      <DonutChart labels={labels} data={data} />
    </ChartWidget>
  )
}
