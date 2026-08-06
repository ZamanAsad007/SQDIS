import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GitCommit, GitPullRequest, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CommitChart, ChartSuspense } from '@/components/charts'
import { commitsService } from '@/services'
import { queryKeys } from '@/lib/queryClient'
import { formatDate, formatNumber } from '@/lib/utils'
import { MetricTile, PageHeader, QueryState } from '../pageUtils'

export function CommitsPage() {
  const [search, setSearch] = useState('')
  const commitsQuery = useQuery({
    queryKey: queryKeys.commits.all({ search }),
    queryFn: () => commitsService.getAll({ search: search || undefined, pageSize: 50 }),
  })
  const statsQuery = useQuery({
    queryKey: queryKeys.commits.stats(),
    queryFn: () => commitsService.getStats(),
  })

  const commits = commitsQuery.data ?? []
  const chartData = useMemo(
    () =>
      commits.slice(0, 14).reverse().map((commit) => ({
        date: formatDate(commit.committedAt, { month: 'short', day: 'numeric' }),
        commits: 1,
        additions: commit.insertions,
        deletions: commit.deletions,
      })),
    [commits]
  )

  return (
    <div>
      <PageHeader
        title="Commits"
        description="Review commit volume, churn, and quality classifications."
        action={
          <Input
            className="w-64"
            placeholder="Search commits"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricTile label="Total commits" value={formatNumber(statsQuery.data?.totalCommits ?? commits.length)} icon={<GitCommit className="h-5 w-5" />} />
        <MetricTile label="Insertions" value={formatNumber(statsQuery.data?.totalInsertions ?? 0)} icon={<GitPullRequest className="h-5 w-5" />} />
        <MetricTile label="Deletions" value={formatNumber(statsQuery.data?.totalDeletions ?? 0)} icon={<GitPullRequest className="h-5 w-5" />} />
      </div>

      <QueryState isLoading={commitsQuery.isLoading} error={commitsQuery.error} onRetry={() => commitsQuery.refetch()}>
        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          <Card>
            <CardContent className="p-5">
              <ChartSuspense>
                <CommitChart data={chartData} />
              </ChartSuspense>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-5">
              <p className="font-semibold text-slate-950 dark:text-white">Top authors</p>
              {(statsQuery.data?.topAuthors ?? []).slice(0, 6).map((author) => (
                <div key={author.authorId} className="flex items-center justify-between text-sm">
                  <span className="truncate text-slate-600 dark:text-slate-300">{author.name}</span>
                  <Badge variant="secondary">{author.count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardContent className="divide-y divide-slate-200 p-0 dark:divide-slate-800">
            {commits.map((commit) => (
              <div key={commit.id} className="grid gap-3 p-4 md:grid-cols-[1fr_9rem_8rem_7rem] md:items-center">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-950 dark:text-white">{commit.message}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {commit.authorName} · {commit.sha.slice(0, 7)} · {commit.branch}
                  </p>
                </div>
                <Badge variant="outline">{commit.classification}</Badge>
                <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(commit.committedAt)}</span>
                <span className="text-sm font-medium text-slate-950 dark:text-white">
                  +{commit.insertions} / -{commit.deletions}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </QueryState>
    </div>
  )
}
