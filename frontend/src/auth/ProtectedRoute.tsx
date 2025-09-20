import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  roles?: ('admin' | 'manager' | 'staff')[]
  permissions?: string[]
  redirectTo?: string
  loadingComponent?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  roles, 
  permissions, 
  redirectTo = '/login', 
  loadingComponent 
}) => {
  const { user, loading, error } = useAuth()

  if (loading) {
    return (
      loadingComponent || 
      <div className="flex items-center justify-center h-60 text-sm text-neutral-500">
        <div className="text-center space-y-2">
          <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return <Navigate to={redirectTo} replace />
  }

  // Role-based access control
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    console.warn(`User ${user.username} with role ${user.role} attempted to access route requiring roles:`, roles)
    return <Navigate to="/unauthorized" replace />
  }

  // TODO: Implement permission-based access control when backend supports it
  if (permissions && permissions.length > 0) {
    // For now, allow all authenticated users
    // In the future, check user.permissions against required permissions
  }

  return <Outlet />
}
