export interface CustomerAddress {
  id: string
  type: 'Billing' | 'Shipping'
  line1: string
  line2?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  gstStateCode?: string
  isPrimary?: boolean
}

export interface CustomerContact {
  id: string
  name: string
  email?: string
  phone?: string
  mobile?: string
  designation?: string
  isPrimary?: boolean
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  status: 'Active' | 'Disabled'
  type: 'Company' | 'Individual'
  territory?: string
  customerGroup?: string
  creditLimit?: number
  paymentTerms?: string
  gstin?: string
  gstState?: string
  logoUrl?: string
  createdAt: string
  updatedAt: string
  balance?: number
  currency?: string
  addresses: CustomerAddress[]
  contacts: CustomerContact[]
}

export interface CustomerMetricSummary {
  totalInvoices: number
  outstanding: number
  overdue: number
  lastInvoiceDate?: string
  avgPaymentDays?: number
}
