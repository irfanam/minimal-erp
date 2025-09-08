import React from 'react'
import type { LineItem } from './LineItemTable'
import { TaxCalculator } from './TaxCalculator'

interface Props {
  open: boolean
  onClose: () => void
  items: LineItem[]
  customer?: string
  invoiceNo?: string
  date?: string
  dueDate?: string
}

export const InvoicePreview: React.FC<Props> = ({ open, onClose, items, customer, invoiceNo, date, dueDate }) => {
  if (!open) return null
  const subtotal = items.reduce((a,b) => a + b.qty * b.rate, 0)
  const discount = items.reduce((a,b) => a + (b.discountPct ? b.qty * b.rate * b.discountPct /100 : 0), 0)
  const gst = items.reduce((a,b) => a + ((b.gstPct||0) * (b.qty * b.rate) * (1 - (b.discountPct||0)/100) /100), 0)
  const total = subtotal - discount + gst
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm border border-neutral-200 p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-800">Invoice Preview</h2>
            <p className="text-[11px] text-neutral-500">{invoiceNo || 'DRAFT'} • {new Date(date || Date.now()).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="text-[11px] text-neutral-500 hover:text-neutral-800">Close</button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <table className="w-full text-[11px] border-separate border-spacing-y-1">
              <thead>
                <tr>
                  <th className="text-left font-medium text-neutral-600 px-2 py-1">Item</th>
                  <th className="text-right font-medium text-neutral-600 px-2 py-1">Qty</th>
                  <th className="text-right font-medium text-neutral-600 px-2 py-1">Rate</th>
                  <th className="text-right font-medium text-neutral-600 px-2 py-1">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.id} className="bg-neutral-50">
                    <td className="px-2 py-1 text-neutral-800">{i.product}</td>
                    <td className="px-2 py-1 text-right">{i.qty}</td>
                    <td className="px-2 py-1 text-right">{i.rate.toFixed(2)}</td>
                    <td className="px-2 py-1 text-right font-medium">{(i.qty * i.rate).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-4">
            <div className="text-[11px] text-neutral-600 space-y-1">
              <p className="flex justify-between"><span>Customer</span><span className="font-medium text-neutral-800">{customer || '—'}</span></p>
              <p className="flex justify-between"><span>Due Date</span><span>{dueDate ? new Date(dueDate).toLocaleDateString() : '—'}</span></p>
            </div>
            <TaxCalculator items={items} />
            <div className="pt-2 border-t border-neutral-200 text-[11px]">
              <p className="flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(2)}</span></p>
              <p className="flex justify-between"><span>Discount</span><span>{discount.toFixed(2)}</span></p>
              <p className="flex justify-between font-medium text-neutral-800"><span>Total</span><span>{total.toFixed(2)}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
