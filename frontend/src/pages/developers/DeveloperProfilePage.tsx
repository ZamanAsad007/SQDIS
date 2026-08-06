import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { GitCommit, ShieldCheck, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartSuspense, TrendChart } from '@/components/charts'
import { developersService } from '@/services'
import { formatDate, formatNumber } from '@/lib/utils'
import { MetricTile, PageHeader, QueryState, formatScore } from '../pageUtils'

export function DeveloperProfilePage() {
  const { id = '' } = useParams()
  const developerQuery = useQuery({
    queryKey: ['developers', 'detail', id],
    queryFn: () => developersService.getById(id),
    enabled: !!id,
  })
  const statsQuery = useQuery({
    queryKey: ['developers', 'stats', id],
    queryFn: () => developersService.getStats(id),
    enabled: !!id,
  })

  const developer = developerQuery.data
  const stats = statsQuery.data

  return (
    <div>
      <PageHeader
        title={developer?.name ?? stats?.name ?? 'Developer profile'}
        description={developer?.email ?? 'Developer score, commit, review, and coverage detail.'}
        action={developer?.status && <Badge variant={developer.status === 'ACTIVE' ? 'success' : 'secondary'}>{developer.status}</Badge>}
      />
      <QueryState
        isLoading={developerQuery.isLoading || statsQuery.isLoading}
        error={developerQuery.error || statsQuery.error}
        onRetry={() => {
          developerQuery.refetch()
          statsQuery.refetch()
        }}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile label="DQS" value={formatScore(stats?.dqs ?? developer?.dqs)} icon={<TrendingUp className="h-5 w-5" />} />
          <MetricTile label="Commits" value={formatNumber(stats?.commits ?? 0)} icon={<GitCommit className="h-5 w-5" />} />
          <MetricTile label="Coverage" value={`${formatScore(stats?.codeCoverage)}%`} icon={<ShieldCheck className="h-5 w-5" />} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>DQS trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartSuspense>
                <TrendChart
                  data={(stats?.dqsHistory ?? []).map((point) => ({
                    date: point.date,
                    label: formatDate(point.date, { month: 'short', day: 'numeric' }),
                    value: point.score,
                  }))}
                  valueLabel="DQS"
                />
              </ChartSuspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent commits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(stats?.recentCommits ?? []).slice(0, 6).map((commit) => (
                <div key={commit.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <p className="line-clamp-1 text-sm font-medium text-slate-950 dark:text-white">{commit.message}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {commit.sha.slice(0, 7)} · {formatDate(commit.committedAt)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </QueryState>
    </div>
  )
}
