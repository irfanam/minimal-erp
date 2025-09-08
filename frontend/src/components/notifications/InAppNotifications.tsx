import React, { useEffect, useState } from 'react'

interface InAppNotification { id: string; message: string; createdAt: string; level?: 'info' | 'warning' | 'error' }
interface Props { feed?: InAppNotification[] }

export const InAppNotifications: React.FC<Props> = ({ feed = [] }) => {
  const [items, setItems] = useState<InAppNotification[]>(feed)

  // Placeholder for real-time (websocket) updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
  setItems(i => [{ id: String(Date.now()), message: 'Background sync completed', createdAt: new Date().toISOString(), level: 'info' as const }, ...i].slice(0, 20))
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-2">
      {items.slice(0,5).map(n => (
        <div key={n.id} className={`rounded-md border px-3 py-2 text-[11px] bg-white flex items-center gap-2 ${n.level === 'error' ? 'border-danger-200 bg-danger-50/40' : n.level === 'warning' ? 'border-warning-200 bg-warning-50/40' : 'border-neutral-200'}`}>
          <span className="flex-1 truncate text-neutral-700">{n.message}</span>
          <span className="text-[9px] text-neutral-400">{new Date(n.createdAt).toLocaleTimeString()}</span>
        </div>
      ))}
    </div>
  )
}
