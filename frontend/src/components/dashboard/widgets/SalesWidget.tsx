import React from 'react'
import { ChartWidget } from './ChartWidget'
import { LineChart } from '../charts/ChartBase'

export const SalesWidget: React.FC = () => {
  const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const data = [1200, 1900, 1500, 2200, 1800, 2500, 2100]
  return (
    <ChartWidget title="Sales" subtitle="Last 7 days" footer="Updated 5 min ago">
      <LineChart labels={labels} data={data} />
    </ChartWidget>
  )
}
