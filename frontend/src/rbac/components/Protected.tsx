import React from 'react'
import type { PermissionString, UserRole, PermissionCheckContext } from '../types'
import { usePermission, useRole, useAnyRole } from '../hooks'

export interface ProtectedProps {
  children: React.ReactNode
  permission?: PermissionString
  requiredRole?: UserRole
  requiredRoles?: UserRole[]
  context?: PermissionCheckContext
  fallback?: React.ReactNode
}

export function Protected({
  children,
  permission,
  requiredRole,
  requiredRoles,
  context,
  fallback = null,
}: ProtectedProps) {
  const hasPerm = usePermission(permission || ('*' as PermissionString), context).hasPermission
  const hasSingleRole = useRole(requiredRole || ('VIEWER' as UserRole))
  const hasMultipleRoles = useAnyRole(requiredRoles || [])

  if (permission && !hasPerm) {
    return <>{fallback}</>
  }

  if (requiredRole && !hasSingleRole) {
    return <>{fallback}</>
  }

  if (requiredRoles && requiredRoles.length > 0 && !hasMultipleRoles) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
