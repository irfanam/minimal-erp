import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
// Updated to use new service-based auth hook
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  roles?: string[]
  permissions?: string[]
  redirectTo?: string
  loadingComponent?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles, permissions, redirectTo = '/login', loadingComponent }) => {
  const { user, loading } = useAuth()
  const hasPermission = () => true // TODO: wire permission system when backend roles/claims ready

  if (loading) return (loadingComponent || <div className="flex items-center justify-center h-60 text-sm text-neutral-500">Loading...</div>)

  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />
  }

  if (permissions && permissions.length > 0 && !hasPermission()) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
