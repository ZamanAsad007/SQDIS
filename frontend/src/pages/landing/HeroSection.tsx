import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, ShieldCheck, Zap, CheckCircle2,
  PlayCircle, ArrowUpRight
} from 'lucide-react'

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState<'overview' | 'commits' | 'debt'>('overview')

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      {/* Radiant Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:-top-80">
        <div 
          className="aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-blue-600/30 to-indigo-600/20 opacity-40 dark:opacity-30" 
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Hero Header */}
        <div className="mx-auto max-w-3xl text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 dark:border-blue-800/80 bg-blue-50/80 dark:bg-blue-950/50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400"></span>
            </span>
            <span>Next-Gen Software Intelligence Platform</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
              Explore What's New <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Ship High-Quality Code with{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI Code Intelligence
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            SQDIS automatically inspects your repository commits, evaluates developer quality scores, eliminates technical debt hotspots, and gives engineering leaders instant visibility.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/80 px-6 py-3.5 text-base font-semibold text-slate-800 dark:text-slate-200 shadow-sm backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlayCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Explore Live Demo</span>
            </Link>
          </div>

          {/* Trust Points */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>GitHub & GitLab native</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>SOC-2 Type II Certified</span>
            </div>
          </div>
        </div>

        {/* Interactive App Mockup Preview */}
        <div id="preview" className="mt-14 sm:mt-20">
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-900/80 p-2 shadow-2xl backdrop-blur-xl lg:rounded-3xl">
            {/* macOS Browser Chrome Bar */}
            <div className="flex items-center justify-between rounded-t-xl bg-slate-100 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
              </div>

              {/* URL bar */}
              <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-slate-950 px-3 py-1 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800/80 w-64 justify-center font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="truncate">https://app.sqdis.io/dashboard</span>
              </div>

              {/* Interactive tab selector */}
              <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-2.5 py-1 rounded-md transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('commits')}
                  className={`px-2.5 py-1 rounded-md transition-all ${activeTab === 'commits' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                >
                  Commits
                </button>
                <button
                  onClick={() => setActiveTab('debt')}
                  className={`px-2.5 py-1 rounded-md transition-all ${activeTab === 'debt' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                >
                  Tech Debt
                </button>
              </div>
            </div>

            {/* Mockup Dashboard Content */}
            <div className="rounded-b-xl bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 space-y-6 overflow-hidden">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top Stats Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-sm">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider">Quality Score</span>
                        <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                          +4.8%
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-baseline gap-1">
                        94.2 <span className="text-xs text-slate-400 font-normal">/ 100</span>
                      </div>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Grade A Standard
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-sm">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider">Test Coverage</span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">
                          +2.1%
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">88.5%</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Above target (85%)
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-sm">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider">PR Velocity</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                          1.4h avg
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">92 PRs</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Merged this sprint
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-sm">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider">Tech Debt</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                          -38%
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">12.4h</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Remediation effort
                      </p>
                    </div>
                  </div>

                  {/* Simulated Chart & Team Spotlight */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Quality Score Trend (SQS)</h4>
                          <p className="text-xs text-slate-500">Continuous measurement across 14 sprints</p>
                        </div>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md">
                          Sprint 24 Current
                        </span>
                      </div>
                      {/* CSS Simulated SQS Bar Graph */}
                      <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
                        {[68, 72, 75, 71, 79, 83, 80, 86, 89, 87, 91, 93, 92, 95].map((val, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                            <div 
                              className={`w-full rounded-t-sm transition-all group-hover:opacity-80 ${idx >= 10 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                              style={{ height: `${val}%` }}
                            ></div>
                            <span className="text-[10px] text-slate-400 hidden sm:inline">{idx + 11}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Developer Leaderboard Preview */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Top Quality Leaders</h4>
                          <span className="text-[11px] text-slate-400">Score</span>
                        </div>
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px]">
                                AU
                              </div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Admin User</span>
                            </div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">98.4</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                                ST
                              </div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Sarah Teamlead</span>
                            </div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">96.1</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                                AD
                              </div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Alex Developer</span>
                            </div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">93.8</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>4 active members</span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">View full ranking →</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'commits' && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Real-Time Ingested Commits</h4>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <Zap className="h-3 w-3" /> Live GitHub Webhooks Active
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { hash: '7f9a12c', msg: 'refactor(auth): migrate token validation to sliding Redis store', author: 'Sarah Teamlead', score: '96 SQS', tag: 'High Quality', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' },
                      { hash: '4b3d81e', msg: 'feat(reports): add automated PDF sprint export pipeline', author: 'Alex Developer', score: '92 SQS', tag: 'Clean Commit', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50' },
                      { hash: '9c2f55a', msg: 'perf(query): optimize AST parser memory footprint by 40%', author: 'Admin User', score: '99 SQS', tag: 'Exemplary', color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50' },
                      { hash: '2a1b94d', msg: 'test(debt): add regression suite for cyclic dependency detector', author: 'Jordan Smith', score: '91 SQS', tag: 'Well Tested', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' },
                    ].map((item) => (
                      <div key={item.hash} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-slate-100 dark:border-slate-800/50 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            {item.hash}
                          </code>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[280px] sm:max-w-md">
                            {item.msg}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${item.color}`}>
                            {item.tag}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'debt' && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Technical Debt Radar & Remediation</h4>
                      <p className="text-xs text-slate-500">Automated AST code smell & complexity identification</p>
                    </div>
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-1 rounded">
                      0 Critical Blockers
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                        <span>Cyclomatic Complexity &gt; 15</span>
                        <span className="text-amber-500">2 files</span>
                      </div>
                      <p className="text-slate-500">Heavy nested conditionals in legacy parser.</p>
                      <div className="pt-2 flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                        <span>Target: Sprint 25</span>
                        <span>Estimated: ~3.5h</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                        <span>Dead Code & Unused Exports</span>
                        <span className="text-emerald-500">Resolved</span>
                      </div>
                      <p className="text-slate-500">Tree-shaking analysis verified across all bundles.</p>
                      <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>Clean state</span>
                        <span>0h effort</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
