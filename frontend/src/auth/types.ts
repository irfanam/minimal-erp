export interface User {
  id: number | string
  username: string
  first_name: string
  last_name: string
  email: string
  role: 'admin' | 'manager' | 'staff'
  department: string | null
  phone: string | null
  avatar: string | null
  avatarUrl?: string // computed from avatar field
  company?: string
  permissions: string[]
}

export interface AuthTokens {
  access: string
  refresh: string
  expiresAt?: number // optional epoch ms for access token
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  loading: boolean
  initialized: boolean
  error?: string
}

export type PermissionCheck = (perm: string | string[]) => boolean
