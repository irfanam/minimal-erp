import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createOrder, deleteOrder, getOrder, listOrders, transitionOrder, updateOrder, type Order, type OrderFilters } from '../services/api/orderService'

const KEY = 'orders'

export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: [KEY, filters],
    queryFn: () => listOrders(filters),
    keepPreviousData: true,
  })
}

export function useOrder(id?: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => getOrder(id!),
    enabled: !!id,
  })
}

export function useOrderMutations() {
  const qc = useQueryClient()
  const createM = useMutation({
    mutationFn: (payload: Partial<Order>) => createOrder(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
  const updateM = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Order> }) => updateOrder(id, payload),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }),
  })
  const deleteM = useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
  const transitionM = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => transitionOrder(id, action),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }),
  })
  return { createM, updateM, deleteM, transitionM }
}
