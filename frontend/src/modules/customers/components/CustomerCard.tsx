import React from 'react'
import type { Customer } from '../../customers/types'
import clsx from 'clsx'

export const CustomerCard: React.FC<{ customer: Customer; onClick?: () => void; className?: string }> = ({ customer, onClick, className }) => {
  return (
    <button type="button" onClick={onClick} className={clsx('w-full text-left rounded-md border border-neutral-200 bg-white p-4 hover:shadow-sm transition group', className)}>
      <div className="flex items-start gap-3">
        {customer.logoUrl ? (
          <img src={customer.logoUrl} alt={customer.name} className="h-12 w-12 rounded object-cover border" />
        ) : (
          <div className="h-12 w-12 rounded bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm">
            {customer.name.slice(0,2).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-neutral-800 truncate group-hover:text-primary-600">{customer.name}</h3>
            <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full font-medium ring-1 ring-inset',
              customer.status === 'Active' ? 'bg-success-50 text-success-700 ring-success-600/20' : 'bg-neutral-100 text-neutral-600 ring-neutral-500/20'
            )}>{customer.status}</span>
          </div>
          <p className="text-[11px] text-neutral-500 truncate">{customer.email || customer.phone || 'No contact info'}</p>
          <div className="flex flex-wrap gap-2 text-[10px] text-neutral-500">
            {customer.territory && <span>{customer.territory}</span>}
            {customer.customerGroup && <span>{customer.customerGroup}</span>}
            {customer.gstin && <span className="text-primary-600">GST: {customer.gstin}</span>}
          </div>
        </div>
        {typeof customer.balance === 'number' && (
          <div className="text-right text-xs">
            <p className="text-neutral-500">Balance</p>
            <p className={clsx('font-medium', customer.balance > 0 && 'text-danger-600')}>{customer.currency || '₹'}{customer.balance.toFixed(2)}</p>
          </div>
        )}
      </div>
    </button>
  )
}
