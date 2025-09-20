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
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function useAuthLogic(): AuthContextValue {
  const qc = useQueryClient()
  const [user, setUser] = useState<AuthResponse['user'] | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Initialize from stored tokens on app start
  useEffect(() => {
    try {
      const storedAccess = localStorage.getItem('auth_access')
      const storedRefresh = localStorage.getItem('auth_refresh')
      const rememberEnabled = localStorage.getItem('auth_remember') === 'true'
      
      if (storedAccess && rememberEnabled) {
        setAuthTokens({ access: storedAccess, refresh: storedRefresh })
      }
    } catch (e) {
      console.warn('Failed to restore auth tokens:', e)
    }
    setHydrated(true)
  }, [])

  const profileQuery = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      try {
        const profile = await getProfile()
        setUser(profile)
        setAuthError(null)
        return profile
      } catch (e: any) {
        setUser(null)
        throw e
      }
    },
    enabled: hydrated,
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (unauthorized)
      if (error?.response?.status === 401) return false
      return failureCount < 2
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload & { remember?: boolean }) => {
      setAuthError(null)
      return await login(payload)
    },
    onSuccess: (data) => {
      setUser(data.user)
      setAuthError(null)
      qc.setQueryData(PROFILE_KEY, data.user)
    },
    onError: (e: any) => {
      setAuthError(e?.message || 'Authentication failed')
      setUser(null)
    }
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logout()
    },
    onSuccess: () => {
      setUser(null)
      setAuthError(null)
      qc.clear()
    },
    onError: (e: any) => {
      // Even if logout fails, clear local state
      console.warn('Logout error:', e)
      setUser(null)
      setAuthError(null)
      hardLogout()
      qc.clear()
    }
  })

  const forceRefresh = useCallback(async () => {
    try {
      setAuthError(null)
      await refreshSession()
      await qc.invalidateQueries({ queryKey: PROFILE_KEY })
    } catch (e: any) {
      console.warn('Token refresh failed:', e)
      hardLogout()
      setUser(null)
      setAuthError('Session expired. Please log in again.')
      qc.clear()
    }
  }, [qc])

  const autoLogoutOn401 = useCallback((err: any) => {
    if (err?.response?.status === 401) {
      console.warn('401 error, logging out:', err)
      hardLogout()
      setUser(null)
      setAuthError('Your session has expired. Please log in again.')
      qc.clear()
    }
  }, [qc])

  // Handle profile query errors
  useEffect(() => {
    if (profileQuery.isError) {
      autoLogoutOn401(profileQuery.error)
    }
  }, [profileQuery.isError, autoLogoutOn401, profileQuery.error])

  const clearError = useCallback(() => {
    setAuthError(null)
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    loading: !hydrated || profileQuery.isLoading || loginMutation.isPending,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    error: authError,
    refreshing: profileQuery.isFetching,
    refreshTokens: forceRefresh,
    clearError,
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useAuthLogic()
  const memoValue = useMemo(() => value, [
    value.user, 
    value.loading, 
    value.error, 
    value.refreshing,
    value.isAuthenticated
  ])
  return <AuthContext.Provider value={memoValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
