import { cn } from '@/lib/utils'

export type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all'

export interface PeriodSelectorProps {
  value: TimePeriod
  onChange: (period: TimePeriod) => void
  className?: string
}

const periods: { label: string; value: TimePeriod }[] = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'Year', value: 'year' },
]

export function PeriodSelector({ value, onChange, className }: PeriodSelectorProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 select-none',
        className
      )}
    >
      {periods.map((period) => {
        const isSelected = value === period.value
        return (
          <button
            key={period.value}
            type="button"
            onClick={() => onChange(period.value)}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-all cursor-pointer',
              isSelected
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            {period.label}
          </button>
        )
      })}
    </div>
  )
}
