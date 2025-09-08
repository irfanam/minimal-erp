import { apiClient } from './apiClient'

export interface Customer { id: string; name: string; email?: string; phone?: string; status?: string; createdAt?: string }
export interface CustomerFilters { search?: string; status?: string; page?: number; pageSize?: number }
export interface Paginated<T> { items: T[]; total: number; page: number; pageSize: number }

export async function listCustomers(filters: CustomerFilters = {}): Promise<Paginated<Customer>> {
  const { data } = await apiClient.get('/customers', { params: filters })
  return data
}

export async function getCustomer(id: string) {
  const { data } = await apiClient.get<Customer>(`/customers/${id}`)
  return data
}

export async function createCustomer(payload: Partial<Customer>) {
  const { data } = await apiClient.post<Customer>('/customers', payload)
  return data
}

export async function updateCustomer(id: string, payload: Partial<Customer>) {
  const { data } = await apiClient.put<Customer>(`/customers/${id}`, payload)
  return data
}

export async function deleteCustomer(id: string) {
  await apiClient.delete(`/customers/${id}`)
  return { id }
}
