export interface User {
  id: string
  email: string
  name: string
  role: string
  avatarUrl?: string
  company?: string
  permissions: string[]
}

export interface AuthTokens {
  access: string
  refresh: string
  expiresAt: number // epoch ms for access token
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  loading: boolean
  initialized: boolean
  error?: string
}

export type PermissionCheck = (perm: string | string[]) => boolean
