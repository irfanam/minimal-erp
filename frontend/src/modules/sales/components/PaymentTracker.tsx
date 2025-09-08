import React from 'react'

export interface PaymentInfo {
  total: number
  paid: number
  dueDate?: string
}

interface Props { info: PaymentInfo }

export const PaymentTracker: React.FC<Props> = ({ info }) => {
  const due = info.total - info.paid
  const pct = info.total ? (info.paid / info.total) * 100 : 0
  const overdue = info.dueDate ? new Date(info.dueDate).getTime() < Date.now() && due > 0 : false
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] text-neutral-600">
        <span>Paid {info.paid.toFixed(2)}</span>
        <span>Due {due.toFixed(2)}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
        <div className={`h-full ${overdue ? 'bg-danger-500' : 'bg-primary-500'}`} style={{ width: pct + '%' }} />
      </div>
      {info.dueDate && (
        <p className={`text-[10px] ${overdue ? 'text-danger-600' : 'text-neutral-500'}`}>Due {new Date(info.dueDate).toLocaleDateString()}</p>
      )}
    </div>
  )
}
