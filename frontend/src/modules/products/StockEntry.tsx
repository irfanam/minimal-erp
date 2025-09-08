import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { FormSection } from '../../components/forms'

interface EntryItem {
  id: string
  code: string
  name: string
  quantity: number
  batch?: string
  serial?: string
}

interface Draft {
  id: string
  type: 'IN' | 'OUT'
  reason?: string
  remarks?: string
  items: EntryItem[]
}

const empty: Draft = { id: 'new', type: 'IN', items: [] }

export const StockEntry: React.FC = () => {
  const [draft, setDraft] = useState<Draft>(empty)
  const [scan, setScan] = useState('')

  const addItem = (code: string) => {
    setDraft(d => ({ ...d, items: [...d.items, { id: String(Date.now()), code, name: 'Scanned Item', quantity: 1 }] }))
  }

  const updateItem = (id: string, patch: Partial<EntryItem>) => setDraft(d => ({ ...d, items: d.items.map(i => i.id === id ? { ...i, ...patch } : i) }))
  const removeItem = (id: string) => setDraft(d => ({ ...d, items: d.items.filter(i => i.id !== id) }))

  const save = () => {
    // TODO API integration
    setDraft(empty)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-neutral-800">Stock Entry</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setDraft(empty)}>Reset</Button>
          <Button size="sm" onClick={save}>Submit</Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <FormSection id="details" title="Details">
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Type</label>
                <select value={draft.type} onChange={e => setDraft(d => ({ ...d, type: e.target.value as any }))} className="h-9 rounded-md border border-neutral-300 px-3 text-sm">
                  <option value="IN">Stock In</option>
                  <option value="OUT">Stock Out</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Reason Code</label>
                <input value={draft.reason || ''} onChange={e => setDraft(d => ({ ...d, reason: e.target.value }))} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="sm:col-span-3 space-y-1">
                <label className="text-xs font-medium text-neutral-700">Remarks</label>
                <textarea value={draft.remarks || ''} onChange={e => setDraft(d => ({ ...d, remarks: e.target.value }))} className="min-h-[70px] rounded-md border border-neutral-300 px-3 py-2 text-sm" />
              </div>
            </div>
          </FormSection>
          <FormSection id="items" title="Items">
            <div className="flex items-center gap-2 mb-3">
              <input value={scan} onChange={e => setScan(e.target.value)} onKeyDown={e => { if (e.key === 'Enter'){ e.preventDefault(); addItem(scan); setScan('') } }} placeholder="Scan or enter code" className="h-9 flex-1 rounded-md border border-neutral-300 px-3 text-sm" />
              <Button size="sm" onClick={() => { addItem(scan); setScan('') }} disabled={!scan}>Add</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-separate border-spacing-y-1">
                <thead>
                  <tr>
                    <th className="text-left font-medium text-neutral-600 px-2 py-1">Code</th>
                    <th className="text-left font-medium text-neutral-600 px-2 py-1">Name</th>
                    <th className="text-right font-medium text-neutral-600 px-2 py-1">Qty</th>
                    <th className="text-left font-medium text-neutral-600 px-2 py-1">Batch</th>
                    <th className="text-left font-medium text-neutral-600 px-2 py-1">Serial</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {draft.items.map(item => (
                    <tr key={item.id} className="bg-white hover:bg-neutral-50">
                      <td className="px-2 py-1 font-medium text-neutral-800">{item.code}</td>
                      <td className="px-2 py-1">{item.name}</td>
                      <td className="px-2 py-1 text-right">
                        <input type="number" value={item.quantity} onChange={e => updateItem(item.id, { quantity: Number(e.target.value) })} className="h-7 w-16 rounded border border-neutral-300 px-1" />
                      </td>
                      <td className="px-2 py-1">
                        <input value={item.batch || ''} onChange={e => updateItem(item.id, { batch: e.target.value })} className="h-7 w-24 rounded border border-neutral-300 px-1" />
                      </td>
                      <td className="px-2 py-1">
                        <input value={item.serial || ''} onChange={e => updateItem(item.id, { serial: e.target.value })} className="h-7 w-28 rounded border border-neutral-300 px-1" />
                      </td>
                      <td className="px-2 py-1 text-right">
                        <button onClick={() => removeItem(item.id)} className="text-[10px] text-danger-600">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FormSection>
        </div>
        <div className="space-y-6">
          <FormSection id="summary" title="Summary">
            <div className="text-xs text-neutral-600 space-y-1">
              <p>Total Items: {draft.items.length}</p>
              <p>Total Qty: {draft.items.reduce((a,b) => a + b.quantity, 0)}</p>
            </div>
          </FormSection>
          <FormSection id="help" title="Barcode / Batch" collapsible>
            <div className="text-[11px] text-neutral-500 space-y-2">
              <p>Scan a barcode with a connected scanner to auto-add items. Batch and serial numbers can be edited inline.</p>
            </div>
          </FormSection>
        </div>
      </div>
    </div>
  )
}
