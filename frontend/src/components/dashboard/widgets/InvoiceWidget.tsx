import React from 'react'
import { ChartWidget } from './ChartWidget'
import { DonutChart } from '../charts/ChartBase'

export const InvoiceWidget: React.FC = () => {
  const labels = ['Paid','Unpaid','Overdue']
  const data = [62, 28, 10]
  return (
    <ChartWidget title="Invoices" subtitle="Status Distribution" footer="MTD Summary">
      <DonutChart labels={labels} data={data} />
    </ChartWidget>
  )
}
