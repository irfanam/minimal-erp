import React, { useCallback, useEffect, useState, useContext, createContext, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { login, logout, getProfile, refreshSession, type LoginPayload, type AuthResponse, hardLogout } from '../services/api/authService'
import { setAuthTokens } from '../services/api/apiClient'

const PROFILE_KEY = ['auth','profile']

interface AuthContextValue {
  user: AuthResponse['user'] | null
  isAuthenticated: boolean
  loading: boolean
  login: (payload: LoginPayload & { remember?: boolean }) => Promise<AuthResponse>
  logout: () => Promise<void>
  error: string | null
  refreshing: boolean
  refreshTokens: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function useAuthLogic(): AuthContextValue {
  const qc = useQueryClient()
  const [user, setUser] = useState<AuthResponse['user'] | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const storedAccess = localStorage.getItem('auth_access')
      const storedRefresh = localStorage.getItem('auth_refresh')
      if (storedAccess) setAuthTokens({ access: storedAccess, refresh: storedRefresh })
    } catch {}
    setHydrated(true)
  }, [])

  const profileQuery = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const profile = await getProfile()
      setUser(profile as any)
      return profile
    },
    enabled: hydrated,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false
      return failureCount < 2
    },
    staleTime: 60_000,
  })

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload & { remember?: boolean }) => login(payload),
    onSuccess: (data) => {
      setUser(data.user)
      setAuthError(null)
      qc.invalidateQueries({ queryKey: PROFILE_KEY })
    },
    onError: (e: any) => setAuthError(e?.message || 'Authentication failed')
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

  useEffect(() => {
    if (profileQuery.isError) autoLogoutOn401((profileQuery as any).error)
  }, [profileQuery.isError, autoLogoutOn401, profileQuery])

  return {
    user,
    isAuthenticated: !!user,
    loading: !hydrated || profileQuery.isLoading || loginMutation.isPending,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    error: authError,
    refreshing: profileQuery.isFetching,
    refreshTokens: forceRefresh,
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useAuthLogic()
  const memoValue = useMemo(() => value, [value.user, value.loading, value.error, value.refreshing])
  return <AuthContext.Provider value={memoValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
