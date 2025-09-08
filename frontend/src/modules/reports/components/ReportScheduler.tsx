import React, { useState } from 'react'

interface Schedule {
  id: string
  report: string
  frequency: 'Daily' | 'Weekly' | 'Monthly'
  time: string
  recipients: string
  active: boolean
}

interface Props {
  schedules: Schedule[]
  onChange: (s: Schedule[]) => void
}

export const ReportScheduler: React.FC<Props> = ({ schedules, onChange }) => {
  const [open, setOpen] = useState(false)
  const add = () => onChange([...schedules, { id: String(Date.now()), report: '', frequency: 'Daily', time: '09:00', recipients: '', active: true }])
  const update = (id: string, patch: Partial<Schedule>) => onChange(schedules.map(s => s.id === id ? { ...s, ...patch } : s))
  const remove = (id: string) => onChange(schedules.filter(s => s.id !== id))
  return (
    <div className="space-y-3">
      <button onClick={() => setOpen(o => !o)} className="text-[11px] text-primary-600 hover:underline">{open ? 'Hide Scheduler' : 'Report Scheduler'}</button>
      {open && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-medium text-neutral-700">Schedules</h4>
            <button onClick={add} className="text-[10px] text-primary-600">Add</button>
          </div>
          <div className="space-y-2">
            {schedules.map(s => (
              <div key={s.id} className="rounded-md border border-neutral-200 p-3 bg-white grid md:grid-cols-6 gap-2 items-end">
                <input value={s.report} onChange={e => update(s.id, { report: e.target.value })} placeholder="Report" className="h-8 rounded-md border border-neutral-300 px-2 text-[11px]" />
                <select value={s.frequency} onChange={e => update(s.id, { frequency: e.target.value as any })} className="h-8 rounded-md border border-neutral-300 px-2 text-[11px]">
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
                <input type="time" value={s.time} onChange={e => update(s.id, { time: e.target.value })} className="h-8 rounded-md border border-neutral-300 px-2 text-[11px]" />
                <input value={s.recipients} onChange={e => update(s.id, { recipients: e.target.value })} placeholder="Emails" className="h-8 rounded-md border border-neutral-300 px-2 text-[11px]" />
                <label className="flex items-center gap-1 text-[10px] font-medium text-neutral-600"><input type="checkbox" checked={s.active} onChange={e => update(s.id, { active: e.target.checked })} /> Active</label>
                <button onClick={() => remove(s.id)} className="text-[10px] text-danger-600">Remove</button>
              </div>
            ))}
            {schedules.length === 0 && <p className="text-[11px] text-neutral-500">No schedules configured.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
