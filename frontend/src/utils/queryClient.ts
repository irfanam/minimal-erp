import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
  cacheTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) return false
        return failureCount < 2
      },
    },
    mutations: {
      retry: 0,
    },
  },
})
