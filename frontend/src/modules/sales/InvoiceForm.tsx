import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { FormSection } from '../../components/forms'
import { LineItemTable, type LineItem } from './components/LineItemTable'
import { TaxCalculator } from './components/TaxCalculator'
import { InvoicePreview } from './components/InvoicePreview'
import { useNavigate, useParams } from 'react-router-dom'

interface DraftInvoice {
  id: string
  invoiceNo?: string
  customer?: string
  date: string
  dueDate?: string
  paymentTerms?: string
  items: LineItem[]
  status: 'Draft' | 'Submitted' | 'Paid'
}

const empty: DraftInvoice = {
  id: 'new',
  date: new Date().toISOString(),
  status: 'Draft',
  items: []
}

const InvoiceForm: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = !!id && id !== 'new'
  const [invoice, setInvoice] = useState<DraftInvoice>(empty)
  const [preview, setPreview] = useState(false)

  const update = (patch: Partial<DraftInvoice>) => setInvoice(i => ({ ...i, ...patch }))

  const save = () => {
    // TODO API integration + numbering system
    navigate('/invoices')
  }

  const submit = () => update({ status: 'Submitted', invoiceNo: invoice.invoiceNo || 'INV-' + Date.now() })

  return (
    <div className="space-y-6">
      <InvoicePreview open={preview} onClose={() => setPreview(false)} items={invoice.items} customer={invoice.customer} invoiceNo={invoice.invoiceNo} date={invoice.date} dueDate={invoice.dueDate} />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-neutral-800">{editing ? 'Edit Invoice' : 'New Invoice'}</h1>
        <div className="flex items-center gap-2">
          {invoice.status === 'Draft' && <Button size="sm" variant="secondary" onClick={submit}>Submit</Button>}
          <Button size="sm" variant="secondary" onClick={() => setPreview(true)}>Preview</Button>
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
                <input value={invoice.customer || ''} onChange={e => update({ customer: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" placeholder="Search customer" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Due Date</label>
                <input type="date" value={invoice.dueDate?.slice(0,10) || ''} onChange={e => update({ dueDate: new Date(e.target.value).toISOString() })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Payment Terms</label>
                <input value={invoice.paymentTerms || ''} onChange={e => update({ paymentTerms: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
            </div>
          </FormSection>
          <FormSection id="items" title="Items">
            <LineItemTable items={invoice.items} onChange={items => update({ items })} />
          </FormSection>
        </div>
        <div className="space-y-6">
          <FormSection id="taxes" title="Totals & Taxes">
            <TaxCalculator items={invoice.items} />
            <div className="pt-4 text-xs text-neutral-600 space-y-1">
              <p>Status: <span className="font-medium text-neutral-800">{invoice.status}</span></p>
              <p>No: <span className="font-medium text-neutral-800">{invoice.invoiceNo || '—'}</span></p>
            </div>
          </FormSection>
          <FormSection id="einvoice" title="E-Invoice" collapsible>
            <div className="text-[11px] text-neutral-500 space-y-2">
              <p>E-Invoice integration placeholder – ready for API wiring (IRN generation, QR code display).</p>
            </div>
          </FormSection>
        </div>
      </div>
    </div>
  )
}

export default InvoiceForm
