import React from 'react'
import { cn } from '@/lib/utils'
import { Inbox } from 'lucide-react'

export interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  title = 'No records found',
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-200',
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
        {icon || <Inbox className="h-7 w-7" />}
      </div>
      {title && (
        <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h4>
      )}
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
