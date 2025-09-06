// Common TypeScript entity interfaces for ERP modules
export interface BaseEntity {
  id: number | string
  created_at?: string
  updated_at?: string
}

export interface User extends BaseEntity {
  username: string
  email: string
  first_name?: string
  last_name?: string
  role?: 'admin' | 'manager' | 'staff'
  is_active?: boolean
}

export interface Customer extends BaseEntity {
  name: string
  email?: string
  phone?: string
  gstin?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  credit_limit?: number
  balance?: number
}

export interface Supplier extends BaseEntity {
  name: string
  email?: string
  phone?: string
  gstin?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

export interface Product extends BaseEntity {
  sku: string
  name: string
  description?: string
  unit?: string
  unit_price?: number
  hsn_code?: string
  tax_rate?: number
  is_active?: boolean
  inventory_quantity?: number
}

export interface InvoiceLineInput {
  product?: number | string
  description?: string
  quantity: number
  unit_price: number
  gst_rate: number
}

export interface Invoice extends BaseEntity {
  invoice_number: string
  customer: number | string | Customer
  invoice_date: string
  due_date?: string
  status?: 'DRAFT' | 'ISSUED' | 'PARTIAL' | 'PAID' | 'CANCELLED'
  gst_type?: 'intra_state' | 'inter_state'
  currency_code?: string
  subtotal?: number
  cgst_amount?: number
  sgst_amount?: number
  igst_amount?: number
  total_tax?: number
  grand_total?: number
  lines?: InvoiceLineInput[]
}

export interface PaginatedResult<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
