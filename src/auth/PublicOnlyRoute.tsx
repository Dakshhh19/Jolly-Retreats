import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import AuthService from '@/services/authService'
import { getPostAuthRoute } from '@/auth/privileges'

interface PublicOnlyRouteProps {
  children: ReactNode
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  if (AuthService.isAuthenticated()) {
    return <Navigate to={getPostAuthRoute(AuthService.getUserRole())} replace />
  }

  return <>{children}</>
}

export default PublicOnlyRoute
