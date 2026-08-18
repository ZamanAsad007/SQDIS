import type { PermissionString, UserRole, PermissionCheckContext, PermissionCheckResult } from './types'
import { permissionService } from './permissionService'
import { useAuthStore } from '@/stores/authStore'
import { useOrganizationStore } from '@/stores/organizationStore'
import { NAV_CONFIG, type NavItemConfig } from './navigationConfig'

export function useUserRole(): UserRole {
  const user = useAuthStore((state) => state.user)
  const currentOrganization = useOrganizationStore((state) => state.currentOrganization)

  if (currentOrganization?.role) {
    return currentOrganization.role
  }
  if (user?.role) {
    return user.role
  }
  if (user?.memberships && user.memberships.length > 0) {
    if (currentOrganization) {
      const membership = user.memberships.find((m) => m.organizationId === currentOrganization.id)
      if (membership?.role) return membership.role
    }
    return user.memberships[0].role
  }
  // Default to OWNER if user is logged in so all standard modules are visible
  return 'OWNER'
}

export function usePermission(
  permission: PermissionString,
  context?: PermissionCheckContext
): PermissionCheckResult {
  const role = useUserRole()
  return permissionService.hasPermission(role, permission, context)
}

export function useRole(requiredRole: UserRole): boolean {
  const role = useUserRole()
  return permissionService.hasRole(role, requiredRole)
}

export function useAnyRole(requiredRoles: UserRole[]): boolean {
  const role = useUserRole()
  return permissionService.hasAnyRole(role, requiredRoles)
}

export function useFilteredNavigation(): NavItemConfig[] {
  const role = useUserRole()

  return NAV_CONFIG.filter((item) => {
    if (item.requiredRole && !permissionService.hasRole(role, item.requiredRole)) {
      return false
    }
    if (item.requiredPermission && !permissionService.hasPermission(role, item.requiredPermission).hasPermission) {
      return false
    }
    return true
  })
}
