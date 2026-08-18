import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { GitCommit, GitPullRequest, Search, Plus, GitBranch } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CommitChart, ChartSuspense } from '@/components/charts'
import { commitsService } from '@/services'
import { queryKeys } from '@/lib/queryClient'
import { formatDate, formatNumber } from '@/lib/utils'
import { MetricTile, PageHeader, QueryState } from '../pageUtils'

import type { Commit } from '@/types'

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

  const rawCommits = commitsQuery.data
  const commits: Commit[] = Array.isArray(rawCommits)
    ? rawCommits
    : (rawCommits && typeof rawCommits === 'object' && Array.isArray((rawCommits as any).data))
    ? (rawCommits as any).data
    : []

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
    <div className="space-y-6">
      <PageHeader
        title="Commits"
        description="Review commit volume, churn, and ML quality classifications across repositories."
        action={
          <Input
            className="w-64"
            placeholder="Search commits by message, SHA, author..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile
          label="Total commits"
          value={formatNumber(statsQuery.data?.totalCommits ?? commits.length)}
          icon={<GitCommit className="h-5 w-5" />}
        />
        <MetricTile
          label="Insertions"
          value={formatNumber(statsQuery.data?.totalInsertions ?? 0)}
          icon={<GitPullRequest className="h-5 w-5 text-emerald-500" />}
        />
        <MetricTile
          label="Deletions"
          value={formatNumber(statsQuery.data?.totalDeletions ?? 0)}
          icon={<GitPullRequest className="h-5 w-5 text-rose-500" />}
        />
      </div>

      <QueryState isLoading={commitsQuery.isLoading} error={commitsQuery.error} onRetry={() => commitsQuery.refetch()}>
        {commits.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 mb-3">
                <GitBranch className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                No commits found
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                {search
                  ? `No commits matched "${search}". Try clearing your search filter.`
                  : 'No commits have been ingested for your organization yet. Connect your GitHub repository in Settings to sync commits.'}
              </p>
              {!search && (
                <Link
                  to="/settings"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Connect Repository
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
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
          </>
        )}
      </QueryState>
    </div>
  )
}
