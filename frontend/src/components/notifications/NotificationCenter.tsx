import React, { useEffect, useState } from 'react'

export interface NotificationItem {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  createdAt: string
  read?: boolean
}

interface Props { items?: NotificationItem[]; onRead?: (id: string) => void }

export const NotificationCenter: React.FC<Props> = ({ items = [], onRead }) => {
  const [open, setOpen] = useState(false)
  const unread = items.filter(i => !i.read).length

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest?.('[data-notification-center]')) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" data-notification-center>
      <button onClick={() => setOpen(o => !o)} className="relative h-8 w-8 rounded-md flex items-center justify-center border border-neutral-300 bg-white hover:bg-neutral-50">
        <span className="i-heroicons-bell w-4 h-4 text-neutral-600" />
        {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger-600 text-[9px] text-white flex items-center justify-center font-medium">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-neutral-200 bg-white shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-neutral-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-700">Notifications</span>
            <span className="text-[10px] text-neutral-400">{unread} unread</span>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
            {items.length === 0 && <p className="p-4 text-[11px] text-neutral-500">No notifications</p>}
            {items.map(n => (
              <button key={n.id} onClick={() => onRead?.(n.id)} className={`w-full text-left px-3 py-2 text-[11px] flex flex-col gap-0.5 ${!n.read ? 'bg-primary-50/40' : 'hover:bg-neutral-50'}`}>
                <span className="font-medium text-neutral-700 flex items-center gap-1">{n.title}</span>
                <span className="text-neutral-500 line-clamp-2">{n.message}</span>
                <span className="text-[9px] text-neutral-400">{new Date(n.createdAt).toLocaleTimeString()}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
