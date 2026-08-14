import { PeriodSelector, type TimePeriod } from '@/components/ui/period-selector'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export type { TimePeriod }
export type DeveloperStatus = 'active' | 'inactive' | 'all'

export interface FilterBarState {
  search: string
  period: TimePeriod
  status: DeveloperStatus
}

interface FilterBarProps {
  filters: FilterBarState
  onChange: (filters: FilterBarState) => void
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex min-w-[240px] flex-1 items-center gap-2">
        <Input
          placeholder="Search developers..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          leftIcon={<Search className="h-4 w-4 text-slate-400" />}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <PeriodSelector
          value={filters.period}
          onChange={(period) => onChange({ ...filters, period: period as TimePeriod })}
        />
        <select
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as DeveloperStatus })}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  )
}
