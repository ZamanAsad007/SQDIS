import { 
  Brain, TrendingUp, Users, GitBranch, 
  Target, CheckCircle2, AlertTriangle
} from 'lucide-react'

type Props = {
  id?: string
}

export default function Feature({ id = 'features' }: Props) {
  const features = [
    {
      icon: <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: 'ML-Powered Quality Scores (SQS)',
      description: 'Continuous multidimensional scoring based on AST complexity, cyclomatic depth, architecture patterns, and test rigour.',
      badge: 'Core Engine',
      gradient: 'from-blue-500/10 to-indigo-500/5',
      highlights: ['AST pattern inspection', 'Weighted complexity metrics', 'Historical baseline benchmarking'],
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
      title: 'Sprint & Release Quality Tracking',
      description: 'Visualize code health evolution sprint over sprint with automated velocity burndown and release readiness gates.',
      badge: 'Velocity & Gates',
      gradient: 'from-emerald-500/10 to-teal-500/5',
      highlights: ['Sprint burndown correlation', 'Release quality gates', 'Automated changelog intelligence'],
    },
    {
      icon: <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      title: 'Team & Developer Intelligence',
      description: 'Actionable developer analytics and constructive leaderboard recognizing craftsmanship, review velocity, and quality habits.',
      badge: 'Team Analytics',
      gradient: 'from-purple-500/10 to-pink-500/5',
      highlights: ['Individual quality trends', 'Fair commit attribution', 'Constructive leaderboard'],
    },
    {
      icon: <GitBranch className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      title: 'Real-Time GitHub & GitLab Webhooks',
      description: 'Instant webhook event capture for every push, pull request review, and merge with sub-second background processing.',
      badge: 'Zero-Latency',
      gradient: 'from-indigo-500/10 to-blue-500/5',
      highlights: ['Webhook signature validation', 'Backfill historical commits', 'Branch-level tracking'],
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
      title: 'Technical Debt Radar',
      description: 'Automatically pinpoint monolithic functions, duplication hotspots, and high-risk modules with estimated remediation effort.',
      badge: 'Code Health',
      gradient: 'from-amber-500/10 to-orange-500/5',
      highlights: ['Hotspot heatmaps', 'Effort estimation in hours', 'Smell severity tagging'],
    },
    {
      icon: <Target className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
      title: 'Intelligent Quality Alerts & Goals',
      description: 'Set custom thresholds for coverage and complexity, receiving immediate alerts via Slack, Email, or Webhooks when standards drop.',
      badge: 'Proactive Guard',
      gradient: 'from-rose-500/10 to-red-500/5',
      highlights: ['Multi-channel notifications', 'Custom SQS thresholds', 'Audit compliance logs'],
    },
  ]

  return (
    <section id={id} className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 uppercase tracking-wider">
          Engineered for Modern Teams
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Everything You Need to Ship{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Bulletproof Software
          </span>
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Stop guessing about code quality. Replace fragmented linters with an intelligent, end-to-end quality observability platform.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-300"
          >
            {/* Top Accent Gradient */}
            <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${feat.gradient} group-hover:h-1.5 transition-all`} />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {feat.badge}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {feat.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {feat.description}
              </p>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                {feat.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
