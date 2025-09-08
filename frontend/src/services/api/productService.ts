import { apiClient, extractErrorMessage } from './apiClient'
import { INVENTORY_PATHS, normalizePaginated, type ListQuery } from '../../constants/apiPaths'

export interface Product {
  id: number | string
  name: string
  sku: string
  description?: string
  hsn_code?: string
  unit_price?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface InventoryRecord {
  id: number | string
  product: Product | number
  on_hand: number
  committed: number
  available: number
  reorder_level: number
  created_at?: string
  updated_at?: string
}

export interface ProductFilters extends ListQuery {
  status?: string
}
export interface InventoryFilters extends ListQuery {
  product?: number | string
}

export interface NormalizedPage<T> { items: T[]; total: number; page: number; pageSize: number }

// --- Products ---
export async function listProducts(filters: ProductFilters = {}): Promise<NormalizedPage<Product>> {
  try {
    const params: any = { ...filters }
    if (filters.pageSize && !params.page_size) params.page_size = filters.pageSize
    delete params.pageSize
    const { data } = await apiClient.get(INVENTORY_PATHS.products(), { params })
    const normalized = normalizePaginated<Product>(data, params)
    return normalized as NormalizedPage<Product>
  } catch (e) { throw new Error(extractErrorMessage(e)) }
}

export async function getProduct(id: string | number): Promise<Product> {
  try {
    const { data } = await apiClient.get<Product>(INVENTORY_PATHS.productDetail(id))
    return data
  } catch (e) { throw new Error(extractErrorMessage(e)) }
}

export async function createProduct(payload: Partial<Product>): Promise<Product> {
  try {
    const { data } = await apiClient.post<Product>(INVENTORY_PATHS.products(), payload)
    return data
  } catch (e) { throw new Error(extractErrorMessage(e)) }
}

export async function updateProduct(id: string | number, payload: Partial<Product>): Promise<Product> {
  try {
    const { data } = await apiClient.put<Product>(INVENTORY_PATHS.productDetail(id), payload)
    return data
  } catch (e) { throw new Error(extractErrorMessage(e)) }
}

export async function deleteProduct(id: string | number): Promise<{ id: string | number }> {
  try {
    await apiClient.delete(INVENTORY_PATHS.productDetail(id))
    return { id }
  } catch (e) { throw new Error(extractErrorMessage(e)) }
}

// --- Inventory Records ---
export async function listInventory(filters: InventoryFilters = {}): Promise<NormalizedPage<InventoryRecord>> {
  try {
    const params: any = { ...filters }
    if (filters.pageSize && !params.page_size) params.page_size = filters.pageSize
    delete params.pageSize
    const { data } = await apiClient.get(INVENTORY_PATHS.inventory(), { params })
    const normalized = normalizePaginated<InventoryRecord>(data, params)
    return normalized as NormalizedPage<InventoryRecord>
  } catch (e) { throw new Error(extractErrorMessage(e)) }
}

export async function getInventoryRecord(id: string | number): Promise<InventoryRecord> {
  try {
    const { data } = await apiClient.get<InventoryRecord>(INVENTORY_PATHS.inventoryDetail(id))
    return data
  } catch (e) { throw new Error(extractErrorMessage(e)) }
}

export async function updateInventoryRecord(id: string | number, payload: Partial<InventoryRecord>): Promise<InventoryRecord> {
  try {
    const { data } = await apiClient.put<InventoryRecord>(INVENTORY_PATHS.inventoryDetail(id), payload)
    return data
  } catch (e) { throw new Error(extractErrorMessage(e)) }
}

// Derived stock level helper (aggregating inventory list results)
export async function getProductStockLevel(productId: string | number): Promise<{ productId: string | number; on_hand: number; available: number; committed: number }> {
  try {
    const page = await listInventory({ product: productId, page: 1, page_size: 1 })
    const rec = page.items[0]
    return {
      productId,
      on_hand: rec?.on_hand ?? 0,
      available: rec?.available ?? 0,
      committed: rec?.committed ?? 0,
    }
  } catch (e) { throw new Error(extractErrorMessage(e)) }
}
