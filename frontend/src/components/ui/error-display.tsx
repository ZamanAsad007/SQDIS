import { cn } from '@/lib/utils'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './button'

export interface ErrorDisplayProps {
  error?: Error | string | null
  resetErrorBoundary?: () => void
  title?: string
  className?: string
}

export function ErrorDisplay({
  error,
  resetErrorBoundary,
  title = 'An error occurred',
  className,
}: ErrorDisplayProps) {
  const message = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred.'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 max-w-md mx-auto',
        className
      )}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-rose-700 dark:text-rose-300/80 leading-relaxed max-w-xs">
        {message}
      </p>
      {resetErrorBoundary && (
        <Button
          variant="outline"
          size="sm"
          onClick={resetErrorBoundary}
          className="mt-4 border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300"
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Try again
        </Button>
      )}
    </div>
  )
}

export interface InlineErrorDisplayProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function InlineErrorDisplay({ message, onRetry, className }: InlineErrorDisplayProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 p-3 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 text-sm',
        className
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
        <span className="truncate">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1 font-medium text-xs text-rose-700 dark:text-rose-300 hover:underline shrink-0 cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      )}
    </div>
  )
}
