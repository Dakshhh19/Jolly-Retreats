import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import AuthService from '@/services/authService'
import { getDashboardRoute } from '@/auth/privileges'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'user' | 'admin'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const isAuthenticated = AuthService.isAuthenticated()
  const userRole = AuthService.getUserRole()

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role if specified
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={getDashboardRoute(userRole)} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
