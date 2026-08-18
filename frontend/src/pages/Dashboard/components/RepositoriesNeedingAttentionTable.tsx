import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import MetricTable from './MetricTable'
import { dashboardService } from '@/services'

function scoreTone(score: number) {
  if (score > 70) return { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' }
  if (score >= 50) return { dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' }
  return { dot: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' }
}

export default function RepositoriesNeedingAttentionTable() {
  const navigate = useNavigate()
  const { data: repositories = [], isLoading } = useQuery({
    queryKey: ['dashboard', 'bottom-repositories'],
    queryFn: () => dashboardService.getBottomRepositories(5),
  })

  // Filter only repos that genuinely need attention (SQS < 70 or low coverage)
  const lowQualityRepos = repositories.filter(
    (r) => ((r.sqs || 0) > 0 && (r.sqs || 0) < 70) || ((r.coverage ?? 0) > 0 && (r.coverage ?? 0) < 50),
  )

  return (
    <MetricTable
      title="Repositories Needing Attention"
      icon={<FiAlertTriangle />}
      onAction={() => navigate('/projects')}
    >
      {isLoading ? (
        <div className="py-6 text-center text-sm text-slate-500">Loading attention alerts...</div>
      ) : lowQualityRepos.length === 0 ? (
        <div className="py-6 flex flex-col items-center justify-center gap-1.5 text-center">
          <FiCheckCircle className="h-6 w-6 text-emerald-500" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No repositories currently need attention
          </p>
          <p className="text-xs text-slate-400">
            All connected repositories are meeting active quality and test coverage thresholds.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 text-left">Repository</th>
                <th className="py-3 text-right">SQS</th>
                <th className="py-3 text-right">Coverage</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {lowQualityRepos.map((r) => {
                const tone = scoreTone(r.sqs || 0)
                const cov = r.coverage ?? 0
                return (
                  <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-b-0">
                    <td className="py-3 pr-4">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{r.name}</div>
                      <div className="text-xs text-slate-400">
                        {(r.sqs || 0) < 70 ? 'SQS below target threshold' : 'Test coverage below 50%'}
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <span className={`text-sm font-bold ${tone.text}`}>
                          {(r.sqs || 0) > 0 ? r.sqs.toFixed(1) : 'N/A'}
                        </span>
                        <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                      </div>
                    </td>
                    <td className="py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                      {cov > 0 ? `${cov.toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
                        onClick={() => navigate('/debt')}
                      >
                        Inspect Debt
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </MetricTable>
  )
}
