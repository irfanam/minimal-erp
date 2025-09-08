import React from 'react'

export interface LineItem {
  id: string
  product: string
  description?: string
  qty: number
  uom: string
  rate: number
  discountPct?: number
  gstPct?: number
}

interface Props {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
  editable?: boolean
}

export const LineItemTable: React.FC<Props> = ({ items, onChange, editable = true }) => {
  const update = (id: string, patch: Partial<LineItem>) => onChange(items.map(i => i.id === id ? { ...i, ...patch } : i))
  const remove = (id: string) => onChange(items.filter(i => i.id !== id))
  const add = () => onChange([...items, { id: String(Date.now()), product: '', qty: 1, uom: 'Nos', rate: 0 }])

  const computeAmount = (i: LineItem) => {
    const base = i.qty * i.rate
    const discounted = i.discountPct ? base * (1 - i.discountPct / 100) : base
    const gst = i.gstPct ? discounted * i.gstPct / 100 : 0
    return { base, discounted, gst, total: discounted + gst }
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-separate border-spacing-y-1">
          <thead>
            <tr>
              <th className="text-left font-medium text-neutral-600 px-2 py-1">Item</th>
              <th className="text-left font-medium text-neutral-600 px-2 py-1">Qty</th>
              <th className="text-left font-medium text-neutral-600 px-2 py-1">Rate</th>
              <th className="text-left font-medium text-neutral-600 px-2 py-1">Disc %</th>
              <th className="text-left font-medium text-neutral-600 px-2 py-1">GST %</th>
              <th className="text-right font-medium text-neutral-600 px-2 py-1">Amount</th>
              <th className="w-4" />
            </tr>
          </thead>
          <tbody>
            {items.map(i => {
              const amt = computeAmount(i)
              return (
                <tr key={i.id} className="bg-white hover:bg-neutral-50">
                  <td className="px-2 py-1">
                    {editable ? <input value={i.product} onChange={e => update(i.id, { product: e.target.value })} className="h-7 w-40 rounded border border-neutral-300 px-1" /> : i.product}
                  </td>
                  <td className="px-2 py-1">
                    {editable ? <input type="number" value={i.qty} onChange={e => update(i.id, { qty: Number(e.target.value) })} className="h-7 w-16 rounded border border-neutral-300 px-1" /> : i.qty}
                  </td>
                  <td className="px-2 py-1">
                    {editable ? <input type="number" value={i.rate} onChange={e => update(i.id, { rate: Number(e.target.value) })} className="h-7 w-20 rounded border border-neutral-300 px-1" /> : i.rate.toFixed(2)}
                  </td>
                  <td className="px-2 py-1">
                    {editable ? <input type="number" value={i.discountPct || ''} onChange={e => update(i.id, { discountPct: Number(e.target.value) })} className="h-7 w-16 rounded border border-neutral-300 px-1" /> : (i.discountPct || 0)}
                  </td>
                  <td className="px-2 py-1">
                    {editable ? <input type="number" value={i.gstPct || ''} onChange={e => update(i.id, { gstPct: Number(e.target.value) })} className="h-7 w-16 rounded border border-neutral-300 px-1" /> : (i.gstPct || 0)}
                  </td>
                  <td className="px-2 py-1 text-right font-medium text-neutral-800">{amt.total.toFixed(2)}</td>
                  <td className="px-2 py-1 text-right">
                    {editable && <button onClick={() => remove(i.id)} className="text-[10px] text-danger-600">✕</button>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {editable && (
        <button onClick={add} className="text-[11px] text-primary-600 hover:underline">Add Item</button>
      )}
      <div className="flex justify-end">
        <div className="text-[11px] text-neutral-600 space-y-0.5">
          <p className="flex justify-between gap-8"><span>Subtotal</span><span>{items.reduce((a,b) => a + b.qty * b.rate, 0).toFixed(2)}</span></p>
          <p className="flex justify-between gap-8"><span>Discount</span><span>{items.reduce((a,b) => a + (b.discountPct ? b.qty * b.rate * b.discountPct /100 : 0), 0).toFixed(2)}</span></p>
          <p className="flex justify-between gap-8"><span>GST</span><span>{items.reduce((a,b) => a + ((b.gstPct || 0) * (b.qty * b.rate - (b.discountPct ? b.qty * b.rate * b.discountPct /100 : 0)) /100), 0).toFixed(2)}</span></p>
          <p className="flex justify-between gap-8 font-medium text-neutral-800"><span>Total</span><span>{items.reduce((a,b) => a + ((b.qty * b.rate) * (1 - (b.discountPct||0)/100) * (1 + (b.gstPct||0)/100)), 0).toFixed(2)}</span></p>
        </div>
      </div>
    </div>
  )
}
