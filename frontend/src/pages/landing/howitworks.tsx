import { GitBranch, Cpu, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

type Props = {
  id?: string
}

export default function HowItWorks({ id = 'how-it-works' }: Props) {
  const steps = [
    {
      step: '01',
      icon: <GitBranch className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: 'Connect GitHub in 60 Seconds',
      description: 'Link your GitHub organization or personal repository with standard OAuth or secure Personal Access Token. Zero configuration required.',
      details: ['Read-only repository access', 'Support for mono-repos & submodules', 'Instant webhook setup'],
    },
    {
      step: '02',
      icon: <Cpu className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      title: 'Automated ML & AST Analysis',
      description: 'Our background worker engine parses AST syntax trees, measures cyclomatic complexity, checks test coverage, and generates a normalized SQS score.',
      details: ['Zero runtime performance overhead', 'Backfills past commits seamlessly', 'Encrypted metadata processing'],
    },
    {
      step: '03',
      icon: <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
      title: 'Actionable Engineering Insights',
      description: 'Empower engineering leaders and developers with real-time dashboards, sprint reports, quality gates, and automated team leaderboards.',
      details: ['Weekly automated summaries', 'Sprint velocity correlation', 'Slack & Email alerts'],
    },
  ]

  return (
    <section id={id} className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 uppercase tracking-wider">
            Simple 3-Step Setup
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            How SQDIS Delivers{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Instant Results
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Get comprehensive software quality intelligence up and running in minutes, without changing your team's existing Git workflow.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                    {step.icon}
                  </div>
                  <span className="font-mono text-3xl font-extrabold text-slate-200 dark:text-slate-800">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {step.title}
                </h3>

                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {step.description}
                </p>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {step.details.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick CTA */}
        <div className="mt-14 text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105"
          >
            <span>Get Started in 60 Seconds</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
