import React from 'react'
import { ChartWidget } from './ChartWidget'
import { BarChart } from '../charts/ChartBase'

interface Props { metrics?: any; loading?: boolean; error?: string; fetching?: boolean }

export const InventoryWidget: React.FC<Props> = ({ metrics, loading, error, fetching }) => {
  if (loading) return <ChartWidget title="Inventory Stock" subtitle="Loading" footer=""><div className="animate-pulse h-20 bg-neutral-100 rounded" /></ChartWidget>
  if (error) return <ChartWidget title="Inventory Stock" subtitle="Error" footer=""><span className="text-[11px] text-red-600">{error}</span></ChartWidget>
  const total = metrics?.inventory?.total_products || 0
  const low = metrics?.inventory?.low_stock || 0
  const labels = ['Total Products', 'Low Stock']
  const data = [total, low]
  return (
    <ChartWidget title="Inventory Stock" subtitle="Overview" footer={fetching ? 'Refreshing…' : 'Snapshot'}>
      <BarChart labels={labels} data={data} />
    </ChartWidget>
  )
}
