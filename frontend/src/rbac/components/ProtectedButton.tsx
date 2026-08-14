import React from 'react'
import type { PermissionString, UserRole, PermissionCheckContext } from '../types'
import { usePermission, useRole, useAnyRole } from '../hooks'

export interface ProtectedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: PermissionString
  requiredRole?: UserRole
  requiredRoles?: UserRole[]
  context?: PermissionCheckContext
  fallbackMode?: 'hide' | 'disable'
  tooltipText?: string
}

export function ProtectedButton({
  children,
  permission,
  requiredRole,
  requiredRoles,
  context,
  fallbackMode = 'hide',
  disabled,
  title,
  tooltipText = 'You do not have permission to perform this action',
  ...props
}: ProtectedButtonProps) {
  const permResult = usePermission(permission || ('*' as PermissionString), context)
  const hasSingleRole = useRole(requiredRole || ('VIEWER' as UserRole))
  const hasMultipleRoles = useAnyRole(requiredRoles || [])

  const hasPerm = permission ? permResult.hasPermission : true
  const roleCheck = requiredRole ? hasSingleRole : true
  const rolesCheck = requiredRoles?.length ? hasMultipleRoles : true

  const isAllowed = hasPerm && roleCheck && rolesCheck

  if (!isAllowed) {
    if (fallbackMode === 'hide') {
      return null
    }
    return (
      <button
        {...props}
        disabled
        title={title || tooltipText}
        className={`${props.className || ''} opacity-50 cursor-not-allowed`}
      >
        {children}
      </button>
    )
  }

  return (
    <button {...props} disabled={disabled} title={title}>
      {children}
    </button>
  )
}
