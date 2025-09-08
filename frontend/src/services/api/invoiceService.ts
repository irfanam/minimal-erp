import { apiClient } from './apiClient'

export interface InvoiceLine { productId: string; qty: number; price: number; tax?: number }
export interface Invoice { id: string; number: string; orderId?: string; customerId: string; status: string; total: number; balance: number; lines: InvoiceLine[]; issuedAt?: string }
export interface InvoiceFilters { search?: string; status?: string; customerId?: string; page?: number; pageSize?: number }
export interface Paginated<T> { items: T[]; total: number; page: number; pageSize: number }

export async function listInvoices(filters: InvoiceFilters = {}): Promise<Paginated<Invoice>> {
  const { data } = await apiClient.get('/invoices', { params: filters })
  return data
}
export async function getInvoice(id: string) {
  const { data } = await apiClient.get<Invoice>(`/invoices/${id}`)
  return data
}
export async function createInvoice(payload: Partial<Invoice>) {
  const { data } = await apiClient.post<Invoice>('/invoices', payload)
  return data
}
export async function updateInvoice(id: string, payload: Partial<Invoice>) {
  const { data } = await apiClient.put<Invoice>(`/invoices/${id}`, payload)
  return data
}
export async function deleteInvoice(id: string) { await apiClient.delete(`/invoices/${id}`); return { id } }
export async function recordPayment(id: string, amount: number) {
  const { data } = await apiClient.post<Invoice>(`/invoices/${id}/payments`, { amount })
  return data
}
