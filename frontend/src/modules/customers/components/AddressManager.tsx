import React from 'react'
import type { CustomerAddress } from '../../customers/types'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface AddressManagerProps {
  value: CustomerAddress[]
  onChange: (addresses: CustomerAddress[]) => void
}

export const AddressManager: React.FC<AddressManagerProps> = ({ value, onChange }) => {
  const addAddress = () => {
    const id = Math.random().toString(36).slice(2)
    onChange([...value, { id, type: 'Billing', line1: '', city: '', country: 'India', isPrimary: value.length === 0 }])
  }
  const update = (id: string, patch: Partial<CustomerAddress>) => {
    onChange(value.map(a => a.id === id ? { ...a, ...patch } : a))
  }
  const remove = (id: string) => onChange(value.filter(a => a.id !== id))
  const setPrimary = (id: string) => onChange(value.map(a => ({ ...a, isPrimary: a.id === id })))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium text-neutral-700">Addresses</h4>
        <button type="button" onClick={addAddress} className="text-xs inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"><PlusIcon className="h-4 w-4" /> Add</button>
      </div>
      {value.length === 0 && <p className="text-xs text-neutral-500">No addresses added.</p>}
      <div className="grid gap-4">
        {value.map(addr => (
          <div key={addr.id} className="border rounded-md p-3 bg-white space-y-2 relative">
            <div className="flex items-center gap-3 text-xs">
              <select value={addr.type} onChange={e => update(addr.id, { type: e.target.value as any })} className="border rounded px-2 py-1 text-xs">
                <option>Billing</option>
                <option>Shipping</option>
              </select>
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" checked={!!addr.isPrimary} onChange={() => setPrimary(addr.id)} /> Primary
              </label>
              <button type="button" onClick={() => remove(addr.id)} className="ml-auto text-danger-600 hover:text-danger-700"><TrashIcon className="h-4 w-4" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              <input value={addr.line1} onChange={e => update(addr.id, { line1: e.target.value })} placeholder="Address Line 1" className="border rounded px-2 py-1" />
              <input value={addr.line2 || ''} onChange={e => update(addr.id, { line2: e.target.value })} placeholder="Address Line 2" className="border rounded px-2 py-1" />
              <input value={addr.city || ''} onChange={e => update(addr.id, { city: e.target.value })} placeholder="City" className="border rounded px-2 py-1" />
              <input value={addr.state || ''} onChange={e => update(addr.id, { state: e.target.value })} placeholder="State" className="border rounded px-2 py-1" />
              <input value={addr.postalCode || ''} onChange={e => update(addr.id, { postalCode: e.target.value })} placeholder="Postal Code" className="border rounded px-2 py-1" />
              <input value={addr.country || ''} onChange={e => update(addr.id, { country: e.target.value })} placeholder="Country" className="border rounded px-2 py-1" />
              <input value={addr.gstStateCode || ''} onChange={e => update(addr.id, { gstStateCode: e.target.value })} placeholder="GST State Code" className="border rounded px-2 py-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
