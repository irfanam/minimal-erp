import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend)

export type ChartKind = 'bar' | 'line' | 'doughnut'

interface Props {
  type: ChartKind
  labels: string[]
  datasets: { label: string; data: number[]; backgroundColor?: string; borderColor?: string }[]
  height?: number
}

export const ReportChart: React.FC<Props> = ({ type, labels, datasets, height = 220 }) => {
  const data = { labels, datasets: datasets.map(d => ({ ...d, borderWidth: 1 })) }
  const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }
  return (
    <div style={{ height }} className="relative">
      {type === 'bar' && <Bar data={data} options={options} />}
      {type === 'line' && <Line data={data} options={options} />}
      {type === 'doughnut' && <Doughnut data={data} options={options} />}
    </div>
  )
}
