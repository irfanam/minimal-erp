import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type ShortcutHandler = (e: KeyboardEvent) => void

interface Shortcut {
  sequence: string // e.g. "ctrl+k" or "g c"
  description: string
  handler: ShortcutHandler
  global?: boolean
}

interface ShortcutContextValue {
  register: (s: Omit<Shortcut,'handler'> & { handler: ShortcutHandler }) => void
  unregister: (sequence: string) => void
  list: Shortcut[]
}

const ShortcutContext = createContext<ShortcutContextValue | null>(null)

export function useShortcuts() {
  const ctx = useContext(ShortcutContext)
  if (!ctx) throw new Error('KeyboardShortcutsProvider missing')
  return ctx
}

// Normalize key tokens
function normalizeSequence(seq: string) {
  return seq.trim().toLowerCase().replace(/\s+/g, ' ') // single spaces
}

export const KeyboardShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate()
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([])
  const bufferRef = useRef<string[]>([])
  const lastKeyTime = useRef<number>(0)
  const chordTimeout = 900 // ms
  const [showHelp, setShowHelp] = useState(false)

  const register = useCallback((s: Omit<Shortcut,'handler'> & { handler: ShortcutHandler }) => {
    setShortcuts(prev => prev.some(p => p.sequence === normalizeSequence(s.sequence)) ? prev : [...prev, { ...s, sequence: normalizeSequence(s.sequence) }])
  }, [])
  const unregister = useCallback((sequence: string) => {
    setShortcuts(prev => prev.filter(p => p.sequence !== normalizeSequence(sequence)))
  }, [])

  // Default shortcuts (only once)
  useEffect(() => {
    register({ sequence: 'ctrl+k', description: 'Open command palette', handler: () => window.dispatchEvent(new CustomEvent('open-command-palette')), global: true })
    register({ sequence: 'g c', description: 'Go to Customers', handler: () => navigate('/customers') })
    register({ sequence: 'g p', description: 'Go to Products', handler: () => navigate('/products') })
    register({ sequence: 'g o', description: 'Go to Sales Orders', handler: () => navigate('/sales/orders') })
    register({ sequence: '?', description: 'Show keyboard help', handler: () => setShowHelp(x => !x), global: true })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const keydown = useCallback((e: KeyboardEvent) => {
    const now = Date.now()
    if (now - lastKeyTime.current > chordTimeout) bufferRef.current = []
    lastKeyTime.current = now

    const parts: string[] = []
    if (e.ctrlKey) parts.push('ctrl')
    if (e.metaKey) parts.push('meta')
    if (e.altKey) parts.push('alt')
    if (e.shiftKey) parts.push('shift')
    const key = e.key.toLowerCase()
    if (!['shift','control','alt','meta'].includes(key)) parts.push(key)
    const token = parts.join('+')
    bufferRef.current.push(token)

    // Attempt longest match first
    const bufferStr = normalizeSequence(bufferRef.current.join(' '))
    const candidates = shortcuts.filter(s => bufferStr.endsWith(s.sequence))
    if (candidates.length) {
      // Prevent default for single chord palette opening etc.
      e.preventDefault()
      candidates[candidates.length - 1].handler(e)
      bufferRef.current = []
      return
    }
    // Partial match? keep waiting; else reset
    const anyPrefix = shortcuts.some(s => s.sequence.startsWith(bufferStr))
    if (!anyPrefix) bufferRef.current = []
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [keydown])

  const value = useMemo<ShortcutContextValue>(() => ({ register, unregister, list: shortcuts }), [register, unregister, shortcuts])

  return (
    <ShortcutContext.Provider value={value}>
      {children}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-md shadow-lg w-full max-w-lg p-4 text-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-xs uppercase tracking-wide text-gray-500">Keyboard Shortcuts</h2>
              <button className="text-gray-500 hover:text-gray-700 text-xs" onClick={() => setShowHelp(false)}>Close</button>
            </div>
            <ul className="space-y-1 max-h-72 overflow-auto pr-1">
              {shortcuts.sort((a,b)=>a.sequence.localeCompare(b.sequence)).map(s => (
                <li key={s.sequence} className="flex items-start gap-3">
                  <code className="bg-gray-100 rounded px-2 py-0.5 text-[11px] font-mono border border-gray-200 whitespace-pre">
                    {s.sequence.split(' ').map((seg,i) => <span key={i} className="mr-1 last:mr-0">{seg}</span>)}
                  </code>
                  <span className="text-gray-700 leading-relaxed flex-1">{s.description}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-gray-400">Press ? to toggle this panel. Sequences like g c are two keys pressed in succession.</p>
          </div>
        </div>
      )}
    </ShortcutContext.Provider>
  )
}
