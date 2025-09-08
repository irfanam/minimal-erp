import React, { useEffect, useMemo, useState, useRef } from 'react'
import type { DataTableColumn } from '../../components/tables/DataTable'
import { DataTable } from '../../components/tables/DataTable'
import { Button } from '../../components/ui/Button'
import { ProductCard, type ProductSummary } from './components/ProductCard'
import { StockIndicator } from './components/StockIndicator'
import { useProducts, useInventoryRecords } from '../../hooks/useInventory'
import { Button as UIButton } from '../../components/ui/Button'
import { saveAs } from 'file-saver'

const ProductList: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 24
  const debounceRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => setDebouncedSearch(search), 400)
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current) }
  }, [search])

  const { data: productPage, isLoading, error } = useProducts({ page, page_size: pageSize, search: debouncedSearch })
  const products = productPage?.items || []

  // Inventory records for stock levels (optional secondary fetch)
  // Could map product->inventory on server; for now we'll derive with placeholder quantity fields if present
  const { data: invPage } = useInventoryRecords({ page: 1, page_size: 500 })
  const inventoryIndex = new Map<string | number, any>(invPage?.items?.map(r => [typeof r.product === 'object' ? r.product.id : r.product, r]) || [])

  const enriched: ProductSummary[] = products.map(p => {
    const inv = inventoryIndex.get(p.id)
    return {
      id: String(p.id),
      name: p.name,
      code: p.sku,
      description: p.description,
      price: p.unit_price ? Number(p.unit_price) : undefined,
      currency: '₹',
      quantity: inv?.on_hand ?? inv?.available ?? 0,
      reorderLevel: inv?.reorder_level ?? 0,
      category: undefined,
      brand: undefined,
    }
  })

  const lowStock = enriched.filter(p => (p.quantity || 0) <= (p.reorderLevel || 0)).length

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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-neutral-800">Products</h1>
          <p className="text-[11px] text-neutral-500">{lowStock} low stock items</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search products..."
            className="h-8 rounded-md border border-neutral-300 px-2 text-xs"
          />
          <div className="flex items-center rounded-md border border-neutral-300 overflow-hidden">
            <button onClick={() => setView('grid')} className={`px-2 h-8 text-[11px] ${view==='grid' ? 'bg-neutral-800 text-white' : 'text-neutral-600'}`}>Grid</button>
            <button onClick={() => setView('list')} className={`px-2 h-8 text-[11px] ${view==='list' ? 'bg-neutral-800 text-white' : 'text-neutral-600'}`}>List</button>
          </div>
          <Button size="sm">New Product</Button>
          <UIButton size="sm" variant="secondary" onClick={() => exportCsv(enriched)}>Export</UIButton>
        </div>
      </div>
  {error ? <div className="rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700">Failed to load products.</div> : null}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-48 rounded-md bg-neutral-100 animate-pulse" />)}
        </div>
      ) : null}
      {!isLoading && (
        view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {enriched.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <DataTable columns={columns} data={enriched} responsiveCards exportable />
        )
      )}
      {!isLoading && (
        <div className="flex items-center justify-between text-xs text-neutral-600 mt-2">
          <span>Page {page} of {Math.max(1, Math.ceil((productPage?.total || 0) / pageSize))}</span>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="secondary" disabled={page===1} onClick={() => setPage(p=>p-1)}>Prev</Button>
            <Button size="sm" variant="secondary" disabled={page >= Math.max(1, Math.ceil((productPage?.total || 0)/pageSize))} onClick={() => setPage(p=>p+1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function exportCsv(rows: ProductSummary[]) {
  const header = ['ID','Name','Code','Price','Quantity','ReorderLevel']
  const csv = [header.join(',')].concat(rows.map(r => [r.id, r.name, r.code, r.price ?? '', r.quantity, r.reorderLevel ?? ''].join(','))).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, 'products.csv')
}

export default ProductList
