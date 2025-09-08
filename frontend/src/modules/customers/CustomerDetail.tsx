import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { CustomerMetrics } from './components/CustomerMetrics'
import { useCustomer, useCustomerBalance } from '../../hooks/useCustomers'

const CustomerDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: customer, isLoading, error } = useCustomer(id)
  const { data: balanceData } = useCustomerBalance(id)

  if (isLoading) {
    return <div className="space-y-4">
      <div className="h-8 w-60 rounded-md bg-neutral-100 animate-pulse" />
      <div className="h-40 rounded-md bg-neutral-100 animate-pulse" />
    </div>
  }
  if (error || !customer) {
    return <div className="text-xs text-danger-600">Failed to load customer.</div>
  }

  const mockMetrics = {
    totalInvoices: 0,
    outstanding: Number(balanceData?.balance || 0),
    overdue: 0,
    lastInvoiceDate: undefined as string | undefined,
    avgPaymentDays: undefined as number | undefined
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
      <h1 className="text-lg font-semibold tracking-tight text-neutral-800">{customer.name}</h1>
          <p className="text-xs text-neutral-500">Customer Code: {customer.customer_code || '—'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate(`/customers/${id}/edit`)}>Edit</Button>
          <Button size="sm">New Invoice</Button>
        </div>
      </div>
    <CustomerMetrics metrics={mockMetrics} />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-neutral-700">Recent Transactions</h2>
            <div className="rounded-md border border-neutral-200 bg-white p-4 text-xs text-neutral-500">Transactions list (TODO)</div>
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-neutral-700">Activity Timeline</h2>
            <div className="rounded-md border border-neutral-200 bg-white p-4 text-xs text-neutral-500">Activity timeline (TODO)</div>
          </section>
        </div>
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-neutral-700">Outstanding</h2>
            <div className="rounded-md border border-neutral-200 bg-white p-4 text-xs">
              <p className="flex justify-between"><span className="text-neutral-500">Outstanding:</span> <span className="font-medium text-danger-600">₹{mockMetrics.outstanding.toFixed(2)}</span></p>
              <p className="flex justify-between"><span className="text-neutral-500">Overdue:</span> <span className="font-medium text-danger-600">₹{mockMetrics.overdue.toFixed(2)}</span></p>
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-neutral-700">Details</h2>
            <div className="rounded-md border border-neutral-200 bg-white p-4 text-[11px] leading-relaxed text-neutral-600 space-y-1">
              <p>Email: {customer.email || '—'}</p>
              <p>Phone: {customer.phone || '—'}</p>
              <p>GSTIN: {customer.gstin || '—'}</p>
              <p>Created: {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '—'}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default CustomerDetail
