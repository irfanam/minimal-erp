import React, { useState, useMemo } from 'react'
import clsx from 'clsx'
import { NavLink } from 'react-router-dom'

interface NavItem {
  label: string
  to: string
  icon?: React.ReactNode
  group?: string
}

const rawItems: NavItem[] = [
  { label: 'Dashboard', to: '/', group: 'General' },
  { label: 'Customers', to: '/customers', group: 'Selling' },
  { label: 'Sales Invoices', to: '/sales/invoices', group: 'Selling' },
  { label: 'Suppliers', to: '/suppliers', group: 'Buying' },
  { label: 'Purchase Orders', to: '/purchases/orders', group: 'Buying' },
  { label: 'Products', to: '/inventory/products', group: 'Stock' },
  { label: 'Inventory', to: '/inventory', group: 'Stock' },
  { label: 'Accounts', to: '/accounts', group: 'Accounting' },
  { label: 'Reports', to: '/reports', group: 'General' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  className?: string
  company?: { name: string; avatarUrl?: string }
  user?: { name: string; role?: string; avatarUrl?: string }
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, className, company, user }) => {
  const [search, setSearch] = useState('')
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  const groups = useMemo(() => {
    const map: Record<string, NavItem[]> = {}
    rawItems.forEach(i => {
      if (search && !i.label.toLowerCase().includes(search.toLowerCase())) return
      const g = i.group || 'Other'
      if (!map[g]) map[g] = []
      map[g].push(i)
    })
    return Object.entries(map).sort()
  }, [search])

  function toggleGroup(name: string) {
    setOpenGroups(g => ({ ...g, [name]: !g[name] }))
  }

  return (
    <aside className={clsx('relative h-full flex flex-col bg-neutral-900 text-neutral-200 transition-all duration-300', collapsed ? 'w-16' : 'w-60', className)}>
      <div className="flex items-center h-14 px-3 border-b border-neutral-800 gap-2">
        <button onClick={onToggle} className="p-2 rounded hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Toggle sidebar">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
        </button>
        {!collapsed && <span className="font-semibold text-sm tracking-wide">ERP</span>}
      </div>
      {!collapsed && (
        <div className="p-3 border-b border-neutral-800">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-800 placeholder-neutral-500 text-neutral-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <svg className="absolute right-2 top-1.5 h-4 w-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
          </div>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto thin-scrollbar px-2 py-2 space-y-2">
        {groups.map(([group, items]) => {
          const open = openGroups[group] ?? true
          return (
            <div key={group}>
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className="flex items-center justify-between w-full px-2 py-1 text-[11px] uppercase tracking-wide font-medium text-neutral-500 hover:text-neutral-300"
                >
                  <span>{group}</span>
                  <svg className={clsx('h-3 w-3 transition-transform', open ? 'rotate-90' : '')} viewBox="0 0 20 20" fill="currentColor"><path d="M7 5l6 5-6 5V5z" /></svg>
                </button>
              )}
              <div className={clsx('mt-1 space-y-1', !open && 'hidden')}> 
                {items.map(i => (
                  <NavLink
                    key={i.to}
                    to={i.to}
                    className={({ isActive }) => clsx(
                      'group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition',
                      'text-neutral-300 hover:text-white hover:bg-neutral-800',
                      isActive && 'bg-neutral-800 text-white shadow-inner'
                    )}
                  >
                    <span className="h-4 w-4 inline-flex items-center justify-center text-neutral-500 group-hover:text-neutral-300">
                      {/* placeholder icon */}
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><circle cx={10} cy={10} r={8} /></svg>
                    </span>
                    {!collapsed && <span className="truncate">{i.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>
      <div className="border-t border-neutral-800 p-3 text-xs flex items-center gap-2">
        <div className="h-8 w-8 rounded bg-neutral-700 flex items-center justify-center text-neutral-300 text-[11px] font-semibold">
          {company?.name?.[0] || 'C'}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-medium text-neutral-200 truncate">{company?.name || 'Company'}</p>
            <p className="text-neutral-500 truncate">{user?.name || 'User'}</p>
          </div>
        )}
      </div>
    </aside>
  )
}
