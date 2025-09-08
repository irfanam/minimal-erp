import React, { createContext, useContext, useState } from 'react'

interface AppState {
  sidebarOpen: boolean
  toggleSidebar(): void
  online: boolean
  setOnline(v: boolean): void
}

const AppContext = createContext<AppState | null>(null)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [online, setOnline] = useState<boolean>(navigator.onLine)

  React.useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  return (
    <AppContext.Provider value={{ sidebarOpen, toggleSidebar: () => setSidebarOpen(o => !o), online, setOnline }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('AppProvider missing')
  return ctx
}
