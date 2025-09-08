import React from 'react'
import { StockIndicator } from './StockIndicator'

export interface ProductSummary {
  id: string
  name: string
  code?: string
  description?: string
  category?: string
  brand?: string
  image?: string
  price?: number
  currency?: string
  quantity: number
  reorderLevel?: number
}

interface Props {
  product: ProductSummary
  onClick?: (id: string) => void
}

export const ProductCard: React.FC<Props> = ({ product, onClick }) => {
  return (
    <div className="group rounded-lg border border-neutral-200 bg-white p-4 flex flex-col gap-3 hover:shadow-sm transition cursor-pointer" onClick={() => onClick?.(product.id)}>
      <div className="aspect-video w-full rounded-md bg-neutral-100 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-[10px] text-neutral-400">NO IMAGE</span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-neutral-800 line-clamp-1">{product.name}</h3>
        <p className="text-[11px] text-neutral-500 line-clamp-2 min-h-[28px]">{product.description || '—'}</p>
      </div>
      <div className="flex items-center justify-between text-[11px] text-neutral-600 mt-auto">
        <span>{product.currency || '₹'}{product.price?.toFixed(2) || '0.00'}</span>
        <span className="text-neutral-400">{product.code || ''}</span>
      </div>
      <StockIndicator quantity={product.quantity} reorderLevel={product.reorderLevel} compact />
    </div>
  )
}
