export type {
  UserRole,
  PermissionCategory,
  PermissionAction,
  PermissionScope,
  PermissionString,
  PermissionCheckContext,
  PermissionCheckResult,
} from './types'

export { ROLE_HIERARCHY, PERMISSION_MATRIX, hasRoleLevel } from './config'
export { PermissionService, permissionService } from './permissionService'
export {
  useUserRole,
  usePermission,
  useRole,
  useAnyRole,
  useFilteredNavigation,
} from './hooks'
export { NAV_CONFIG, type NavItemConfig } from './navigationConfig'
export { filterDataByRole, type DataFilterContext } from './dataFilters'
export {
  type AuthErrorType,
  type AuthzErrorType,
  type AuthzFailureDetails,
  getAuthErrorMessage,
  getAuthzErrorMessage,
  logAuthzFailure,
} from './errors'
export {
  isValidPermissionString,
  parsePermissionString,
  createPermissionString,
} from './utils'
export * from './components'
