import { apiClient, extractErrorMessage } from './apiClient'
import { SALES_PATHS, normalizePaginated, type ListQuery } from '../../constants/apiPaths'

export interface Customer {
  id: number | string
  customer_code?: string
  name: string
  email?: string
  phone?: string
  gstin?: string
  status?: string
  billing_address?: string | null
  shipping_address?: string | null
  created_at?: string
  updated_at?: string
}

export interface CustomerListFilters extends ListQuery {
  name?: string
  city?: string
}

export interface NormalizedPage<T> { items: T[]; total: number; page: number; pageSize: number }

export async function listCustomers(filters: CustomerListFilters = {}): Promise<NormalizedPage<Customer>> {
  try {
    const params: any = { ...filters }
    if (filters.pageSize && !params.page_size) params.page_size = filters.pageSize
    delete params.pageSize
    const { data } = await apiClient.get(SALES_PATHS.customers(), { params })
  const normalized = normalizePaginated<Customer>(data, params)
  return normalized as NormalizedPage<Customer>
  } catch (e) {
    throw new Error(extractErrorMessage(e))
  }
}

export async function getCustomer(id: string | number): Promise<Customer> {
  try {
    const { data } = await apiClient.get<Customer>(SALES_PATHS.customerDetail(id))
    return data
  } catch (e) { throw new Error(extractErrorMessage(e)) }
}

export async function createCustomer(payload: Partial<Customer>): Promise<Customer> {
  try {
    const { data } = await apiClient.post<Customer>(SALES_PATHS.customers(), payload)
    return data
  } catch (e) { throw new Error(extractErrorMessage(e)) }
}

export async function updateCustomer(id: string | number, payload: Partial<Customer>): Promise<Customer> {
  try {
    const { data } = await apiClient.put<Customer>(SALES_PATHS.customerDetail(id), payload)
    return data
  } catch (e) { throw new Error(extractErrorMessage(e)) }
}

export async function deleteCustomer(id: string | number): Promise<{ id: string | number }> {
  try {
    await apiClient.delete(SALES_PATHS.customerDetail(id))
    return { id }
  } catch (e) { throw new Error(extractErrorMessage(e)) }
}

export interface CustomerBalance { customer_id: number | string; customer_code?: string; balance: string; currency: string }

export async function getCustomerBalance(id: string | number): Promise<CustomerBalance> {
  try {
    const { data } = await apiClient.get<CustomerBalance>(SALES_PATHS.customerBalance(id))
    return data
  } catch (e) { throw new Error(extractErrorMessage(e)) }
}
