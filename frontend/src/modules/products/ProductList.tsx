import React, { useMemo, useState } from 'react'
import type { DataTableColumn } from '../../components/tables/DataTable'
import { DataTable } from '../../components/tables/DataTable'
import { Button } from '../../components/ui/Button'
import { ProductCard, type ProductSummary } from './components/ProductCard'
import { StockIndicator } from './components/StockIndicator'

const mockProducts: ProductSummary[] = Array.from({ length: 36 }).map((_, i) => ({
  id: String(i+1),
  name: `Product ${i+1}`,
  code: 'P' + (1000 + i),
  description: 'Sample product used for demonstration of inventory listing and grid layout.',
  category: ['Electronics','Apparel','Home','Office'][i % 4],
  brand: ['BrandA','BrandB','BrandC'][i % 3],
  price: 100 + i * 5,
  currency: '₹',
  quantity: Math.floor(Math.random()*200),
  reorderLevel: 40
}))

const ProductList: React.FC = () => {
  const [data] = useState<ProductSummary[]>(mockProducts)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [brandFilter, setBrandFilter] = useState<string>('')

  const filtered = data.filter(p => (!categoryFilter || p.category === categoryFilter) && (!brandFilter || p.brand === brandFilter))

  const lowStock = filtered.filter(p => p.quantity <= (p.reorderLevel || 0)).length

  const columns: DataTableColumn<ProductSummary>[] = useMemo(() => ([
    { key: 'name', header: 'Name', render: p => <div className="flex flex-col"><span className="font-medium text-neutral-800">{p.name}</span><span className="text-[11px] text-neutral-500">{p.code}</span></div> },
    { key: 'category', header: 'Category' },
    { key: 'brand', header: 'Brand' },
    { key: 'price', header: 'Price', render: p => (p.currency || '₹') + (p.price != null ? p.price.toFixed(2) : '0.00'), align: 'right' },
    { key: 'quantity', header: 'Stock', render: p => <StockIndicator quantity={p.quantity} reorderLevel={p.reorderLevel} compact /> },
    { key: 'actions', header: '', render: p => <button className="text-xs text-primary-600 hover:underline" data-id={p.id}>Edit</button> }
  ]), [])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-neutral-800">Products</h1>
          <p className="text-[11px] text-neutral-500">{lowStock} low stock items</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="h-8 rounded-md border border-neutral-300 px-2 text-xs">
            <option value="">All Categories</option>
            {[...new Set(data.map(p => p.category))].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="h-8 rounded-md border border-neutral-300 px-2 text-xs">
            <option value="">All Brands</option>
            {[...new Set(data.map(p => p.brand))].map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <div className="flex items-center rounded-md border border-neutral-300 overflow-hidden">
            <button onClick={() => setView('grid')} className={`px-2 h-8 text-[11px] ${view==='grid' ? 'bg-neutral-800 text-white' : 'text-neutral-600'}`}>Grid</button>
            <button onClick={() => setView('list')} className={`px-2 h-8 text-[11px] ${view==='list' ? 'bg-neutral-800 text-white' : 'text-neutral-600'}`}>List</button>
          </div>
          <Button size="sm">New Product</Button>
        </div>
      </div>
      {view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} responsiveCards exportable />
      )}
    </div>
  )
}

export default ProductList
