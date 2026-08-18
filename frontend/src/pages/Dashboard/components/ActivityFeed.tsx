import { useQuery } from '@tanstack/react-query'
import {
  FiAlertTriangle,
  FiBell,
  FiClipboard,
  FiGitCommit,
  FiGitPullRequest,
  FiCheckCircle,
} from 'react-icons/fi'
import MetricTable from './MetricTable'
import { dashboardService } from '@/services'
import type { RecentActivity } from '@/types'

function timeAgo(iso: string) {
  const ts = new Date(iso).getTime()
  if (Number.isNaN(ts)) return ''
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function iconFor(type: string) {
  if (type === 'commit' || type === 'COMMIT') return <FiGitCommit className="text-blue-500" />
  if (type === 'pull_request' || type === 'PR') return <FiGitPullRequest className="text-purple-500" />
  if (type === 'alert' || type === 'ALERT') return <FiAlertTriangle className="text-amber-500" />
  return <FiCheckCircle className="text-emerald-500" />
}

export default function ActivityFeed() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: () => dashboardService.getRecentActivity(10),
  })

  return (
    <MetricTable
      title="Recent Activity"
      icon={<FiClipboard />}
    >
      {isLoading ? (
        <div className="py-6 text-center text-sm text-slate-500">Loading activity...</div>
      ) : items.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-500">
          <p className="font-semibold text-slate-700 dark:text-slate-300">No recent activity</p>
          <p className="mt-1 text-xs text-slate-400">Events, commits, and quality alerts will appear here in real-time.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {items.map((item: RecentActivity) => (
            <div key={item.id} className="py-3.5 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-sm">
                  {iconFor(item.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {item.title || item.description}
                  </div>
                  {item.title && item.description && item.title !== item.description && (
                    <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 truncate">
                      {item.description}
                    </div>
                  )}
                  <div className="mt-1 text-[11px] text-slate-400">
                    {item.timestamp ? timeAgo(item.timestamp) : ''}
                    {(item.author || item.user?.name) ? ` • by ${item.author || item.user?.name}` : ''}
                    {item.repositoryName ? ` • ${item.repositoryName}` : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500">
        <FiBell className="text-blue-500" />
        Real-time GitHub webhooks will stream updates automatically.
      </div>
    </MetricTable>
  )
}
