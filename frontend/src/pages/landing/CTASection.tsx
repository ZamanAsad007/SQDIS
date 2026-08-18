import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28 bg-slate-900 text-white">
      {/* Radiant gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-indigo-950/60 to-slate-950 pointer-events-none" />
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Transform Your Engineering Standards</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
          Ready to Ship Higher Quality Code{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Without Slowing Down?
          </span>
        </h2>

        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Join thousands of developers and engineering leaders who rely on SQDIS to eliminate code debt and accelerate software delivery.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Free 14-Day Trial</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 px-8 py-4 text-base font-semibold text-slate-200 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Sign In to Dashboard</span>
          </Link>
        </div>

        <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> SOC-2 Compliant
          </span>
          <span>•</span>
          <span>Instant 60s Onboarding</span>
          <span>•</span>
          <span>Cancel Anytime</span>
        </div>
      </div>
    </section>
  )
}
