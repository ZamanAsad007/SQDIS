import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ArrowRight, Sparkles } from 'lucide-react'

type Props = {
  id?: string
}

export default function Pricing({ id = 'pricing' }: Props) {
  const [annualBilling, setAnnualBilling] = useState(true)

  const plans = [
    {
      name: 'Developer Starter',
      description: 'Ideal for open-source maintainers and small engineering teams getting started.',
      priceMonthly: 0,
      priceAnnual: 0,
      features: [
        'Up to 5 developers',
        '3 connected repositories',
        'Standard SQS quality scores',
        'Real-time GitHub webhook sync',
        'Weekly automated summaries',
        'Community Discord support',
      ],
      ctaText: 'Start Free Forever',
      ctaHref: '/register',
      popular: false,
    },
    {
      name: 'Team Pro',
      description: 'Full-featured code intelligence for scaling engineering squads and organizations.',
      priceMonthly: 35,
      priceAnnual: 29,
      features: [
        'Unlimited developers & seats',
        'Unlimited repositories',
        'Advanced ML code smell detection',
        'Sprint burndown & release quality gates',
        'Custom alerts & Slack notifications',
        'Technical debt effort estimation',
        'Developer quality leaderboard',
        'Priority email & chat support',
      ],
      ctaText: 'Start 14-Day Free Trial',
      ctaHref: '/register',
      popular: true,
    },
    {
      name: 'Enterprise',
      description: 'Custom governance, compliance, dedicated infrastructure, and SLA guarantees.',
      priceMonthly: 'Custom',
      priceAnnual: 'Custom',
      features: [
        'Everything in Team Pro',
        'SAML 2.0 / Okta / Azure SSO',
        'Self-hosted / On-premise deployment',
        'Custom ML model tuning & rulesets',
        'SOC-2 Type II audit report',
        'Dedicated Solutions Architect',
        '99.99% Uptime SLA',
      ],
      ctaText: 'Contact Enterprise Sales',
      ctaHref: '/register',
      popular: false,
    },
  ]

  return (
    <section id={id} className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 uppercase tracking-wider">
          Transparent Pricing
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Simple, Predictable{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Investment in Quality
          </span>
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Start for free today and upgrade as your team grows. All plans include automated GitHub webhook synchronization.
        </p>

        {/* Annual / Monthly Toggle */}
        <div className="flex items-center justify-center gap-3 pt-6">
          <span className={`text-sm font-semibold ${!annualBilling ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setAnnualBilling(!annualBilling)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${annualBilling ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${annualBilling ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
          <span className={`text-sm font-semibold flex items-center gap-1.5 ${annualBilling ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
            <span>Annual Billing</span>
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`relative flex flex-col justify-between rounded-2xl border p-8 transition-all ${plan.popular ? 'border-blue-500 bg-white dark:bg-slate-900 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20' : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md'}`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1 text-xs font-bold text-white shadow-md">
                  <Sparkles className="h-3 w-3" /> Most Popular
                </span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 min-h-[40px]">
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                {typeof plan.priceMonthly === 'number' ? (
                  <>
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                      ${annualBilling ? plan.priceAnnual : plan.priceMonthly}
                    </span>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      /dev /month
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {plan.priceMonthly}
                  </span>
                )}
              </div>

              <div className="mt-8 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Included Features:
                </p>
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <div className="mt-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 p-0.5 text-blue-600 dark:text-blue-400">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Link
                to={plan.ctaHref}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white'}`}
              >
                <span>{plan.ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
