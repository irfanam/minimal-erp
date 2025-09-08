import React from 'react'
import type { CustomerContact } from '../../customers/types'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface ContactManagerProps {
  value: CustomerContact[]
  onChange: (contacts: CustomerContact[]) => void
}

export const ContactManager: React.FC<ContactManagerProps> = ({ value, onChange }) => {
  const addContact = () => {
    const id = Math.random().toString(36).slice(2)
    onChange([...value, { id, name: '', isPrimary: value.length === 0 }])
  }
  const update = (id: string, patch: Partial<CustomerContact>) => onChange(value.map(c => c.id === id ? { ...c, ...patch } : c))
  const remove = (id: string) => onChange(value.filter(c => c.id !== id))
  const setPrimary = (id: string) => onChange(value.map(c => ({ ...c, isPrimary: c.id === id })))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium text-neutral-700">Contacts</h4>
        <button type="button" onClick={addContact} className="text-xs inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"><PlusIcon className="h-4 w-4" /> Add</button>
      </div>
      {value.length === 0 && <p className="text-xs text-neutral-500">No contacts added.</p>}
      <div className="grid gap-4">
        {value.map(contact => (
          <div key={contact.id} className="border rounded-md p-3 bg-white space-y-2 relative">
            <div className="flex items-center gap-3 text-xs">
              <input value={contact.name} onChange={e => update(contact.id, { name: e.target.value })} placeholder="Full Name" className="border rounded px-2 py-1 flex-1" />
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" checked={!!contact.isPrimary} onChange={() => setPrimary(contact.id)} /> Primary
              </label>
              <button type="button" onClick={() => remove(contact.id)} className="ml-auto text-danger-600 hover:text-danger-700"><TrashIcon className="h-4 w-4" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              <input value={contact.email || ''} onChange={e => update(contact.id, { email: e.target.value })} placeholder="Email" className="border rounded px-2 py-1" />
              <input value={contact.phone || ''} onChange={e => update(contact.id, { phone: e.target.value })} placeholder="Phone" className="border rounded px-2 py-1" />
              <input value={contact.mobile || ''} onChange={e => update(contact.id, { mobile: e.target.value })} placeholder="Mobile" className="border rounded px-2 py-1" />
              <input value={contact.designation || ''} onChange={e => update(contact.id, { designation: e.target.value })} placeholder="Designation" className="border rounded px-2 py-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
