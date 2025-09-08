// Centralized API path builders to ensure consistency & trailing slashes
// All paths here are relative to the apiClient baseURL (which already includes /api)

// Base segment constants
export const SEGMENTS = {
  SALES: 'sales',
  INVENTORY: 'inventory',
  AUTH: 'auth',
  ACCOUNTING: 'accounting',
  PURCHASES: 'purchases',
  CORE: 'core',
}

// Helper to ensure single trailing slash (DRF style)
function withSlash(path: string): string {
  return path.endsWith('/') ? path : path + '/'
}

// Auth endpoints
export const AUTH_PATHS = {
  login: () => withSlash(`/${SEGMENTS.AUTH}/login`),
  logout: () => withSlash(`/${SEGMENTS.AUTH}/logout`),
  refresh: () => withSlash(`/${SEGMENTS.AUTH}/refresh`),
  profile: () => withSlash(`/${SEGMENTS.AUTH}/profile`),
}

// Sales / Customers
export const SALES_PATHS = {
  customers: () => withSlash(`/${SEGMENTS.SALES}/customers`),
  customerDetail: (id: string | number) => withSlash(`/${SEGMENTS.SALES}/customers/${id}`),
  customerBalance: (id: string | number) => withSlash(`/${SEGMENTS.SALES}/customers/${id}/balance`),
}

// Inventory (Products & Inventory records)
export const INVENTORY_PATHS = {
  products: () => withSlash(`/${SEGMENTS.INVENTORY}/products`),
  productDetail: (id: string | number) => withSlash(`/${SEGMENTS.INVENTORY}/products/${id}`),
  inventory: () => withSlash(`/${SEGMENTS.INVENTORY}/inventory`),
  inventoryDetail: (id: string | number) => withSlash(`/${SEGMENTS.INVENTORY}/inventory/${id}`),
}

// Core / dashboard & search
export const CORE_PATHS = {
  dashboardMetrics: () => withSlash(`/${SEGMENTS.CORE}/dashboard/metrics`),
  globalSearch: () => withSlash(`/${SEGMENTS.CORE}/search`),
}

// Generic paginated response shape (align with DRF default pagination keys if needed)
export interface PaginatedResponse<T> {
  results?: T[]          // DRF default key
  count?: number         // DRF default total
  next?: string | null
  previous?: string | null
  // Alternate shape we sometimes map to
  items?: T[]
  total?: number
  page?: number
  pageSize?: number
}

export interface ListQuery {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
  [key: string]: any
}

// Utility to normalize DRF pagination into our internal shape
export function normalizePaginated<T>(data: PaginatedResponse<T>, query: ListQuery = {}) {
  if (Array.isArray((data as any).items)) return data // already normalized
  const page = query.page || 1
  const pageSize = query.page_size || 25
  return {
    items: data.results || [],
    total: data.count || (data.results ? data.results.length : 0),
    page,
    pageSize,
  }
}

export type { PaginatedResponse as Paginated }
