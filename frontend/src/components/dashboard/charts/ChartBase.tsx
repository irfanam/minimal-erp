import React from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js'
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend)

export interface ChartContainerProps {
  title?: string
  subtitle?: string
  height?: number
  actions?: React.ReactNode
  children?: React.ReactNode
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ title, subtitle, height = 240, actions, children }) => {
  return (
    <div className="flex flex-col h-full">
      {(title || actions) && (
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-0.5 min-w-0">
            {title && <h3 className="text-sm font-medium text-neutral-700 truncate">{title}</h3>}
            {subtitle && <p className="text-[11px] text-neutral-500 truncate">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-1">{actions}</div>}
        </div>
      )}
      <div style={{ height }} className="relative">
        {children}
      </div>
    </div>
  )
}

export const LineChart: React.FC<{labels: string[]; data: number[]; color?: string}> = ({ labels, data, color = '#2563eb' }) => {
  return <Line options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} data={{ labels, datasets: [{ data, borderColor: color, backgroundColor: color + '33', tension: 0.35, fill: true, pointRadius: 2 }] }} />
}

export const BarChart: React.FC<{labels: string[]; data: number[]; color?: string}> = ({ labels, data, color = '#2563eb' }) => {
  return <Bar options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} data={{ labels, datasets: [{ data, backgroundColor: color }] }} />
}

export const PieChart: React.FC<{labels: string[]; data: number[]; colors?: string[]}> = ({ labels, data, colors }) => {
  const palette = colors || ['#2563eb', '#0ea5e9', '#6366f1', '#14b8a6', '#f59e0b', '#ef4444']
  return <Pie options={{ responsive: true, maintainAspectRatio: false }} data={{ labels, datasets: [{ data, backgroundColor: palette, borderWidth: 0 }] }} />
}

export const DonutChart: React.FC<{labels: string[]; data: number[]; colors?: string[]}> = ({ labels, data, colors }) => {
  const palette = colors || ['#2563eb', '#0ea5e9', '#6366f1', '#14b8a6', '#f59e0b', '#ef4444']
  return <Doughnut options={{ cutout: '65%', responsive: true, maintainAspectRatio: false }} data={{ labels, datasets: [{ data, backgroundColor: palette, borderWidth: 0 }] }} />
}
