import React, { useCallback, useEffect, useRef, useState } from 'react'
import { PageHeader } from '../components/layout'
import { SalesWidget } from '../components/dashboard/widgets/SalesWidget'
import { InventoryWidget } from '../components/dashboard/widgets/InventoryWidget'
import { InvoiceWidget } from '../components/dashboard/widgets/InvoiceWidget'
import { ActivityWidget } from '../components/dashboard/widgets/ActivityWidget'
import { QuickActionsWidget } from '../components/dashboard/widgets/QuickActionsWidget'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'
import type { WidgetMeta } from '../components/dashboard/WidgetControls'
import { WidgetControls } from '../components/dashboard/WidgetControls'

interface DashboardWidgetInstance extends WidgetMeta {
  component: React.ReactNode
  w: number
  h: number
  x: number
  y: number
}

const initialWidgets: DashboardWidgetInstance[] = []

const COLS = 12
const ROW_HEIGHT = 110

const Dashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<DashboardWidgetInstance[]>(() => initialWidgets)
  const { data, isLoading, error, refetch, isFetching } = useDashboardMetrics({ refetchIntervalMs: 60000 })
  const [dragging, setDragging] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)

  const addWidget = () => {
    const id = `sales-${Date.now()}`
    setWidgets(w => [...w, { id, title: 'Sales (copy)', component: <SalesWidget metrics={data} loading={isLoading} /> , w: 4, h: 2, x: 0, y: 0 }])
  }
  const removeWidget = (id: string) => setWidgets(ws => ws.filter(w => w.id !== id))
  const onRefresh = (_id: string) => { refetch() }
  const startDrag = (id: string) => setDragging(id)
  const endDrag = () => setDragging(null)

  const onDrag = useCallback((e: React.MouseEvent, id: string) => {
    if (!dragging || dragging !== id) return
    const rect = gridRef.current?.getBoundingClientRect()
    if (!rect) return
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top
    const colWidth = rect.width / COLS
    const newX = Math.max(0, Math.min(COLS - 1, Math.floor(relX / colWidth)))
    const newY = Math.max(0, Math.floor(relY / ROW_HEIGHT))
    setWidgets(ws => ws.map(w => w.id === id ? { ...w, x: newX, y: newY } : w))
  }, [dragging])

  // Initialize default widgets once metrics available or on mount
  useEffect(() => {
    setWidgets(w => {
      if (w.length > 0) return w
      return [
        { id: 'sales', title: 'Sales', component: <SalesWidget metrics={data} loading={isLoading} error={error?.message} fetching={isFetching} />, w: 4, h: 2, x: 0, y: 0 },
        { id: 'inventory', title: 'Inventory', component: <InventoryWidget metrics={data} loading={isLoading} error={error?.message} fetching={isFetching} />, w: 4, h: 2, x: 4, y: 0 },
        { id: 'invoices', title: 'Invoices', component: <InvoiceWidget metrics={data} loading={isLoading} error={error?.message} fetching={isFetching} />, w: 4, h: 2, x: 8, y: 0 },
        { id: 'activity', title: 'Recent Activity', component: <ActivityWidget metrics={data} loading={isLoading} error={error?.message} fetching={isFetching} />, w: 6, h: 3, x: 0, y: 2 },
        { id: 'quick', title: 'Quick Actions', component: <QuickActionsWidget metrics={data} loading={isLoading} error={error?.message} fetching={isFetching} />, w: 6, h: 3, x: 6, y: 2 },
      ]
    })
  }, [data, isLoading, error, isFetching])

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" breadcrumbs={[{ label: 'Home' }]} actions={[{ label: isFetching ? 'Refreshing...' : 'Refresh', disabled: isFetching, variant: 'secondary', onClick: () => refetch() }]} />
      {error && (
        <div className="p-3 text-xs rounded bg-red-50 border border-red-200 text-red-600 flex items-center justify-between">
          <span>Error loading metrics: {error.message}</span>
          <button onClick={() => refetch()} className="px-2 py-1 text-[10px] rounded bg-red-600 text-white">Retry</button>
        </div>
      )}
      <WidgetControls widgets={widgets.map(w => ({ id: w.id, title: w.title, removable: true }))} onAdd={addWidget} onRemove={removeWidget} onRefresh={onRefresh} />
      <div ref={gridRef} className="relative w-full" style={{ minHeight: 5 * ROW_HEIGHT }}>
  {widgets.map(w => (
          <div
            key={w.id}
            className="absolute select-none"
            style={{
              width: `calc(${(w.w / COLS) * 100}% - 0.5rem)`,
              left: `calc(${(w.x / COLS) * 100}%)`,
              top: w.y * ROW_HEIGHT,
              height: w.h * ROW_HEIGHT - 16,
              transition: dragging === w.id ? 'none' : 'transform 200ms, top 200ms',
            }}
            onMouseDown={() => startDrag(w.id)}
            onMouseUp={endDrag}
            onMouseMove={(e) => onDrag(e, w.id)}
          >
            <div className="h-full">{w.component}</div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-neutral-400">Drag widgets (resize & settings upcoming).</p>
    </div>
  )
}

export default Dashboard
