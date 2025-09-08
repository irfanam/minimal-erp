import React, { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface MainLayoutProps {
  children: React.ReactNode
  company?: { name: string; avatarUrl?: string }
  user?: { name: string; role?: string; avatarUrl?: string }
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, company, user }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile sidebar on route change (placeholder: effect could listen to location)
  useEffect(() => {
    if (!mobileOpen) return
  }, [mobileOpen])

  return (
    <div className="h-screen w-full flex bg-neutral-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} company={company} user={user} />
      </div>
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-neutral-900/50" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-64">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} company={company} user={user} />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header
          onToggleSidebar={() => {
            if (window.innerWidth < 768) setMobileOpen(o => !o)
            else setCollapsed(c => !c)
          }}
          user={user}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 bg-neutral-50">
          {children}
        </main>
      </div>
    </div>
  )
}
