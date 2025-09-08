import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ToastContext } from '../notifications/ToastNotifications'

/**
 * BulkOperations provides a selection model + action registry for performing
 * high‑volume mutations safely (e.g., status change, assignment, export).
 * Intended to wrap list/table views. Exposes context hooks for child toolbars.
 */

export interface BulkSelectionState<T extends { id: string | number }> {
  items: T[]
  selectedIds: Set<string | number>
  toggle(id: string | number): void
  toggleAll(): void
  clear(): void
  isSelected(id: string | number): boolean
  count: number
  allSelected: boolean
}

export interface BulkAction<T> {
  key: string
  label: string
  confirm?: boolean | ((selected: T[]) => boolean)
  onExecute: (selected: T[]) => Promise<void> | void
  disabled?: (selected: T[]) => boolean
  icon?: React.ReactNode
}

interface BulkContextValue<T extends { id: string | number }> extends BulkSelectionState<T> {
  registerAction: (action: BulkAction<T>) => void
  unregisterAction: (key: string) => void
  actions: BulkAction<T>[]
  executingKey?: string
  execute: (key: string) => Promise<void>
}

const BulkContext = createContext<BulkContextValue<any> | null>(null)

export function useBulk<T extends { id: string | number }>() {
  const ctx = useContext(BulkContext)
  if (!ctx) throw new Error('useBulk must be used within <BulkOperations>')
  return ctx as BulkContextValue<T>
}

interface Props<T extends { id: string | number }> {
  items: T[]
  initialSelectedIds?: Array<string | number>
  children: React.ReactNode
  /** Optional list of predefined actions */
  actions?: BulkAction<T>[]
}

export function BulkOperations<T extends { id: string | number }>({ items, children, actions: initialActions = [], initialSelectedIds = [] }: Props<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set(initialSelectedIds))
  const [actions, setActions] = useState<BulkAction<T>[]>(initialActions)
  const [executingKey, setExecutingKey] = useState<string | undefined>()
  const toast = useContext(ToastContext) // optional

  function toggle(id: string | number) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  function toggleAll() {
    setSelectedIds(prev => (prev.size === items.length ? new Set() : new Set(items.map(i => i.id))))
  }
  function clear() { setSelectedIds(new Set()) }
  function isSelected(id: string | number) { return selectedIds.has(id) }

  function registerAction(action: BulkAction<T>) {
    setActions(prev => prev.some(a => a.key === action.key) ? prev : [...prev, action])
  }
  function unregisterAction(key: string) { setActions(prev => prev.filter(a => a.key !== key)) }

  const count = selectedIds.size
  const allSelected = count > 0 && count === items.length

  async function execute(key: string) {
    const action = actions.find(a => a.key === key)
    if (!action) return
    const selected = items.filter(i => selectedIds.has(i.id))
    if (selected.length === 0) return
    const needsConfirm = typeof action.confirm === 'function' ? action.confirm(selected) : action.confirm
    if (needsConfirm && !window.confirm(`Apply "${action.label}" to ${selected.length} item(s)?`)) return
    try {
      setExecutingKey(key)
      await action.onExecute(selected)
  toast?.push({ type: 'success', message: `${action.label} applied to ${selected.length} item(s)` })
    } catch (e: any) {
  toast?.push({ type: 'error', message: e?.message || 'Bulk action failed' })
    } finally {
      setExecutingKey(undefined)
    }
  }

  const value: BulkContextValue<T> = useMemo(() => ({
    items,
    selectedIds,
    toggle,
    toggleAll,
    clear,
    isSelected,
    count,
    allSelected,
    registerAction,
    unregisterAction,
    actions,
    execute,
    executingKey,
  }), [items, selectedIds, count, allSelected, actions, executingKey])

  return <BulkContext.Provider value={value}>{children}</BulkContext.Provider>
}

/*************** UI Helpers ***************/

export function BulkSelectionCheckbox<T extends { id: string | number }>({ id }: { id: T['id'] }) {
  const bulk = useBulk<T>()
  return (
    <input
      type="checkbox"
      className="cursor-pointer"
      checked={bulk.isSelected(id)}
      onChange={() => bulk.toggle(id)}
    />
  )
}

export function BulkMasterCheckbox() {
  const bulk = useBulk<any>()
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = bulk.count > 0 && !bulk.allSelected
  }, [bulk.count, bulk.allSelected])
  return (
    <input
      ref={ref}
      type="checkbox"
      className="cursor-pointer"
      checked={bulk.allSelected}
      onChange={() => bulk.toggleAll()}
    />
  )
}

export function BulkToolbar() {
  const bulk = useBulk<any>()
  if (bulk.count === 0) return null
  return (
    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded px-3 py-1 text-sm">
      <span>{bulk.count} selected</span>
      {bulk.actions.map(a => {
        const selectedItems = bulk.items.filter(i => bulk.selectedIds.has(i.id))
        const disabled = a.disabled?.(selectedItems) || false
        return (
          <button
            key={a.key}
            disabled={disabled || bulk.executingKey === a.key}
            onClick={() => bulk.execute(a.key)}
            className={`px-2 py-1 rounded border text-xs font-medium ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white bg-indigo-100 border-indigo-300'}`}
          >
            {bulk.executingKey === a.key ? '...' : a.label}
          </button>
        )
      })}
      <button className="ml-2 text-gray-500 hover:text-gray-700" onClick={() => bulk.clear()}>Clear</button>
    </div>
  )
}

/*************** Example Predefined Actions ***************/

export function standardBulkActions<T extends { id: string | number; status?: string }>(
  updater: (ids: (string | number)[], patch: Partial<T>) => Promise<void> | void
): BulkAction<T>[] {
  return [
    {
      key: 'archive',
      label: 'Archive',
      confirm: true,
      onExecute: async selected => { await updater(selected.map(s => s.id), { status: 'archived' } as any) },
    },
    {
      key: 'activate',
      label: 'Activate',
      onExecute: async selected => { await updater(selected.map(s => s.id), { status: 'active' } as any) },
      disabled: selected => selected.every(s => (s as any).status === 'active'),
    },
    {
      key: 'export',
      label: 'Export CSV',
      onExecute: selected => {
        const header = Object.keys(selected[0] || {}).join(',')
        const rows = selected.map(obj => Object.values(obj).map(v => JSON.stringify(v ?? '')).join(','))
        const csv = [header, ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `export-${Date.now()}.csv`
        a.click()
        URL.revokeObjectURL(url)
      },
    },
  ]
}
