import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Customer, CustomerMetricSummary } from './types'
import { Button } from '../../components/ui/Button'
import { CustomerMetrics } from './components/CustomerMetrics'

// Placeholder fetch
const mockCustomer: Customer = {
  id: '1',
  name: 'Acme Industries',
  email: 'info@acme.test',
  phone: '9876501234',
  status: 'Active',
  type: 'Company',
  territory: 'North',
  customerGroup: 'Wholesale',
  creditLimit: 100000,
  paymentTerms: 'Net 30',
  gstin: '29ABCDE1234F2Z5',
  gstState: 'Karnataka',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  addresses: [],
  contacts: [],
  balance: 12000.55,
  currency: '₹'
}

const mockMetrics: CustomerMetricSummary = {
  totalInvoices: 54,
  outstanding: 12000.55,
  overdue: 2500.10,
  lastInvoiceDate: new Date().toISOString(),
  avgPaymentDays: 18
}

export const CustomerDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const customer = mockCustomer // would fetch by id

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-neutral-800">{customer.name}</h1>
          <p className="text-xs text-neutral-500">{customer.type} • {customer.territory} • {customer.customerGroup}</p>
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
              <p>Email: {customer.email}</p>
              <p>Phone: {customer.phone}</p>
              <p>GSTIN: {customer.gstin}</p>
              <p>Payment Terms: {customer.paymentTerms}</p>
              <p>Credit Limit: {customer.creditLimit}</p>
              <p>Created: {new Date(customer.createdAt).toLocaleDateString()}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
