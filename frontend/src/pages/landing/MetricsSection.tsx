import { TrendingUp, GitPullRequest, ShieldCheck, Zap } from 'lucide-react'

export default function MetricsSection() {
  const stats = [
    {
      value: '94.8%',
      label: 'Average Quality SQS',
      description: 'Maintained across production repositories',
      icon: <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      badge: 'Benchmark',
    },
    {
      value: '3.5x',
      label: 'Faster PR Cycles',
      description: 'Automated review gates cut merge turnaround',
      icon: <GitPullRequest className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      badge: 'Efficiency',
    },
    {
      value: '42%',
      label: 'Less Technical Debt',
      description: 'Proactive detection before code merges',
      icon: <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      badge: 'Reduction',
    },
    {
      value: '< 500ms',
      label: 'Webhook Latency',
      description: 'Instant commit indexing and score calculation',
      icon: <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      badge: 'Real-Time',
    },
  ]

  return (
    <section className="border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5">
                  {stat.icon}
                </div>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  {stat.badge}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {stat.value}
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {stat.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
