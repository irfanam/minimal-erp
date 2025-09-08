import React, { useMemo, useState } from 'react'
import type { DataTableColumn } from '../../components/tables/DataTable'
import { DataTable } from '../../components/tables/DataTable'
import { OrderStatusBadge, type OrderStatus } from './components/OrderStatusBadge'
import { Button } from '../../components/ui/Button'

interface SalesOrder {
  id: string
  orderNo: string
  customer: string
  date: string
  status: OrderStatus
  total: number
  currency: string
  deliveryStatus: 'Pending' | 'Partially Delivered' | 'Delivered'
}

const mockOrders: SalesOrder[] = Array.from({ length: 34 }).map((_, i) => ({
  id: String(i+1),
  orderNo: 'SO-' + (1000 + i),
  customer: 'Customer ' + ((i % 10) + 1),
  date: new Date(Date.now() - i * 86400000).toISOString(),
  status: (['Draft','Pending Approval','Approved','Rejected','Partially Delivered','Delivered','Invoiced'] as OrderStatus[])[i % 7],
  total: 5000 + i * 120,
  currency: '₹',
  deliveryStatus: (['Pending','Partially Delivered','Delivered'] as const)[i % 3]
}))

const SalesOrderList: React.FC = () => {
  const [customerFilter, setCustomerFilter] = useState('')
  const filtered = mockOrders.filter(o => !customerFilter || o.customer === customerFilter)

  const columns: DataTableColumn<SalesOrder>[] = useMemo(() => ([
    { key: 'orderNo', header: 'Order', render: o => <span className="font-medium text-neutral-800">{o.orderNo}</span> },
    { key: 'customer', header: 'Customer' },
    { key: 'date', header: 'Date', render: o => new Date(o.date).toLocaleDateString() },
    { key: 'status', header: 'Status', render: o => <OrderStatusBadge status={o.status} /> },
    { key: 'deliveryStatus', header: 'Delivery', render: o => <span className="text-[11px] text-neutral-600">{o.deliveryStatus}</span> },
    { key: 'total', header: 'Total', render: o => o.currency + o.total.toFixed(2), align: 'right' },
    { key: 'actions', header: '', render: o => (
      <div className="flex items-center gap-2 text-xs">
        <button className="text-primary-600 hover:underline">View</button>
        {o.status === 'Approved' && <button className="text-neutral-600 hover:underline">Invoice</button>}
      </div>
    ) }
  ]), [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-neutral-800">Sales Orders</h1>
          <p className="text-[11px] text-neutral-500">{filtered.length} orders</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} className="h-8 rounded-md border border-neutral-300 px-2 text-xs">
            <option value="">All Customers</option>
            {[...new Set(mockOrders.map(o => o.customer))].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button size="sm">New Order</Button>
        </div>
      </div>
      <DataTable columns={columns} data={filtered} exportable responsiveCards />
    </div>
  )
}

export default SalesOrderList
