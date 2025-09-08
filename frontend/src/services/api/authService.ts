import { apiClient, setAuthTokens, clearAuthTokens, extractErrorMessage } from './apiClient'

export interface LoginPayload { username: string; password: string }
export interface AuthResponse { user: any; access: string; refresh?: string }
export interface User { id: string; username: string; roles?: string[] }

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
  setAuthTokens({ access: data.access, refresh: data.refresh })
  return data
}

export async function logout() {
  try { await apiClient.post('/auth/logout') } catch (_) { /* ignore */ }
  clearAuthTokens()
}

export async function me() {
  const { data } = await apiClient.get<User>('/auth/me')
  return data
}

export async function refreshSession() {
  try {
    const { data } = await apiClient.post<AuthResponse>('/auth/refresh', {})
    setAuthTokens({ access: data.access, refresh: data.refresh })
    return data
  } catch (e) {
    throw new Error(extractErrorMessage(e))
  }
}
