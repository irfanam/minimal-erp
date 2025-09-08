import React from 'react'
import { ChartWidget } from './ChartWidget'
import { LineChart } from '../charts/ChartBase'

interface Props {
  metrics?: any
  loading?: boolean
  error?: string
  fetching?: boolean
}

export const SalesWidget: React.FC<Props> = ({ metrics, loading, error, fetching }) => {
  const labels = ['Sales']
  const total = metrics?.sales?.total_sales ? Number(metrics.sales.total_sales) : 0
  const data = [total]
  if (loading) return <ChartWidget title="Sales" subtitle="Loading" footer=""><div className="animate-pulse h-20 bg-neutral-100 rounded" /></ChartWidget>
  if (error) return <ChartWidget title="Sales" subtitle="Error" footer=""><button className="text-[11px] text-red-600">{error}</button></ChartWidget>
  return (
    <ChartWidget title="Sales" subtitle="Period" footer={fetching ? 'Refreshing…' : 'Up to date'}>
      <LineChart labels={labels} data={data} />
    </ChartWidget>
  )
}
