import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

interface ProtectedRouteProps {
  roles?: string[]
  permissions?: string[]
  redirectTo?: string
  loadingComponent?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles, permissions, redirectTo = '/login', loadingComponent }) => {
  const { user, initialized, hasPermission } = useAuth()

  if (!initialized) {
    return (
      loadingComponent || <div className="flex items-center justify-center h-60 text-sm text-neutral-500">Loading...</div>
    )
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />
  }

  if (permissions && permissions.length > 0 && !hasPermission(permissions)) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
