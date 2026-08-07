import { CheckCircle2, Circle } from 'lucide-react'
import type { OnboardingChecklistItem } from '@/types'

export function EnhancedChecklistItems({
  items,
  onToggleItem,
}: {
  items: OnboardingChecklistItem[]
  onToggleItem?: (itemId: string, completed: boolean) => void
}) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onToggleItem?.(item.id, !item.isCompleted)}
          className="flex items-center justify-between py-3 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            {item.isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600 shrink-0" />
            )}
            <div>
              <p className={`text-sm font-medium ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                {item.title}
              </p>
              {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
            </div>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <p className="py-4 text-center text-xs text-slate-500">No checklist items defined.</p>
      )}
    </div>
  )
}
