import React, { createContext, useContext, useEffect, useState } from 'react'

export interface AppNotification { id: string; level: 'info' | 'success' | 'warning' | 'error'; message: string; createdAt: string; read?: boolean }

interface NotificationState {
  notifications: AppNotification[]
  push(n: Omit<AppNotification,'id'|'createdAt'>): void
  markRead(id: string): void
  unread: number
}

const NotificationContext = createContext<NotificationState | null>(null)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const push = (n: Omit<AppNotification,'id'|'createdAt'>) => setNotifications(list => [...list, { ...n, id: String(Date.now()+Math.random()), createdAt: new Date().toISOString() }])
  const markRead = (id: string) => setNotifications(list => list.map(n => n.id === id ? { ...n, read: true } : n))
  const unread = notifications.filter(n => !n.read).length

  // Example: ephemeral connectivity notification
  useEffect(() => {
    const offline = () => push({ level: 'warning', message: 'You are offline' })
    const online = () => push({ level: 'success', message: 'Back online' })
    window.addEventListener('offline', offline)
    window.addEventListener('online', online)
    return () => { window.removeEventListener('offline', offline); window.removeEventListener('online', online) }
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, push, markRead, unread }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('NotificationProvider missing')
  return ctx
}
