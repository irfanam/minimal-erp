import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createInvoice, deleteInvoice, getInvoice, listInvoices, recordPayment, updateInvoice, type Invoice, type InvoiceFilters } from '../services/api/invoiceService'

const KEY = 'invoices'

export function useInvoices(filters: InvoiceFilters) {
  return useQuery({
    queryKey: [KEY, filters],
    queryFn: () => listInvoices(filters),
    keepPreviousData: true,
  })
}

export function useInvoice(id?: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => getInvoice(id!),
    enabled: !!id,
  })
}

export function useInvoiceMutations() {
  const qc = useQueryClient()
  const createM = useMutation({
    mutationFn: (payload: Partial<Invoice>) => createInvoice(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
  const updateM = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Invoice> }) => updateInvoice(id, payload),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }),
  })
  const deleteM = useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
  const recordPayM = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => recordPayment(id, amount),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }),
  })
  return { createM, updateM, deleteM, recordPayM }
}
