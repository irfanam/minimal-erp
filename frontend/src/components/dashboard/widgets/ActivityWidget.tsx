import React from 'react'

interface ActivityItem { id: string; user: string; action: string; time: string }

const data: ActivityItem[] = [
  { id: '1', user: 'Jane', action: 'Created Invoice INV-00123', time: '2m ago' },
  { id: '2', user: 'Mark', action: 'Adjusted stock for PRD-004', time: '10m ago' },
  { id: '3', user: 'Jane', action: 'Received payment for INV-00120', time: '25m ago' },
  { id: '4', user: 'Sara', action: 'Added new customer Globex', time: '1h ago' },
]

interface Props { metrics?: any; loading?: boolean; error?: string; fetching?: boolean }

export const ActivityWidget: React.FC<Props> = ({ loading, error }) => {
  if (loading) return <div className="h-full flex flex-col rounded-md border border-neutral-200 bg-white p-4 shadow-sm"><div className="h-6 w-40 bg-neutral-100 animate-pulse mb-4" /><div className="space-y-2">{Array.from({length:4}).map((_,i)=><div key={i} className="h-6 bg-neutral-100 animate-pulse rounded" />)}</div></div>
  if (error) return <div className="h-full flex flex-col rounded-md border border-neutral-200 bg-white p-4 shadow-sm text-xs text-red-600">Error loading activity</div>
  return (
    <div className="h-full flex flex-col rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-neutral-700">Recent Activity</h3>
      </div>
      <ul className="flex-1 overflow-y-auto space-y-3 pr-1">
        {data.map(item => (
          <li key={item.id} className="flex items-start gap-3 text-xs">
            <span className="h-7 w-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium text-[11px]">
              {item.user[0]}
            </span>
            <div className="min-w-0">
              <p className="text-neutral-700 leading-snug truncate">{item.action}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
