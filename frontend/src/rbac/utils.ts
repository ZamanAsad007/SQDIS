import type { PermissionCategory, PermissionAction, PermissionScope, PermissionString } from './types'

export function isValidPermissionString(permission: string): boolean {
  if (permission === '*') return true
  const parts = permission.split(':')
  return parts.length >= 2 && parts.length <= 3
}

export function parsePermissionString(permission: PermissionString): {
  category: PermissionCategory | string
  action: PermissionAction | string
  scope?: PermissionScope | string
} {
  const parts = permission.split(':')
  return {
    category: parts[0],
    action: parts[1] || '',
    scope: parts[2],
  }
}

export function createPermissionString(
  category: PermissionCategory,
  action: PermissionAction,
  scope?: PermissionScope
): PermissionString {
  if (scope) {
    return `${category}:${action}:${scope}` as PermissionString
  }
  return `${category}:${action}` as PermissionString
}
