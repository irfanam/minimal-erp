import React from 'react'

export interface TimelineEvent { id: string; status: string; at: string; by?: string; note?: string }
interface Props { events: TimelineEvent[] }

export const StatusTimeline: React.FC<Props> = ({ events }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-neutral-700">Status Timeline</h4>
      <ol className="relative border-l border-neutral-200 ml-2">
        {events.map(e => (
          <li key={e.id} className="ml-4 mb-4">
            <div className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-primary-600 border border-white" />
            <p className="text-[11px] font-medium text-neutral-800">{e.status} <span className="text-neutral-400 font-normal">• {new Date(e.at).toLocaleString()}</span></p>
            {e.by && <p className="text-[10px] text-neutral-500">By {e.by}</p>}
            {e.note && <p className="text-[10px] text-neutral-500 italic">{e.note}</p>}
          </li>
        ))}
        {events.length === 0 && <p className="text-[11px] text-neutral-500 ml-2">No events</p>}
      </ol>
    </div>
  )
}
