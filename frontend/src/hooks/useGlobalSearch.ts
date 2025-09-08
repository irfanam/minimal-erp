import { useQuery } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '../services/api/apiClient'
import { CORE_PATHS } from '../constants/apiPaths'

export interface GlobalSearchResultItem {
  type: string
  id: number
  [key: string]: any
}

export interface GlobalSearchResponse {
  query: string
  count: number
  results: GlobalSearchResultItem[]
}

export function useGlobalSearch(term: string, limit = 10, enabled = true) {
  return useQuery<GlobalSearchResponse, Error>({
    queryKey: ['global-search', { term, limit }],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(CORE_PATHS.globalSearch(), { params: { q: term, limit } })
        return data
      } catch (e: any) {
        throw new Error(extractErrorMessage(e))
      }
    },
    enabled: enabled && !!term.trim(),
    staleTime: 10_000,
    retry: 1,
  })
}
