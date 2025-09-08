import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { AuthState, User, AuthTokens, PermissionCheck } from './types'

interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

interface AuthContextValue extends AuthState {
  login: (creds: LoginCredentials) => Promise<boolean>
  logout: () => void
  refresh: () => Promise<void>
  hasPermission: PermissionCheck
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const ACCESS_REFRESH_BUFFER_MS = 30_000 // refresh if expiring in next 30s

function decodeJwt(token: string): any {
  try {
    const [, payload] = token.split('.')
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

function getExpiry(token: string): number {
  const decoded = decodeJwt(token)
  if (!decoded || !decoded.exp) return Date.now() + 5 * 60 * 1000
  return decoded.exp * 1000
}

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ user: null, tokens: null, loading: false, initialized: false })
  const refreshTimer = useRef<number | null>(null)

  const scheduleRefresh = useCallback((tokens: AuthTokens) => {
    if (refreshTimer.current) window.clearTimeout(refreshTimer.current)
    const delay = Math.max(5_000, tokens.expiresAt - Date.now() - ACCESS_REFRESH_BUFFER_MS)
    refreshTimer.current = window.setTimeout(() => {
      refresh().catch(() => {})
    }, delay)
  }, [])

  const persist = (tokens: AuthTokens | null, remember?: boolean) => {
    if (tokens && remember) {
      localStorage.setItem('auth_tokens', JSON.stringify(tokens))
    } else {
      localStorage.removeItem('auth_tokens')
    }
  }

  const loadPersisted = () => {
    try {
      const raw = localStorage.getItem('auth_tokens')
      if (!raw) return null
      const parsed: AuthTokens = JSON.parse(raw)
      if (parsed.expiresAt < Date.now()) return null
      return parsed
    } catch {
      return null
    }
  }

  const login = useCallback(async (creds: LoginCredentials) => {
    setState(s => ({ ...s, loading: true, error: undefined }))
    try {
      // TODO: replace with real API call
      // const res = await axios.post('/api/auth/login', creds)
      // const { access, refresh, user } = res.data
      const fakeAccess = 'fake.access.token'
      const fakeRefresh = 'fake.refresh.token'
      const tokens: AuthTokens = { access: fakeAccess, refresh: fakeRefresh, expiresAt: Date.now() + 15 * 60 * 1000 }
      const user: User = { id: '1', email: creds.email, name: 'Demo User', role: 'Administrator', permissions: ['*'], company: 'Acme Corp' }
      persist(tokens, creds.remember)
      setState({ user, tokens, loading: false, initialized: true })
      scheduleRefresh(tokens)
      return true
    } catch (e: any) {
      setState(s => ({ ...s, loading: false, error: e.message || 'Login failed' }))
      return false
    }
  }, [scheduleRefresh])

  const logout = useCallback(() => {
    persist(null)
    if (refreshTimer.current) window.clearTimeout(refreshTimer.current)
    setState({ user: null, tokens: null, loading: false, initialized: true })
  }, [])

  const refresh = useCallback(async () => {
    if (!state.tokens) return
    try {
      // TODO: replace with real refresh call
      const newAccess = state.tokens.access // placeholder
      const expiresAt = getExpiry(newAccess)
      const tokens: AuthTokens = { ...state.tokens, access: newAccess, expiresAt }
      persist(tokens, true)
      setState(s => ({ ...s, tokens }))
      scheduleRefresh(tokens)
    } catch (e) {
      logout()
    }
  }, [state.tokens, logout, scheduleRefresh])

  const hasPermission: PermissionCheck = useCallback((perm) => {
    if (!state.user) return false
    if (state.user.permissions.includes('*')) return true
    if (Array.isArray(perm)) return perm.every(p => state.user!.permissions.includes(p))
    return state.user.permissions.includes(perm)
  }, [state.user])

  // init from storage
  useEffect(() => {
    const persisted = loadPersisted()
    if (persisted) {
      const user: User = { id: '1', email: 'demo@example.com', name: 'Demo User', role: 'Administrator', permissions: ['*'], company: 'Acme Corp' }
      setState({ user, tokens: persisted, loading: false, initialized: true })
      scheduleRefresh(persisted)
    } else {
      setState(s => ({ ...s, initialized: true }))
    }
  }, [scheduleRefresh])

  useEffect(() => () => { if (refreshTimer.current) window.clearTimeout(refreshTimer.current) }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refresh, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
