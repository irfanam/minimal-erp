import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { ImageGallery } from './components/ImageGallery'
import { VariantManager, type ProductVariant } from './components/VariantManager'
import { FormSection } from '../../components/forms'
import { useNavigate, useParams } from 'react-router-dom'

interface ProductDraft {
  id: string
  name: string
  code: string
  description?: string
  uom: string
  reorderLevel?: number
  purchaseRate?: number
  saleRate?: number
  hsnCode?: string
  gstRate?: number
  taxCategory?: string
  images: string[]
  variants: ProductVariant[]
}

const empty: ProductDraft = {
  id: 'new',
  name: '',
  code: '',
  uom: 'Nos',
  images: [],
  variants: []
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const editing = !!id && id !== 'new'
  const [product, setProduct] = useState<ProductDraft>(empty)

  const update = (patch: Partial<ProductDraft>) => setProduct(p => ({ ...p, ...patch }))

  const save = () => {
    // TODO: integrate API
    navigate('/products')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-neutral-800">{editing ? 'Edit Product' : 'New Product'}</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button size="sm" onClick={save}>{editing ? 'Save' : 'Create'}</Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <FormSection id="basic" title="Basic Information">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Name</label>
                <input value={product.name} onChange={e => update({ name: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Code / SKU</label>
                <input value={product.code} onChange={e => update({ code: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-neutral-700">Description</label>
                <textarea value={product.description || ''} onChange={e => update({ description: e.target.value })} className="min-h-[90px] rounded-md border border-neutral-300 px-3 py-2 text-sm" />
              </div>
            </div>
          </FormSection>
          <FormSection id="inventory" title="Inventory Settings" collapsible>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">UOM</label>
                <input value={product.uom} onChange={e => update({ uom: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Reorder Level</label>
                <input type="number" value={product.reorderLevel || ''} onChange={e => update({ reorderLevel: Number(e.target.value) })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
            </div>
          </FormSection>
          <FormSection id="pricing" title="Pricing" collapsible>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Purchase Rate</label>
                <input type="number" value={product.purchaseRate || ''} onChange={e => update({ purchaseRate: Number(e.target.value) })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Sale Rate</label>
                <input type="number" value={product.saleRate || ''} onChange={e => update({ saleRate: Number(e.target.value) })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
            </div>
          </FormSection>
          <FormSection id="tax" title="Tax & Accounting" collapsible>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">HSN Code</label>
                <input value={product.hsnCode || ''} onChange={e => update({ hsnCode: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">GST Rate %</label>
                <input type="number" value={product.gstRate || ''} onChange={e => update({ gstRate: Number(e.target.value) })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Tax Category</label>
                <input value={product.taxCategory || ''} onChange={e => update({ taxCategory: e.target.value })} className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
              </div>
            </div>
          </FormSection>
          <FormSection id="variants" title="Variants" collapsible>
            <VariantManager value={product.variants} onChange={variants => update({ variants })} />
          </FormSection>
        </div>
        <div className="space-y-6">
          <FormSection id="images" title="Images" collapsible>
            <ImageGallery images={product.images} onChange={images => update({ images })} />
          </FormSection>
          <FormSection id="meta" title="Metadata" collapsible>
            <div className="text-xs text-neutral-600 space-y-1">
              <p>ID: {product.id}</p>
            </div>
          </FormSection>
        </div>
      </div>
    </div>
  )
}

export default ProductForm
