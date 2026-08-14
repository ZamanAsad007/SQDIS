import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export interface CommitFilter {
  search: string
  repository?: string
  startDate?: string
  endDate?: string
}

interface CommitFiltersProps {
  filters: CommitFilter
  onFiltersChange: (filters: CommitFilter) => void
}

export function CommitFilters({ filters, onFiltersChange }: CommitFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="min-w-[200px] flex-1">
        <Input
          placeholder="Filter commit message..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          leftIcon={<Search className="h-4 w-4 text-slate-400" />}
        />
      </div>
    </div>
  )
}
