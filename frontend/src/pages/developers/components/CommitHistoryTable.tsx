import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { commitsService } from '@/services'
import { formatDate } from '@/lib/utils'
import { DataTable, type Column } from '@/components/ui/data-table'
import type { Commit } from '@/types'

export interface CommitHistoryTableProps {
  developerId: string
  initialPageSize?: number
}

export function CommitHistoryTable({ developerId, initialPageSize = 10 }: CommitHistoryTableProps) {
  const [page, setPage] = useState(1)
  const commitsQuery = useQuery({
    queryKey: ['commits', 'developer', developerId, page, initialPageSize],
    queryFn: () => commitsService.getAll({ developerId, page, pageSize: initialPageSize }),
    enabled: !!developerId,
  })

  const columns: Column<Commit>[] = [
    {
      key: 'sha',
      header: 'SHA',
      render: (commit) => (
        <span className="font-mono text-xs text-blue-600 dark:text-blue-400">
          {commit.sha.slice(0, 7)}
        </span>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      render: (commit) => (
        <p className="line-clamp-1 max-w-md font-medium text-slate-900 dark:text-slate-100">
          {commit.message}
        </p>
      ),
    },
    {
      key: 'repository',
      header: 'Repository',
      render: (commit) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">{commit.repositoryName || 'N/A'}</span>
      ),
    },
    {
      key: 'additions',
      header: 'Changes',
      render: (commit) => (
        <span className="text-xs font-medium">
          <span className="text-emerald-600">+{commit.additions}</span>{' '}
          <span className="text-rose-600">-{commit.deletions}</span>
        </span>
      ),
    },
    {
      key: 'committedAt',
      header: 'Date',
      render: (commit) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(commit.committedAt)}</span>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns as any}
      data={(commitsQuery.data?.items ?? []) as any}
      isLoading={commitsQuery.isLoading}
      pagination={
        commitsQuery.data
          ? {
              currentPage: page,
              totalPages: commitsQuery.data.totalPages,
              onPageChange: setPage,
            }
          : undefined
      }
    />
  )
}
