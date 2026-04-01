import { Navigate } from 'react-router-dom'
import AuthService from '@/services/authService'

export default function DashboardPage() {
  const role = AuthService.getUserRole()

  if (!AuthService.isAuthenticated() || !role) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={role === 'admin' ? '/admin-dashboard' : '/user-dashboard'} replace />
}
