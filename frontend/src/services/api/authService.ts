import { apiClient, setAuthTokens, clearAuthTokens, extractErrorMessage, getRefreshToken } from './apiClient'

// --- Types ---
export interface LoginPayload { 
  username: string; 
  password: string; 
}

export interface UserProfile {
  id: number | string
  username: string
  first_name: string
  last_name: string
  email: string
  role: 'admin' | 'manager' | 'staff'
  department: string | null
  phone: string | null
  avatar: string | null
}

export interface AuthResponse { 
  access: string; 
  refresh: string; 
  user: UserProfile 
}

// Use exact Django endpoint paths
const AUTH_PREFIX = 'auth'

export async function login(payload: LoginPayload & { remember?: boolean }): Promise<AuthResponse> {
  try {
    // Django expects trailing slash
    const { data } = await apiClient.post<AuthResponse>(`${AUTH_PREFIX}/login/`, {
      username: payload.username,
      password: payload.password
    })
    
    setAuthTokens({ access: data.access, refresh: data.refresh })
    
    // Optional persistence for remember me functionality
    if (payload.remember) {
      try { 
        localStorage.setItem('auth_access', data.access)
        localStorage.setItem('auth_refresh', data.refresh)
        localStorage.setItem('auth_remember', 'true')
      } catch (e) {
        console.warn('Failed to persist auth tokens:', e)
      }
    } else {
      try { 
        localStorage.removeItem('auth_access')
        localStorage.removeItem('auth_refresh') 
        localStorage.removeItem('auth_remember')
      } catch (e) {
        console.warn('Failed to clear auth tokens:', e)
      }
    }
    
    return data
  } catch (e: any) {
    // Enhanced error handling for common authentication issues
    if (e.response?.status === 400) {
      const errorData = e.response.data
      if (errorData.error) {
        throw new Error(errorData.error)
      }
      throw new Error('Invalid username or password')
    }
    throw new Error(extractErrorMessage(e))
  }
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken()
  try { 
    // Send refresh token for blacklisting
    await apiClient.post(`${AUTH_PREFIX}/logout/`, { 
      refresh: refreshToken 
    }) 
  } catch (e) { 
    console.warn('Logout request failed:', e)
  }
  
  // Clear all authentication state
  clearAuthTokens()
  try {
    localStorage.removeItem('auth_access')
    localStorage.removeItem('auth_refresh')
    localStorage.removeItem('auth_remember')
    localStorage.removeItem('last_username')
  } catch (e) {
    console.warn('Failed to clear stored auth data:', e)
  }
}

export async function getProfile(): Promise<UserProfile> {
  try {
    const { data } = await apiClient.get<UserProfile>(`${AUTH_PREFIX}/profile/`)
    return data
  } catch (e: any) {
    throw new Error(extractErrorMessage(e))
  }
}

export async function refreshSession(): Promise<{ access: string; refresh?: string }> {
  try {
    // Get refresh token from memory or storage
    const token = getRefreshToken() || (() => { 
      try { 
        return localStorage.getItem('auth_refresh') 
      } catch { 
        return null 
      } 
    })()
    
    if (!token) {
      throw new Error('No refresh token available')
    }
    
    const { data } = await apiClient.post<{ access: string; refresh?: string }>(`${AUTH_PREFIX}/refresh/`, { 
      refresh: token 
    })
    
    setAuthTokens({ access: data.access, refresh: data.refresh })
    
    // Update stored tokens if remember was enabled
    try {
      const rememberEnabled = localStorage.getItem('auth_remember') === 'true'
      if (rememberEnabled) {
        localStorage.setItem('auth_access', data.access)
        if (data.refresh) {
          localStorage.setItem('auth_refresh', data.refresh)
        }
      }
    } catch (e) {
      console.warn('Failed to update stored tokens:', e)
    }
    
    return data
  } catch (e: any) {
    // Clear tokens on refresh failure
    clearAuthTokens()
    try {
      localStorage.removeItem('auth_access')
      localStorage.removeItem('auth_refresh')
      localStorage.removeItem('auth_remember')
    } catch {}
    throw new Error(extractErrorMessage(e))
  }
}

export function hardLogout() {
  clearAuthTokens()
  try {
    localStorage.removeItem('auth_access')
    localStorage.removeItem('auth_refresh')
    localStorage.removeItem('auth_remember')
    localStorage.removeItem('last_username')
  } catch (e) {
    console.warn('Failed to clear auth storage:', e)
  }
}
