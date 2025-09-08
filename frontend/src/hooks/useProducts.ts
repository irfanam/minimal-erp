import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct, type Product, type ProductFilters } from '../services/api/productService'

const KEY = 'products'

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: [KEY, filters],
    queryFn: () => listProducts(filters),
    keepPreviousData: true,
  })
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  })
}

export function useProductMutations() {
  const qc = useQueryClient()
  const createM = useMutation({
    mutationFn: (payload: Partial<Product>) => createProduct(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
  const updateM = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Product> }) => updateProduct(id, payload),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }),
  })
  const deleteM = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
  return { createM, updateM, deleteM }
}
