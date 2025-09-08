import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { login, logout, me, type LoginPayload, type AuthResponse } from '../services/api/authService'
import { useState } from 'react'

const KEY = ['auth','me']

export function useAuth() {
  const qc = useQueryClient()
  const [user, setUser] = useState<any>(null)

  const meQuery = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const u = await me()
      setUser(u)
      return u
    },
    retry: 1,
  })

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data: AuthResponse) => {
      setUser(data.user)
      qc.invalidateQueries({ queryKey: KEY })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      setUser(null)
      qc.clear()
    },
  })

  return {
    user,
    isAuthenticated: !!user,
    loading: meQuery.isLoading || loginMutation.isPending,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refreshing: meQuery.isFetching,
  }
}
