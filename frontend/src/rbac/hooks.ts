/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PermissionString } from './types'

export function usePermission(_permission: PermissionString) {
  return { hasPermission: true }
}

export function useRole(_requiredRole: string) {
  return true
}

export function useAnyRole(_requiredRoles: string[]) {
  return true
}
