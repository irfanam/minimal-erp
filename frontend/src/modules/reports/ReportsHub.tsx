import React, { useState } from 'react'
import { SalesReport } from './standard/SalesReport'
import { InventoryReport } from './standard/InventoryReport'
import { ProfitLossReport } from './standard/ProfitLossReport'
import { GSTReport } from './standard/GSTReport'
import { CustomerStatement } from './standard/CustomerStatement'
import { ReportBuilder } from './ReportBuilder'
import { ReportScheduler } from './components/ReportScheduler'
import type { FilterDefinition } from './components/ReportFilter'
import { ReportFilter } from './components/ReportFilter'
import { ReportExport } from './components/ReportExport'

const categories = {
  Sales: ['Sales Report','Customer Statement'],
  Inventory: ['Inventory Report'],
  Accounting: ['Profit & Loss','GST Report'],
  Custom: ['Report Builder']
}

const filterDefs: FilterDefinition[] = [
  { field: 'q', label: 'Search', type: 'text' },
  { field: 'category', label: 'Category', type: 'select', options: Object.keys(categories) }
]

const ReportsHub: React.FC = () => {
  const [active, setActive] = useState<string>('Sales Report')
  const [favorites, setFavorites] = useState<string[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [schedules, setSchedules] = useState<any[]>([])

  const toggleFav = (r: string) => setFavorites(f => f.includes(r) ? f.filter(x => x !== r) : [...f, r])
  const openReport = (r: string) => {
    setActive(r)
    setRecent(rc => [r, ...rc.filter(x => x !== r)].slice(0,8))
  }

  const allReports = Object.entries(categories).flatMap(([cat, reps]) => reps.map(r => ({ cat, name: r })))
  const filtered = allReports.filter(r => (!filters.q || r.name.toLowerCase().includes(filters.q.toLowerCase())) && (!filters.category || r.cat === filters.category))

  const renderActive = () => {
    switch (active) {
      case 'Sales Report': return <SalesReport />
      case 'Inventory Report': return <InventoryReport />
      case 'Profit & Loss': return <ProfitLossReport />
      case 'GST Report': return <GSTReport />
      case 'Customer Statement': return <CustomerStatement />
      case 'Report Builder': return <ReportBuilder />
      default: return <div className="text-xs text-neutral-500">Select a report</div>
    }
  }

  const exportHub = (format: 'csv' | 'xlsx' | 'pdf') => {
    console.log('export hub summary', format)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-neutral-800">Reports & Analytics</h1>
          <p className="text-[11px] text-neutral-500">Powerful reporting hub with standard and custom reports</p>
        </div>
        <ReportExport onExport={exportHub} />
      </div>
      <ReportFilter filters={filterDefs} values={filters} onChange={setFilters} />
      <div className="grid gap-6 md:grid-cols-4">
        <div className="space-y-6 md:col-span-1">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-700">Reports</h4>
            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
              {filtered.map(r => (
                <button key={r.name} onClick={() => openReport(r.name)} className={`w-full flex items-center justify-between text-left text-[11px] rounded-md px-2 py-1.5 border ${active === r.name ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>
                  <span className="truncate pr-2">{r.name}</span>
                  <span onClick={(e) => { e.stopPropagation(); toggleFav(r.name) }} className={`text-[10px] ${favorites.includes(r.name) ? 'text-primary-500' : 'text-neutral-400'} cursor-pointer`}>★</span>
                </button>
              ))}
              {filtered.length === 0 && <p className="text-[11px] text-neutral-500">No reports</p>}
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-700">Favorites</h4>
            <div className="space-y-1">
              {favorites.length === 0 && <p className="text-[11px] text-neutral-500">None</p>}
              {favorites.map(f => (
                <button key={f} onClick={() => openReport(f)} className="w-full text-left text-[11px] rounded-md px-2 py-1.5 bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100">{f}</button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-700">Recent</h4>
            <div className="space-y-1">
              {recent.length === 0 && <p className="text-[11px] text-neutral-500">None</p>}
              {recent.map(r => (
                <button key={r} onClick={() => openReport(r)} className="w-full text-left text-[11px] rounded-md px-2 py-1.5 bg-white border border-neutral-200 hover:bg-neutral-50">{r}</button>
              ))}
            </div>
          </div>
          <ReportScheduler schedules={schedules} onChange={setSchedules} />
        </div>
        <div className="md:col-span-3 space-y-6">
          {renderActive()}
        </div>
      </div>
    </div>
  )
}

export default ReportsHub
