import React, { useMemo, useState } from 'react'
import { DataTable } from '../../components/tables/DataTable'
import type { DataTableColumn } from '../../components/tables/DataTable'
import type { Customer } from './types'
import { Button } from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'

// Temporary mock data
const mockCustomers: Customer[] = Array.from({ length: 42 }).map((_, i) => ({
  id: String(i+1),
  name: `Customer ${i+1}`,
  email: i % 3 === 0 ? `customer${i+1}@mail.com` : undefined,
  phone: i % 4 === 0 ? `98765${(10000 + i).toString().slice(-5)}` : undefined,
  status: i % 7 === 0 ? 'Disabled' : 'Active',
  type: i % 5 === 0 ? 'Individual' : 'Company',
  territory: ['North','South','East','West'][i % 4],
  customerGroup: ['Retail','Wholesale','Online'][i % 3],
  creditLimit: 50000,
  paymentTerms: 'Net 30',
  gstin: i % 6 === 0 ? '29ABCDE1234F2Z5' : undefined,
  gstState: 'Karnataka',
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
  balance: i % 5 === 0 ? 1200.55 : 0,
  currency: '₹',
  addresses: [],
  contacts: [],
}))

export const CustomerList: React.FC = () => {
  const navigate = useNavigate()
  const [data] = useState<Customer[]>(mockCustomers)

  const columns: DataTableColumn<Customer>[] = useMemo(() => ([
    { key: 'name', header: 'Name', render: c => <span className="font-medium text-neutral-800">{c.name}</span> },
    { key: 'email', header: 'Email', render: c => c.email || <span className="text-neutral-400">—</span> },
    { key: 'phone', header: 'Phone', render: c => c.phone || <span className="text-neutral-400">—</span> },
    { key: 'status', header: 'Status', render: c => <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.status === 'Active' ? 'bg-success-50 text-success-700 ring-1 ring-success-600/20' : 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-500/20'}`}>{c.status}</span> },
    { key: 'type', header: 'Type' },
    { key: 'territory', header: 'Territory' },
    { key: 'customerGroup', header: 'Group' },
    { key: 'balance', header: 'Balance', render: c => c.balance ? c.currency + c.balance.toFixed(2) : '—', align: 'right' },
    { key: 'actions', header: '', render: c => (
      <div className="flex items-center gap-2 text-xs">
        <button onClick={() => navigate(`/customers/${c.id}`)} className="text-primary-600 hover:underline">View</button>
        <button onClick={() => navigate(`/customers/${c.id}/edit`)} className="text-neutral-600 hover:underline">Edit</button>
      </div>
    ) }
  ]), [navigate])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold tracking-tight text-neutral-800">Customers</h1>
        <Button size="sm" onClick={() => navigate('/customers/new')}>New Customer</Button>
      </div>
      <DataTable columns={columns} data={data} exportable responsiveCards />
    </div>
  )
}
