import React from 'react'
import { ChartWidget } from './ChartWidget'
import { BarChart } from '../charts/ChartBase'

export const InventoryWidget: React.FC = () => {
  const labels = ['A','B','C','D','E','F']
  const data = [50, 20, 65, 30, 80, 15]
  return (
    <ChartWidget title="Inventory Stock" subtitle="Units by Category" footer="Min levels auto monitored">
      <BarChart labels={labels} data={data} />
    </ChartWidget>
  )
}
