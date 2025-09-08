import React, { useState } from 'react'

export interface VariantAttribute {
  name: string
  values: string[]
}

export interface ProductVariant {
  id: string
  sku: string
  attributes: Record<string, string>
  price?: number
  quantity?: number
}

interface Props {
  value: ProductVariant[]
  onChange: (variants: ProductVariant[]) => void
}

export const VariantManager: React.FC<Props> = ({ value, onChange }) => {
  const [attributes, setAttributes] = useState<VariantAttribute[]>([])

  const addAttribute = () => setAttributes(a => [...a, { name: 'Attribute ' + (a.length + 1), values: [] }])
  const updateAttribute = (i: number, patch: Partial<VariantAttribute>) => setAttributes(a => a.map((attr, idx) => idx === i ? { ...attr, ...patch } : attr))
  const removeAttribute = (i: number) => setAttributes(a => a.filter((_, idx) => idx !== i))

  // Generate variants combinatorially
  const generateVariants = () => {
    if (!attributes.length) return
    const lists = attributes.map(a => a.values.map(v => ({ [a.name]: v })))
    const combos: Record<string, string>[] = lists.reduce((acc, list) => {
      if (!acc.length) return list as any
      const next: Record<string, string>[] = []
      acc.forEach(base => list.forEach(item => next.push({ ...base, ...item })))
      return next
    }, [] as Record<string, string> [])
    const variants: ProductVariant[] = combos.map((c, i) => ({ id: String(i+1), sku: Object.values(c).join('-'), attributes: c, price: 0, quantity: 0 }))
    onChange(variants)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-neutral-700">Variant Attributes</h4>
        <button onClick={addAttribute} className="text-[11px] text-primary-600 hover:underline">Add Attribute</button>
      </div>
      <div className="space-y-3">
        {attributes.map((attr, i) => (
          <div key={i} className="rounded-md border border-neutral-200 p-3 space-y-2 bg-white">
            <div className="flex items-center gap-2">
              <input value={attr.name} onChange={e => updateAttribute(i, { name: e.target.value })} className="h-8 rounded-md border border-neutral-300 px-2 text-[11px] flex-1" placeholder="Attribute Name" />
              <button onClick={() => removeAttribute(i)} className="text-[10px] text-danger-600">Remove</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {attr.values.map((val, vi) => (
                <span key={vi} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px]">
                  {val}
                  <button onClick={() => updateAttribute(i, { values: attr.values.filter((_, idx) => idx !== vi) })}>×</button>
                </span>
              ))}
              <input
                className="h-7 rounded-md border border-neutral-300 px-2 text-[10px]"
                placeholder="Add value"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const value = (e.target as HTMLInputElement).value.trim()
                    if (value) {
                      updateAttribute(i, { values: [...attr.values, value] })
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={generateVariants} className="text-[11px] text-primary-600 hover:underline disabled:text-neutral-400" disabled={!attributes.length}>Generate Variants</button>
        <span className="text-[10px] text-neutral-500">{value.length} variants</span>
      </div>
      {value.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-separate border-spacing-y-1">
            <thead>
              <tr>
                <th className="text-left font-medium text-neutral-600 px-2 py-1">SKU</th>
                {attributes.map(a => <th key={a.name} className="text-left font-medium text-neutral-600 px-2 py-1">{a.name}</th>)}
                <th className="text-right font-medium text-neutral-600 px-2 py-1">Price</th>
                <th className="text-right font-medium text-neutral-600 px-2 py-1">Qty</th>
              </tr>
            </thead>
            <tbody>
              {value.map(v => (
                <tr key={v.id} className="bg-white hover:bg-neutral-50">
                  <td className="px-2 py-1 font-medium text-neutral-800">{v.sku}</td>
                  {attributes.map(a => <td key={a.name} className="px-2 py-1">{v.attributes[a.name]}</td>)}
                  <td className="px-2 py-1 text-right">
                    <input type="number" value={v.price} onChange={e => onChange(value.map(x => x.id === v.id ? { ...x, price: Number(e.target.value) } : x))} className="h-7 w-20 rounded border border-neutral-300 px-1" />
                  </td>
                  <td className="px-2 py-1 text-right">
                    <input type="number" value={v.quantity} onChange={e => onChange(value.map(x => x.id === v.id ? { ...x, quantity: Number(e.target.value) } : x))} className="h-7 w-16 rounded border border-neutral-300 px-1" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
