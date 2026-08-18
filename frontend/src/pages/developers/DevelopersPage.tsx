import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Activity, Code2, Users } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { developersService } from '@/services'
import { queryKeys } from '@/lib/queryClient'
import { formatDate } from '@/lib/utils'
import { MetricTile, PageHeader, QueryState, formatScore } from '../pageUtils'

import type { Developer } from '@/types'

export function DevelopersPage() {
  const developersQuery = useQuery({
    queryKey: queryKeys.leaderboard.developers({ limit: 100 }),
    queryFn: () => developersService.getAll(),
  })

  const rawDevelopers = developersQuery.data
  const developers: Developer[] = Array.isArray(rawDevelopers)
    ? rawDevelopers
    : (rawDevelopers && typeof rawDevelopers === 'object' && Array.isArray((rawDevelopers as any).entries))
    ? (rawDevelopers as any).entries
    : []
  const activeCount = developers.filter((developer) => developer.status === 'ACTIVE').length
  const avgDqs =
    developers.length > 0
      ? developers.reduce((sum, developer) => sum + (developer.dqs ?? 0), 0) / developers.length
      : 0

  return (
    <div>
      <PageHeader title="Developers" description="Track developer quality signals, activity, and status." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricTile label="Developers" value={developers.length} icon={<Users className="h-5 w-5" />} />
        <MetricTile label="Active" value={activeCount} icon={<Activity className="h-5 w-5" />} />
        <MetricTile label="Average DQS" value={formatScore(avgDqs)} icon={<Code2 className="h-5 w-5" />} />
      </div>

      <QueryState isLoading={developersQuery.isLoading} error={developersQuery.error} onRetry={() => developersQuery.refetch()}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {developers.map((developer) => (
            <Link key={developer.id} to={`/developers/${developer.id}`}>
              <Card className="h-full transition-colors hover:border-blue-300 dark:hover:border-blue-700">
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <Avatar name={developer.name || developer.email} src={developer.avatarUrl} />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-semibold text-slate-950 dark:text-white">{developer.name}</h2>
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">{developer.email}</p>
                    </div>
                    <Badge variant={developer.status === 'ACTIVE' ? 'success' : 'secondary'}>{developer.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">DQS</p>
                      <p className="font-semibold text-slate-950 dark:text-white">{formatScore(developer.dqs)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Role</p>
                      <p className="font-semibold text-slate-950 dark:text-white">{developer.role}</p>
                    </div>
                  </div>
                  <p className="mt-auto text-xs text-slate-500 dark:text-slate-400">
                    Last active {developer.lastActive ? formatDate(developer.lastActive) : 'not available'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </QueryState>
    </div>
  )
}
