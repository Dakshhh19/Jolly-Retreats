export type AppRole = 'user' | 'admin' | null

export function canCreateReservation(role: AppRole): boolean {
  return role === 'user'
}

export function getDashboardRoute(role: AppRole): string {
  return role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
}

export function getPostAuthRoute(role: AppRole): string {
  return role === 'admin' ? '/admin-dashboard' : '/'
}
