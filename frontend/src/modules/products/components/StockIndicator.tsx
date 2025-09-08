import React from 'react'

interface Props {
  quantity: number
  reorderLevel?: number
  className?: string
  compact?: boolean
}

export const StockIndicator: React.FC<Props> = ({ quantity, reorderLevel = 0, className = '', compact }) => {
  const low = quantity <= reorderLevel
  const level = low ? 'low' : quantity < reorderLevel * 2 ? 'medium' : 'high'
  const color = level === 'low' ? 'bg-danger-100 text-danger-700 ring-danger-600/20' : level === 'medium' ? 'bg-warning-100 text-warning-700 ring-warning-600/20' : 'bg-success-100 text-success-700 ring-success-600/20'
  const barColor = level === 'low' ? 'bg-danger-500' : level === 'medium' ? 'bg-warning-500' : 'bg-success-500'
  const pct = Math.min(100, reorderLevel ? (quantity / (reorderLevel * 3)) * 100 : 100)
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${color}`}>
        <span>{low ? 'Low Stock' : 'In Stock'}</span>
        <span className="text-neutral-400 font-normal">•</span>
        <span>{quantity}</span>
      </div>
      {!compact && (
        <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
          <div className={`h-full ${barColor} transition-all`} style={{ width: pct + '%' }} />
        </div>
      )}
    </div>
  )
}
