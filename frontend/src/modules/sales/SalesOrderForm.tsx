import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { FormSection } from '../../components/forms'
import { LineItemTable, type LineItem } from './components/LineItemTable'
import { TaxCalculator } from './components/TaxCalculator'
import { useNavigate, useParams } from 'react-router-dom'

interface DraftOrder {
  id: string
  customer?: string
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected'
  date: string
  deliveryDate?: string
  paymentTerms?: string
  discountPct?: number
  items: LineItem[]
}

const empty: DraftOrder = {
  id: 'new',
  status: 'Draft',
  date: new Date().toISOString(),
  items: []
}

export const SalesOrderForm: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = !!id && id !== 'new'
  const [order, setOrder] = useState<DraftOrder>(empty)

  const update = (patch: Partial<DraftOrder>) => setOrder(o => ({ ...o, ...patch }))

  const save = () => {
    // TODO API integration
    navigate('/sales-orders')
  }

  const submitForApproval = () => update({ status: 'Pending Approval' })
  const approve = () => update({ status: 'Approved' })
  const reject = () => update({ status: 'Rejected' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-neutral-800">{editing ? 'Edit Sales Order' : 'New Sales Order'}</h1>
        <div className="flex items-center gap-2">
          {order.status === 'Draft' && <Button size="sm" variant="secondary" onClick={submitForApproval}>Submit for Approval</Button>}
          {order.status === 'Pending Approval' && (
            <>
              <Button size="sm" variant="secondary" onClick={approve}>Approve</Button>
              <Button size="sm" variant="secondary" onClick={reject}>Reject</Button>
            </>
          )}
          <Button size="sm" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button size="sm" onClick={save}>{editing ? 'Save' : 'Create'}</Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <FormSection id="customer" title="Customer & Dates">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Customer</label>
                <input value={order.customer || ''} onChange={e => update({ customer: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" placeholder="Search customer" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Delivery Date</label>
                <input type="date" value={order.deliveryDate?.slice(0,10) || ''} onChange={e => update({ deliveryDate: new Date(e.target.value).toISOString() })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Payment Terms</label>
                <input value={order.paymentTerms || ''} onChange={e => update({ paymentTerms: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Order Discount %</label>
                <input type="number" value={order.discountPct || ''} onChange={e => update({ discountPct: Number(e.target.value) })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
            </div>
          </FormSection>
          <FormSection id="items" title="Items">
            <LineItemTable items={order.items} onChange={items => update({ items })} />
          </FormSection>
        </div>
        <div className="space-y-6">
          <FormSection id="totals" title="Totals & Taxes">
            <TaxCalculator items={order.items} />
            <div className="pt-4 text-xs text-neutral-600 space-y-1">
              <p>Status: <span className="font-medium text-neutral-800">{order.status}</span></p>
            </div>
          </FormSection>
          <FormSection id="actions" title="Print / Email" collapsible>
            <div className="text-[11px] text-neutral-500 space-y-2">
              <p>Printing & emailing functionality will integrate with backend services.</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary">Print</Button>
                <Button size="sm" variant="secondary">Email</Button>
              </div>
            </div>
          </FormSection>
        </div>
      </div>
    </div>
  )
}
