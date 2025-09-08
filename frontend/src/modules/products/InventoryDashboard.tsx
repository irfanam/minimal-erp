import React from 'react'
import { StockIndicator } from './components/StockIndicator'

interface StockItem { id: string; name: string; quantity: number; reorderLevel: number }

const mockStock: StockItem[] = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i+1),
  name: 'Item ' + (i+1),
  quantity: Math.floor(Math.random()*300),
  reorderLevel: 60
}))

export const InventoryDashboard: React.FC = () => {
  const low = mockStock.filter(s => s.quantity <= s.reorderLevel)
  const top = [...mockStock].sort((a,b) => b.quantity - a.quantity).slice(0,5)
  const slow = [...mockStock].sort((a,b) => a.quantity - b.quantity).slice(0,5)

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold tracking-tight text-neutral-800">Inventory Overview</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-neutral-700">Stock Levels</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockStock.map(s => (
                <div key={s.id} className="rounded-md border border-neutral-200 bg-white p-3 space-y-2">
                  <div className="text-xs font-medium text-neutral-700 line-clamp-1">{s.name}</div>
                  <StockIndicator quantity={s.quantity} reorderLevel={s.reorderLevel} />
                </div>
              ))}
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-neutral-700">Fast / Slow Moving</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-md border border-neutral-200 bg-white p-3">
                <p className="text-[11px] font-medium text-neutral-600 mb-2">Top Moving</p>
                <ul className="space-y-1 text-[11px] text-neutral-600">
                  {top.map(i => <li key={i.id} className="flex justify-between"><span className="truncate pr-2">{i.name}</span><span>{i.quantity}</span></li>)}
                </ul>
              </div>
              <div className="rounded-md border border-neutral-200 bg-white p-3">
                <p className="text-[11px] font-medium text-neutral-600 mb-2">Slow Moving</p>
                <ul className="space-y-1 text-[11px] text-neutral-600">
                  {slow.map(i => <li key={i.id} className="flex justify-between"><span className="truncate pr-2">{i.name}</span><span>{i.quantity}</span></li>)}
                </ul>
              </div>
            </div>
          </section>
        </div>
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-neutral-700">Low Stock Alerts</h2>
            <div className="rounded-md border border-danger-200 bg-danger-50/40 p-3 space-y-2">
              {low.length === 0 && <p className="text-[11px] text-neutral-500">No low stock items.</p>}
              {low.map(i => (
                <div key={i.id} className="flex items-center justify-between text-[11px]">
                  <span className="truncate pr-2">{i.name}</span>
                  <span className="font-medium text-danger-600">{i.quantity}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-neutral-700">Warehouse Stock (Demo)</h2>
            <div className="rounded-md border border-neutral-200 bg-white p-3 text-[11px] text-neutral-600 space-y-1">
              <p className="flex justify-between"><span>Main WH</span><span>12,450</span></p>
              <p className="flex justify-between"><span>Secondary WH</span><span>4,210</span></p>
              <p className="flex justify-between"><span>Transit</span><span>840</span></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
