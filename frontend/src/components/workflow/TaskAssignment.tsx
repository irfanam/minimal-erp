import React, { useState } from 'react'

interface Assignment { id: string; user: string; role?: string; dueDate?: string }
interface Props { assignments: Assignment[]; onChange?: (a: Assignment[]) => void }

export const TaskAssignment: React.FC<Props> = ({ assignments, onChange }) => {
  const [local, setLocal] = useState(assignments)
  const add = () => {
    const next = [...local, { id: String(Date.now()), user: '', role: '' }]
    setLocal(next); onChange?.(next)
  }
  const update = (id: string, patch: Partial<Assignment>) => {
    const next = local.map(a => a.id === id ? { ...a, ...patch } : a)
    setLocal(next); onChange?.(next)
  }
  const remove = (id: string) => {
    const next = local.filter(a => a.id !== id)
    setLocal(next); onChange?.(next)
  }
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-neutral-700">Task Assignment</h4>
      <div className="space-y-2">
        {local.map(a => (
          <div key={a.id} className="rounded-md border border-neutral-200 bg-white p-3 grid sm:grid-cols-4 gap-2 items-center">
            <input value={a.user} onChange={e => update(a.id, { user: e.target.value })} placeholder="User" className="h-8 rounded-md border border-neutral-300 px-2 text-[11px]" />
            <input value={a.role || ''} onChange={e => update(a.id, { role: e.target.value })} placeholder="Role" className="h-8 rounded-md border border-neutral-300 px-2 text-[11px]" />
            <input type="date" value={a.dueDate?.slice(0,10) || ''} onChange={e => update(a.id, { dueDate: e.target.value })} className="h-8 rounded-md border border-neutral-300 px-2 text-[11px]" />
            <button onClick={() => remove(a.id)} className="text-[10px] text-danger-600">Remove</button>
          </div>
        ))}
        {local.length === 0 && <p className="text-[11px] text-neutral-500">No assignments.</p>}
      </div>
      <button onClick={add} className="text-[11px] text-primary-600 hover:underline">Add Assignment</button>
    </div>
  )
}
