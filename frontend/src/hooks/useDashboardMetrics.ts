import { useQuery } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '../services/api/apiClient'
import { CORE_PATHS } from '../constants/apiPaths'

export interface DashboardMetricsResponse {
  range: { start: string; end: string }
  sales: { total_sales: string; recent_orders: any[]; pending_invoices: number }
  inventory: { total_products: number; low_stock: number; inventory_value: string }
  customers: { total_customers: number; new_customers: number }
  financial: { outstanding_receivables: string; monthly_revenue: string }
}

export function useDashboardMetrics(params?: { start?: string; end?: string; refetchIntervalMs?: number }) {
  const { start, end, refetchIntervalMs } = params || {}
  return useQuery<DashboardMetricsResponse, Error>({
    queryKey: ['dashboard-metrics', { start, end }],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(CORE_PATHS.dashboardMetrics(), { params: { start, end } })
        return data
      } catch (e: any) {
        throw new Error(extractErrorMessage(e))
      }
    },
    staleTime: 30_000,
    refetchInterval: refetchIntervalMs ?? 60_000,
    refetchOnWindowFocus: true,
    retry: 2,
  })
}
