import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { PermissionString, UserRole } from '../types'
import { usePermission, useRole, useUserRole } from '../hooks'
import { logAuthzFailure } from '../errors'
import { useAuthStore } from '@/stores/authStore'

export interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredPermission?: PermissionString
  redirectTo?: string
}

export function RouteGuard({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = '/forbidden',
}: RouteGuardProps) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const currentRole = useUserRole()

  const hasSingleRole = useRole(requiredRole || ('VIEWER' as UserRole))
  const permResult = usePermission(requiredPermission || ('*' as PermissionString))

  const roleCheck = requiredRole ? hasSingleRole : true
  const permCheck = requiredPermission ? permResult.hasPermission : true

  if (!roleCheck || !permCheck) {
    logAuthzFailure({
      userId: user?.id,
      userRole: currentRole,
      attemptedRoute: location.pathname,
      attemptedAction: requiredPermission || requiredRole || 'route_access',
      reason: !roleCheck
        ? `Required role: ${requiredRole}`
        : `Required permission: ${requiredPermission}`,
    })

    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <>{children}</>
}
