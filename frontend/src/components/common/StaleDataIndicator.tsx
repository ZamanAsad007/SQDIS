import { cn, formatDate } from '@/lib/utils'
import { AlertCircle, RefreshCw, Clock } from 'lucide-react'

export interface StaleDataIndicatorProps {
  isStale?: boolean
  lastUpdated?: string | Date | number | null
  onRefresh?: () => void
  isRefreshing?: boolean
  variant?: 'badge' | 'banner' | 'inline'
  className?: string
}

export function StaleDataIndicator({
  isStale = false,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  variant = 'badge',
  className,
}: StaleDataIndicatorProps) {
  if (!isStale && !lastUpdated) return null

  const formattedTime = lastUpdated ? formatDate(lastUpdated, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : null

  if (variant === 'banner' && isStale) {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-3 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs text-amber-800 dark:text-amber-300',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            Data may be out of date.{' '}
            {formattedTime && <span className="opacity-80">Last updated at {formattedTime}.</span>}
          </span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300 hover:underline disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
            Refresh
          </button>
        )}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={cn('inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400', className)}>
        <Clock className="h-3.5 w-3.5" />
        {formattedTime ? <span>Updated {formattedTime}</span> : <span>Stale data</span>}
        {isStale && <span className="text-amber-500 font-medium">(Outdated)</span>}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="ml-1 p-0.5 text-slate-400 hover:text-blue-500 transition-colors"
          >
            <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
          </button>
        )}
      </div>
    )
  }

  // Default Badge Variant
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        isStale
          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60'
          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
        className
      )}
    >
      <Clock className="h-3 w-3 opacity-70" />
      {isStale ? 'Stale Data' : formattedTime ? `Updated ${formattedTime}` : 'Fresh Data'}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="ml-1 hover:text-slate-900 dark:hover:text-white"
        >
          <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
        </button>
      )}
    </div>
  )
}
