import { ShieldCheck, ShieldAlert, AlertTriangle, Clock, Wrench } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface QualityGateViolation {
  file_path: string
  rule: string
  severity: 'CRITICAL' | 'WARNING' | 'INFO'
  message: string
}

export interface QualityGateProps {
  status: 'PASSED' | 'WARNING' | 'FAILED'
  totalDebtHours: number
  violations: QualityGateViolation[]
}

export function QualityGateCard({ status, totalDebtHours, violations }: QualityGateProps) {
  const isPassed = status === 'PASSED'
  const isWarning = status === 'WARNING'

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPassed ? (
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
            ) : (
              <ShieldAlert className="h-6 w-6 text-rose-500" />
            )}
            <div>
              <CardTitle className="text-lg">Automated Quality Gate</CardTitle>
              <CardDescription>Code health, SAST security checks & technical debt evaluation</CardDescription>
            </div>
          </div>
          <Badge
            className={`text-sm px-3 py-1 font-semibold ${
              isPassed
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400'
                : isWarning
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400'
            }`}
          >
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-4">
        {/* Metric Badges */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <Clock className="h-5 w-5 text-indigo-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Tech Debt</p>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">{totalDebtHours} hrs</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Policy Violations</p>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">{violations.length}</p>
            </div>
          </div>
        </div>

        {/* Violations List */}
        {violations.length > 0 ? (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Blocking Findings</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {violations.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-md bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-sm flex items-start gap-2"
                >
                  <Wrench className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">{v.file_path}</span>
                    <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">{v.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 pt-2">
            ✅ All quality gate criteria passed without security vulnerabilities.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
