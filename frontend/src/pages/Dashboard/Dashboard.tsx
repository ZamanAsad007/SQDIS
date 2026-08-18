import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '../pageUtils'
import { dashboardService } from '@/services'
import MetricCard from './components/MetricCard'
import CommitActivityChart from './components/CommitActivityChart'
import SQSTrendChart from './components/SQSTrendChart'
import TeamPerformanceChart from './components/TeamPerformanceChart'
import RepositoriesTable from './components/RepositoriesTable'
import RepositoriesNeedingAttentionTable from './components/RepositoriesNeedingAttentionTable'
import DevelopersTable from './components/DevelopersTable'
import ActivityFeed from './components/ActivityFeed'
import {
  FiAlertTriangle,
  FiBox,
  FiCode,
  FiCrosshair,
  FiShield,
  FiUsers,
  FiPlus,
} from 'react-icons/fi'

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Organization-wide software quality overview, engineering metrics, and repository health."
      />

      {/* Setup banner if no repositories exist yet */}
      {!isLoading && stats && stats.totalRepositories === 0 && (
        <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 text-sm">
              Connect your first GitHub repository
            </h3>
            <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
              Link your repositories in Settings to start tracking commit metrics, developer velocity, and ML quality scores.
            </p>
          </div>
          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors shrink-0"
          >
            <FiPlus className="h-3.5 w-3.5" />
            <span>Connect Repository</span>
          </Link>
        </div>
      )}

      {/* Real Statistics Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Connected Repositories"
          icon={<FiBox />}
          value={isLoading ? '...' : (stats?.totalRepositories ?? 0).toString()}
          trend={{ direction: 'up', label: `${stats?.totalProjects ?? 0} active projects` }}
        />
        <MetricCard
          title="Active Developers"
          icon={<FiUsers />}
          value={isLoading ? '...' : (stats?.totalDevelopers ?? 0).toString()}
          trend={{ direction: 'flat', label: `${stats?.totalTeams ?? 0} teams` }}
        />
        <MetricCard
          title="Total Ingested Commits"
          icon={<FiCode />}
          value={isLoading ? '...' : (stats?.totalCommits ?? 0).toLocaleString()}
          secondary={stats?.bugFixCommits ? `${stats.bugFixCommits} bugfixes` : undefined}
        />
        <MetricCard
          title="Average Quality Score"
          icon={<FiShield />}
          value={isLoading ? '...' : (stats?.avgSQS && stats.avgSQS > 0 ? `${stats.avgSQS.toFixed(1)} / 100` : 'N/A')}
          highlight="sqs"
          trend={{ direction: 'up', label: 'Normalized SQS index' }}
        />
        <MetricCard
          title="Average Test Coverage"
          icon={<FiCrosshair />}
          value={isLoading ? '...' : (stats?.avgCoverage && stats.avgCoverage > 0 ? `${stats.avgCoverage.toFixed(1)}%` : 'N/A')}
          trend={{ direction: 'up', label: 'From latest reports' }}
        />
        <MetricCard
          title="Active Quality Alerts"
          icon={<FiAlertTriangle />}
          value={isLoading ? '...' : (stats?.riskyModulesCount ?? 0).toString()}
          trend={{ direction: (stats?.riskyModulesCount ?? 0) > 0 ? 'up' : 'flat', label: 'HIGH & CRITICAL alerts' }}
        />
      </div>

      {/* Main Charts & Tables Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SQSTrendChart />
        </div>
        <div className="lg:col-span-6">
          <CommitActivityChart />
        </div>
        <div className="lg:col-span-12">
          <TeamPerformanceChart />
        </div>

        <div className="lg:col-span-12">
          <RepositoriesTable />
        </div>

        <div className="lg:col-span-12">
          <RepositoriesNeedingAttentionTable />
        </div>

        <div className="lg:col-span-12">
          <DevelopersTable />
        </div>

        <div className="lg:col-span-12">
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
