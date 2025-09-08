import React, { useState } from 'react'
import type { Customer, CustomerAddress, CustomerContact } from './types'
import { AddressManager } from './components/AddressManager'
import { ContactManager } from './components/ContactManager'
import { Button } from '../../components/ui/Button'
import { useNavigate, useParams } from 'react-router-dom'
import { FormSection } from '../../components/forms'

const emptyCustomer: Customer = {
  id: 'new',
  name: '',
  status: 'Active',
  type: 'Company',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  addresses: [],
  contacts: []
}

export const CustomerForm: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = id && id !== 'new'
  const [customer, setCustomer] = useState<Customer>(emptyCustomer)
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [contacts, setContacts] = useState<CustomerContact[]>([])

  const update = (patch: Partial<Customer>) => setCustomer(c => ({ ...c, ...patch, updatedAt: new Date().toISOString() }))

  const save = () => {
    // TODO integrate API
    navigate('/customers')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-neutral-800">{editing ? 'Edit Customer' : 'New Customer'}</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>Cancel</Button>
          <Button size="sm" onClick={save}>{editing ? 'Save' : 'Create'}</Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <FormSection id="basic" title="Basic Information">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Name</label>
                <input value={customer.name} onChange={e => update({ name: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Email</label>
                <input value={customer.email || ''} onChange={e => update({ email: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Phone</label>
                <input value={customer.phone || ''} onChange={e => update({ phone: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Customer Type</label>
                <select value={customer.type} onChange={e => update({ type: e.target.value as any })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm">
                  <option value="Company">Company</option>
                  <option value="Individual">Individual</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Status</label>
                <select value={customer.status} onChange={e => update({ status: e.target.value as any })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm">
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Territory</label>
                <input value={customer.territory || ''} onChange={e => update({ territory: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Customer Group</label>
                <input value={customer.customerGroup || ''} onChange={e => update({ customerGroup: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Credit Limit</label>
                <input type="number" value={customer.creditLimit || ''} onChange={e => update({ creditLimit: Number(e.target.value) })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Payment Terms</label>
                <input value={customer.paymentTerms || ''} onChange={e => update({ paymentTerms: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">GSTIN</label>
                <input value={customer.gstin || ''} onChange={e => update({ gstin: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">GST State</label>
                <input value={customer.gstState || ''} onChange={e => update({ gstState: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
            </div>
          </FormSection>
          <FormSection id="addresses" title="Addresses" collapsible>
            <AddressManager value={addresses} onChange={setAddresses} />
          </FormSection>
          <FormSection id="contacts" title="Contacts" collapsible>
            <ContactManager value={contacts} onChange={setContacts} />
          </FormSection>
        </div>
        <div className="space-y-6">
          <FormSection id="documents" title="Documents" collapsible>
            <div className="space-y-2 text-xs">
              <p className="text-neutral-500">Upload customer logo & documents (TODO).</p>
              <input type="file" className="text-xs" />
            </div>
          </FormSection>
          <FormSection id="meta" title="Metadata" collapsible>
            <div className="space-y-2 text-xs text-neutral-600">
              <p>ID: {customer.id}</p>
              <p>Created: {new Date(customer.createdAt).toLocaleString()}</p>
              <p>Updated: {new Date(customer.updatedAt).toLocaleString()}</p>
            </div>
          </FormSection>
        </div>
      </div>
    </div>
  )
}
