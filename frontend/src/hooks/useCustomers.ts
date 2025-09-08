import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCustomer, deleteCustomer, getCustomer, listCustomers, updateCustomer, type Customer, type CustomerFilters } from '../services/api/customerService'

const KEY = 'customers'

export function useCustomers(filters: CustomerFilters) {
  const query = useQuery({
    queryKey: [KEY, filters],
    queryFn: () => listCustomers(filters),
    keepPreviousData: true,
  })
  return query
}

export function useCustomer(id?: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => getCustomer(id!),
    enabled: !!id,
  })
}

export function useCustomerMutations() {
  const qc = useQueryClient()
  const createM = useMutation({
    mutationFn: (payload: Partial<Customer>) => createCustomer(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
  const updateM = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Customer> }) => updateCustomer(id, payload),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }),
  })
  const deleteM = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
  return { createM, updateM, deleteM }
}
