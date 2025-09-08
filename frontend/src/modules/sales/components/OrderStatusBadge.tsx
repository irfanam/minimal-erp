import React from 'react'

export type OrderStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Partially Delivered' | 'Delivered' | 'Invoiced'

interface Props { status: OrderStatus; className?: string }

const styles: Record<OrderStatus, string> = {
  Draft: 'bg-neutral-100 text-neutral-600 ring-neutral-500/20',
  'Pending Approval': 'bg-warning-50 text-warning-700 ring-warning-600/20',
  Approved: 'bg-primary-50 text-primary-700 ring-primary-600/20',
  Rejected: 'bg-danger-50 text-danger-700 ring-danger-600/20',
  'Partially Delivered': 'bg-warning-100 text-warning-800 ring-warning-700/20',
  Delivered: 'bg-success-50 text-success-700 ring-success-600/20',
  Invoiced: 'bg-success-100 text-success-800 ring-success-700/20'
}

export const OrderStatusBadge: React.FC<Props> = ({ status, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 ${styles[status]} ${className}`}>{status}</span>
)
