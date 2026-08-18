import type { UserRole, PermissionString } from './types'

export interface NavItemConfig {
  label: string
  path: string
  icon?: string
  requiredRole?: UserRole
  requiredPermission?: PermissionString
  children?: NavItemConfig[]
}

export const NAV_CONFIG: NavItemConfig[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Quality Scores', path: '/scores' },
  { label: 'Developers', path: '/developers' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Commits', path: '/commits' },
  { label: 'Coverage', path: '/coverage' },
  { label: 'Reviews', path: '/reviews' },
  {
    label: 'Teams',
    path: '/teams',
    requiredRole: 'TEAM_LEAD',
    requiredPermission: 'teams:view',
  },
  {
    label: 'Projects',
    path: '/projects',
    requiredRole: 'TEAM_LEAD',
    requiredPermission: 'projects:view',
  },
  {
    label: 'Sprints',
    path: '/sprints',
    requiredRole: 'TEAM_LEAD',
    requiredPermission: 'sprints:view',
  },
  {
    label: 'Releases',
    path: '/releases',
    requiredRole: 'ADMIN',
    requiredPermission: 'releases:view',
  },
  { label: 'Goals', path: '/goals' },
  {
    label: 'Alerts',
    path: '/alerts',
    requiredRole: 'TEAM_LEAD',
    requiredPermission: 'alerts:view',
  },
  {
    label: 'Tech Debt',
    path: '/debt',
    requiredRole: 'TEAM_LEAD',
    requiredPermission: 'debt:view',
  },
  { label: 'Reports', path: '/reports' },
  {
    label: 'Organization Members',
    path: '/dashboard/org-members',
    requiredRole: 'ADMIN',
    requiredPermission: 'organization:manage',
  },
  {
    label: 'Onboarding',
    path: '/onboarding',
    requiredRole: 'ADMIN',
    requiredPermission: 'onboarding:view',
  },
  {
    label: 'Audit Logs',
    path: '/audit-logs',
    requiredRole: 'ADMIN',
    requiredPermission: 'audit:view',
  },
  {
    label: 'Audit Analytics',
    path: '/audit-logs/analytics',
    requiredRole: 'ADMIN',
    requiredPermission: 'audit:view',
  },
  {
    label: 'Real-Time Monitor',
    path: '/audit-logs/monitor',
    requiredRole: 'ADMIN',
    requiredPermission: 'audit:view',
  },
  { label: 'Settings', path: '/settings' },
]
