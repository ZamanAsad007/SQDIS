import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores'

interface PublicRouteProps {
  redirectTo?: string
}

export function PublicRoute({ redirectTo = '/dashboard' }: PublicRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()
  const from = location.state && typeof location.state === 'object' && 'from' in location.state
    ? (location.state.from as { pathname?: string }).pathname
    : undefined

  if (isAuthenticated) {
    return <Navigate to={from || redirectTo} replace />
  }

  return <Outlet />
}
