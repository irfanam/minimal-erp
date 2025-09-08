import { apiClient } from './apiClient'

export interface OrderLine { productId: string; qty: number; price: number }
export interface Order { id: string; number: string; customerId: string; status: string; total: number; lines: OrderLine[]; createdAt?: string }
export interface OrderFilters { search?: string; status?: string; customerId?: string; page?: number; pageSize?: number }
export interface Paginated<T> { items: T[]; total: number; page: number; pageSize: number }

export async function listOrders(filters: OrderFilters = {}): Promise<Paginated<Order>> {
  const { data } = await apiClient.get('/orders', { params: filters })
  return data
}
export async function getOrder(id: string) {
  const { data } = await apiClient.get<Order>(`/orders/${id}`)
  return data
}
export async function createOrder(payload: Partial<Order>) {
  const { data } = await apiClient.post<Order>('/orders', payload)
  return data
}
export async function updateOrder(id: string, payload: Partial<Order>) {
  const { data } = await apiClient.put<Order>(`/orders/${id}`, payload)
  return data
}
export async function deleteOrder(id: string) { await apiClient.delete(`/orders/${id}`); return { id } }
export async function transitionOrder(id: string, action: string) {
  const { data } = await apiClient.post<Order>(`/orders/${id}/actions`, { action })
  return data
}
