import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PeriodSelector } from '@/components/ui/period-selector'
import { developersService } from '@/services'
import { queryKeys } from '@/lib/queryClient'
import { PageHeader, QueryState, formatScore } from './pageUtils'

import type { LeaderboardEntry } from '@/types'

type Period = 'week' | 'month' | 'quarter' | 'year' | 'all'

export function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('month')
  const leaderboardQuery = useQuery({
    queryKey: queryKeys.leaderboard.developers({ period, limit: 50 }),
    queryFn: () => developersService.getLeaderboard({ period, limit: 50 }),
  })

  const rawLeaderboard = leaderboardQuery.data
  const leaderboardEntries: LeaderboardEntry[] = Array.isArray(rawLeaderboard)
    ? rawLeaderboard
    : (rawLeaderboard && typeof rawLeaderboard === 'object' && Array.isArray((rawLeaderboard as any).entries))
    ? (rawLeaderboard as any).entries
    : []

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        description="Compare developer quality, review, commit, and coverage outcomes."
        action={<PeriodSelector value={period} onChange={(value) => setPeriod(value as Period)} />}
      />
      <QueryState isLoading={leaderboardQuery.isLoading} error={leaderboardQuery.error} onRetry={() => leaderboardQuery.refetch()}>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {leaderboardEntries.map((entry) => (
                <Link
                  key={entry.userId}
                  to={`/developers/${entry.userId}`}
                  className="grid gap-3 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 md:grid-cols-[4rem_1fr_repeat(4,6rem)] md:items-center"
                >
                  <Badge variant={entry.rank <= 3 ? 'warning' : 'secondary'}>#{entry.rank}</Badge>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950 dark:text-white">{entry.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Trend {entry.trend > 0 ? '+' : ''}{entry.trend}</p>
                  </div>
                  <Stat label="DQS" value={formatScore(entry.dqs)} />
                  <Stat label="SQS" value={formatScore(entry.sqs)} />
                  <Stat label="Commits" value={entry.commits} />
                  <Stat label="Coverage" value={`${formatScore(entry.coverage)}%`} />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </QueryState>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  )
}
