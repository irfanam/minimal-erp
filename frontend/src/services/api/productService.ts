import { apiClient } from './apiClient'

export interface Product { id: string; name: string; sku?: string; price?: number; status?: string; stockQty?: number; updatedAt?: string }
export interface ProductFilters { search?: string; status?: string; page?: number; pageSize?: number }
export interface Paginated<T> { items: T[]; total: number; page: number; pageSize: number }

export async function listProducts(filters: ProductFilters = {}): Promise<Paginated<Product>> {
  const { data } = await apiClient.get('/products', { params: filters })
  return data
}

export async function getProduct(id: string) {
  const { data } = await apiClient.get<Product>(`/products/${id}`)
  return data
}

export async function createProduct(payload: Partial<Product>) {
  const { data } = await apiClient.post<Product>('/products', payload)
  return data
}

export async function updateProduct(id: string, payload: Partial<Product>) {
  const { data } = await apiClient.put<Product>(`/products/${id}`, payload)
  return data
}

export async function deleteProduct(id: string) {
  await apiClient.delete(`/products/${id}`)
  return { id }
}
