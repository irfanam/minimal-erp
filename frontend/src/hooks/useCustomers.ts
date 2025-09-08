import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
  type Customer,
  type CustomerListFilters,
  getCustomerBalance,
  type CustomerBalance
} from '../services/api/customerService'

const KEY = 'customers'

export interface UseCustomersResult {
  items: Customer[]
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  isFetching: boolean
  error: any
  refetch: () => void
}

export function useCustomers(filters: CustomerListFilters): UseCustomersResult {
  const query = useQuery({
    queryKey: [KEY, filters],
    queryFn: () => listCustomers(filters),
    keepPreviousData: true,
    staleTime: 30_000,
  })
  return {
    items: query.data?.items || [],
    total: query.data?.total || 0,
    page: query.data?.page || filters.page || 1,
    pageSize: query.data?.pageSize || filters.page_size || filters.pageSize || 25,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: () => query.refetch(),
  }
}

export function useCustomer(id?: string | number) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => getCustomer(id!),
    enabled: !!id,
  })
}

export function useCustomerBalance(id?: string | number) {
  return useQuery<CustomerBalance>({
    queryKey: [KEY, 'balance', id],
    queryFn: () => getCustomerBalance(id!),
    enabled: !!id,
    staleTime: 15_000,
  })
}

export function useCustomerMutations() {
  const qc = useQueryClient()

  const createM = useMutation({
    mutationFn: (payload: Partial<Customer>) => createCustomer(payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: [KEY] })
      const prev = qc.getQueryData<any>([KEY])
      // optimistic append (if normalized list shape)
      if (prev && prev.items) {
        const optimistic = { ...prev, items: [{ id: 'temp-' + Date.now(), ...payload }, ...prev.items] }
        qc.setQueryData([KEY], optimistic)
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData([KEY], ctx.prev)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })

  const updateM = useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Partial<Customer> }) => updateCustomer(id, payload),
    onMutate: async ({ id, payload }) => {
      await qc.cancelQueries({ queryKey: [KEY] })
      const prev = qc.getQueryData<any>([KEY])
      if (prev && prev.items) {
        const optimistic = { ...prev, items: prev.items.map((c: Customer) => c.id === id ? { ...c, ...payload } : c) }
        qc.setQueryData([KEY], optimistic)
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => { if (ctx?.prev) qc.setQueryData([KEY], ctx.prev) },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [KEY, vars.id] })
      qc.invalidateQueries({ queryKey: [KEY] })
    }
  })

  const deleteM = useMutation({
    mutationFn: (id: string | number) => deleteCustomer(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [KEY] })
      const prev = qc.getQueryData<any>([KEY])
      if (prev && prev.items) {
        const optimistic = { ...prev, items: prev.items.filter((c: Customer) => c.id !== id) }
        qc.setQueryData([KEY], optimistic)
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => { if (ctx?.prev) qc.setQueryData([KEY], ctx.prev) },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] })
  })

  return { createM, updateM, deleteM }
}
