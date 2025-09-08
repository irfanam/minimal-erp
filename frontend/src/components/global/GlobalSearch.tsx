import React, { useEffect, useRef, useState } from 'react'
import { useGlobalSearch } from '../../hooks/useGlobalSearch'

interface SearchItem { id: string | number; type: string; label: string; route: string; recent?: boolean }
interface Props { onNavigate: (route: string) => void }

const HISTORY_KEY = 'app.search.history.v1'

function loadHistory(): SearchItem[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}
function saveHistory(items: SearchItem[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0,20))) } catch {}
}

export const GlobalSearch: React.FC<Props> = ({ onNavigate }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<SearchItem[]>(() => loadHistory())
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)
  const [debounced, setDebounced] = useState('')
  const { data, isLoading, error } = useGlobalSearch(debounced, 12, open)

  // Debounce input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250)
    return () => clearTimeout(t)
  }, [query])

  const backendResults: SearchItem[] = (data?.results || []).map(r => {
    let route = '/'
    switch (r.type) {
      case 'customer': route = `/customers/${r.id}`; break
      case 'product': route = `/products`; break // could go to detail if available
      case 'order': route = `/sales-orders/${r.id}`; break
      case 'invoice': route = `/invoices/${r.id}`; break
    }
    return { id: r.id, type: r.type, label: r.name || r.customer_code || r.order_number || r.invoice_number || `Result ${r.id}`, route }
  })

  const baseSuggestions: SearchItem[] = recent
  const results = query ? backendResults : baseSuggestions

  const choose = (item: SearchItem) => {
    setRecent(r => {
      const next = [item, ...r.filter(x => x.id !== item.id)].slice(0,20)
      saveHistory(next)
      return next
    })
    onNavigate(item.route)
    setOpen(false)
    setQuery('')
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setOpen(o => !o); setTimeout(() => ref.current?.querySelector('input')?.focus(), 10)
      } else if (open) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(results.length -1, a+1)) }
        if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a-1)) }
        if (e.key === 'Enter') { e.preventDefault(); const item = results[active]; if (item) choose(item) }
        if (e.key === 'Escape') { setOpen(false) }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, results, active])

  return (
    <>
      <button onClick={() => { setOpen(true); setTimeout(() => ref.current?.querySelector('input')?.focus(), 10) }} className="h-8 px-3 text-xs rounded-md border border-neutral-300 bg-white text-neutral-500 hover:bg-neutral-50 flex items-center gap-2">
        <span>Search...</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200">Ctrl K</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6" onClick={() => setOpen(false)}>
          <div ref={ref} onClick={e => e.stopPropagation()} className="w-full max-w-xl rounded-lg bg-white shadow-lg border border-neutral-200 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-neutral-200">
              <input value={query} onChange={e => { setQuery(e.target.value); setActive(0) }} placeholder="Search customers, products, orders, invoices..." className="w-full h-9 px-3 rounded-md bg-neutral-50 border border-neutral-300 text-sm" />
            </div>
            <div className="max-h-80 overflow-y-auto">
              {isLoading && <p className="p-4 text-[11px] text-neutral-500">Searching...</p>}
              {error && <p className="p-4 text-[11px] text-red-600">{error.message}</p>}
              {!isLoading && !error && results.length === 0 && <p className="p-4 text-[11px] text-neutral-500">No results</p>}
              {!isLoading && !error && results.map((r, i) => (
                <button key={r.id} onClick={() => choose(r)} className={`w-full text-left px-4 py-2 text-[11px] flex items-center gap-2 border-b border-neutral-100 last:border-b-0 ${i===active ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-neutral-100 text-[9px] text-neutral-600 border border-neutral-200">{r.type}</span>
                  <span className="flex-1 truncate text-neutral-700">{r.label}</span>
                </button>
              ))}
            </div>
            <div className="p-2 bg-neutral-50 border-t border-neutral-200 flex justify-between text-[10px] text-neutral-500">
              <span>{query ? (isLoading ? 'Searching...' : results.length + ' matches') : 'Recent searches'}</span>
              <span>Enter to open • Esc to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
