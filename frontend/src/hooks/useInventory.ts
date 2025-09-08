import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listProducts, getProduct, updateProduct, type Product, listInventory, getInventoryRecord, updateInventoryRecord, type InventoryRecord, getProductStockLevel } from '../services/api/productService'

const PRODUCT_KEY = 'products'
const INVENTORY_KEY = 'inventory'

export interface ProductFilters { page?: number; page_size?: number; search?: string }
export interface InventoryFilters { page?: number; page_size?: number; product?: string | number }

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: [PRODUCT_KEY, filters],
    queryFn: () => listProducts(filters as any),
    keepPreviousData: true,
    staleTime: 30_000,
  })
}

export function useProduct(id?: string | number) {
  return useQuery({
    queryKey: [PRODUCT_KEY, id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  })
}

export function useInventoryRecords(filters: InventoryFilters) {
  return useQuery({
    queryKey: [INVENTORY_KEY, filters],
    queryFn: () => listInventory(filters as any),
    keepPreviousData: true,
    staleTime: 15_000,
  })
}

export function useInventoryRecord(id?: string | number) {
  return useQuery({
    queryKey: [INVENTORY_KEY, id],
    queryFn: () => getInventoryRecord(id!),
    enabled: !!id,
  })
}

export function useStockLevel(productId?: string | number) {
  return useQuery({
    queryKey: [INVENTORY_KEY, 'stock-level', productId],
    queryFn: () => getProductStockLevel(productId!),
    enabled: !!productId,
    refetchInterval: 20_000,
  })
}

export function useInventoryMutations() {
  const qc = useQueryClient()

  const updateProd = useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Partial<Product> }) => updateProduct(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [PRODUCT_KEY, vars.id] })
      qc.invalidateQueries({ queryKey: [PRODUCT_KEY] })
    }
  })

  const adjustInventory = useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Partial<InventoryRecord> }) => updateInventoryRecord(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [INVENTORY_KEY, vars.id] })
      qc.invalidateQueries({ queryKey: [INVENTORY_KEY] })
      qc.invalidateQueries({ queryKey: [INVENTORY_KEY, 'stock-level'] })
    }
  })

  return { updateProd, adjustInventory }
}

export function deriveLowStock(records: InventoryRecord[], factor = 1) {
  return records.filter(r => r.on_hand <= (r.reorder_level || 0) * factor)
}
