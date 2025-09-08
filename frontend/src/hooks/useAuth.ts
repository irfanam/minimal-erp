import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { login, logout, getProfile, refreshSession, type LoginPayload, type AuthResponse, hardLogout } from '../services/api/authService'
import { useCallback, useState } from 'react'

const PROFILE_KEY = ['auth','profile']

export function useAuth() {
  const qc = useQueryClient()
  const [user, setUser] = useState<AuthResponse['user'] | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  const profileQuery = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const profile = await getProfile()
      setUser(profile as any)
      return profile
    },
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false
      return failureCount < 2
    },
    staleTime: 60_000,
  })

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data) => {
      setUser(data.user)
      setAuthError(null)
      qc.invalidateQueries({ queryKey: PROFILE_KEY })
    },
    onError: (e: any) => {
      setAuthError(e?.message || 'Authentication failed')
    }
  })

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      setUser(null)
      qc.clear()
    },
  })

  const forceRefresh = useCallback(async () => {
    try {
      await refreshSession()
      await qc.invalidateQueries({ queryKey: PROFILE_KEY })
    } catch (e) {
      hardLogout()
      setUser(null)
      setAuthError('Session expired. Please log in again.')
    }
  }, [qc])

  const autoLogoutOn401 = useCallback((err: any) => {
    if (err?.response?.status === 401) {
      hardLogout()
      setUser(null)
    }
  }, [])

  if (profileQuery.isError) autoLogoutOn401((profileQuery as any).error)

  return {
    user,
    isAuthenticated: !!user,
    loading: profileQuery.isLoading || loginMutation.isPending,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    error: authError,
    refreshing: profileQuery.isFetching,
    refreshTokens: forceRefresh,
  }
}
