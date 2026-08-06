import { cn } from '@/lib/utils'

export type ProgressVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'
export type ProgressSize = 'sm' | 'md' | 'lg'

export interface ProgressProps {
  value: number
  max?: number
  variant?: ProgressVariant
  size?: ProgressSize
  showValue?: boolean
  label?: string
  className?: string
}

const variantClasses: Record<ProgressVariant, string> = {
  default: 'bg-blue-600 dark:bg-blue-500',
  success: 'bg-emerald-500 dark:bg-emerald-400',
  warning: 'bg-amber-500 dark:bg-amber-400',
  danger: 'bg-rose-500 dark:bg-rose-400',
  info: 'bg-sky-500 dark:bg-sky-400',
}

const sizeClasses: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export function Progress({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showValue = false,
  label,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100)

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
          {label ? <span>{label}</span> : <span />}
          {showValue && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800',
          sizeClasses[size]
        )}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', variantClasses[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
