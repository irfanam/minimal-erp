import { apiClient, setAuthTokens, clearAuthTokens, extractErrorMessage } from './apiClient'

// --- Types ---
export interface LoginPayload { username: string; password: string }
export interface UserProfile {
  id: number | string
  username: string
  first_name: string
  last_name: string
  email: string
  role: string
  department: string | null
  phone: string | null
  avatar: string | null
}
export interface AuthResponse { access: string; refresh?: string; user: UserProfile }

// Relative so the apiClient interceptor can prepend /api/ in dev proxy mode
const AUTH_PREFIX = 'auth'

export async function login(payload: LoginPayload & { remember?: boolean }): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>(`${AUTH_PREFIX}/login/`, payload)
    setAuthTokens({ access: data.access, refresh: data.refresh })
    // Optional persistence for silent reload (refresh token typically httpOnly cookie; access persisted only if needed)
    if (payload.remember) {
      try { localStorage.setItem('auth_access', data.access); if (data.refresh) localStorage.setItem('auth_refresh', data.refresh) } catch {}
    } else {
      try { localStorage.removeItem('auth_access'); localStorage.removeItem('auth_refresh') } catch {}
    }
    return data
  } catch (e) {
    throw new Error(extractErrorMessage(e))
  }
}

export async function logout(): Promise<void> {
  try { await apiClient.post(`${AUTH_PREFIX}/logout/`, {}) } catch { /* ignore network/log */ }
  clearAuthTokens()
}

export async function getProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<UserProfile>(`${AUTH_PREFIX}/profile/`)
  return data
}

export async function refreshSession(): Promise<{ access: string; refresh?: string }> {
  try {
    const { data } = await apiClient.post<{ access: string; refresh?: string }>(`${AUTH_PREFIX}/refresh/`, {})
    setAuthTokens({ access: data.access, refresh: data.refresh })
    return data
  } catch (e) {
    throw new Error(extractErrorMessage(e))
  }
}

export function hardLogout() {
  clearAuthTokens()
}
