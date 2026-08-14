import { cn } from '@/lib/utils'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './button'

export interface SectionErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function SectionError({
  title = 'Failed to load section data',
  message = 'An error occurred while loading this section. Please try refreshing.',
  onRetry,
  className,
}: SectionErrorProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center',
        className
      )}
    >
      <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
      {message && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">{message}</p>
      )}
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-3"
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Retry
        </Button>
      )}
    </div>
  )
}
