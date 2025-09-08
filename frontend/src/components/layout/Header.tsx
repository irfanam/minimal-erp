import React, { useState, useRef, useEffect } from 'react'
import { IconButton } from '../ui'

interface HeaderProps {
  onToggleSidebar?: () => void
  onGlobalSearch?: (q: string) => void
  onLogout?: () => void
  user?: { name: string; role?: string }
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onGlobalSearch, onLogout, user }) => {
  const [search, setSearch] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement | null>(null)
  const notifRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    onGlobalSearch?.(search)
  }

  return (
    <header className="h-14 border-b border-neutral-200 bg-white flex items-center gap-3 px-3 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <button onClick={onToggleSidebar} className="p-2 rounded-md hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Toggle sidebar">
          <svg className="h-5 w-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <form onSubmit={submitSearch} className="hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search or type a command (Ctrl + K)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 rounded-md border border-neutral-300 bg-neutral-50 py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-neutral-400"
            />
            <svg className="absolute right-2 top-1.5 h-4 w-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
          </div>
        </form>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <IconButton label="Create" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" /></svg>} />
        <div className="relative" ref={notifRef}>
          <IconButton label="Notifications" icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} onClick={() => setNotifOpen(o=>!o)} />
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-md border border-neutral-200 bg-white shadow-lg p-3 text-sm z-40">
              <p className="text-neutral-500 text-xs mb-2">Notifications</p>
              <p className="text-neutral-600">No new notifications</p>
            </div>
          )}
        </div>
        <div className="relative" ref={userMenuRef}>
          <button onClick={() => setUserMenuOpen(o=>!o)} className="h-9 w-9 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-medium text-neutral-600 ring-offset-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
            {user?.name?.[0] || 'U'}
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-md border border-neutral-200 bg-white shadow-lg py-1 text-sm z-40">
              <div className="px-3 py-2 border-b border-neutral-100">
                <p className="text-neutral-800 text-sm font-medium truncate">{user?.name || 'User Name'}</p>
                <p className="text-neutral-500 text-xs truncate">{user?.role || 'Role'}</p>
              </div>
              <button className="w-full text-left px-3 py-2 hover:bg-neutral-50">Profile</button>
              <button className="w-full text-left px-3 py-2 hover:bg-neutral-50">Settings</button>
              <button className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-danger-600" onClick={onLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
