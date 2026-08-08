import type { UserRole } from './types'

export interface DataFilterContext {
  userId?: string
  userRole?: UserRole
  teamIds?: string[]
}

export function filterDataByRole<T extends { userId?: string; teamId?: string }>(
  data: T[],
  context: DataFilterContext
): T[] {
  if (!context.userRole) return []

  if (context.userRole === 'OWNER' || context.userRole === 'ADMIN') {
    return data
  }

  if (context.userRole === 'TEAM_LEAD') {
    if (!context.teamIds || context.teamIds.length === 0) return data
    return data.filter((item) => !item.teamId || context.teamIds?.includes(item.teamId))
  }

  if (context.userRole === 'DEVELOPER') {
    return data.filter(
      (item) =>
        (context.userId && item.userId === context.userId) ||
        (context.teamIds && item.teamId && context.teamIds.includes(item.teamId))
    )
  }

  return data
}
