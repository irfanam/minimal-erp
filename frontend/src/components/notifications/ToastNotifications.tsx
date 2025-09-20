import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  timeout?: number
}

interface ToastContextValue {
  push: (toast: Omit<Toast, 'id'>) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export const useToasts = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('ToastProvider missing')
  return ctx
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((toast: Omit<Toast,'id'>) => {
    const id = String(Date.now() + Math.random())
    setToasts(t => [...t, { id, ...toast }])
  }, [])

  useEffect(() => {
    const timers = toasts.map(t => setTimeout(() => setToasts(ts => ts.filter(x => x.id !== t.id)), t.timeout || 4000))
    return () => { timers.forEach(clearTimeout) }
  }, [toasts])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-72">
        {toasts.map(t => (
          <div key={t.id} className={`rounded-md border px-3 py-2 text-xs shadow-sm flex items-start gap-2 animate-slide-in-bottom ${
            t.type === 'success' ? 'bg-success-50 border-success-200 text-success-700' : 
            t.type === 'error' ? 'bg-danger-50 border-danger-200 text-danger-700' : 
            t.type === 'warning' ? 'bg-warning-50 border-warning-200 text-warning-700' :
            'bg-neutral-800 border-neutral-700 text-neutral-100'
          }`}> 
            <span className="flex-1 leading-relaxed">{t.message}</span>
            <button onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))} className="text-[10px] opacity-60 hover:opacity-100">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
