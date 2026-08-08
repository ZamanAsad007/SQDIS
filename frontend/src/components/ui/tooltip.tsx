import React, { useState } from 'react'
import { cn } from '@/lib/utils'

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: TooltipSide
  className?: string
}

const positionClasses: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
}

const arrowClasses: Record<TooltipSide, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 dark:border-t-slate-800 border-x-transparent border-b-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-900 dark:border-r-slate-800 border-y-transparent border-l-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 dark:border-b-slate-800 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 dark:border-l-slate-800 border-y-transparent border-r-transparent',
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  if (!content) return <>{children}</>

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap rounded bg-slate-900 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-white shadow-md animate-in fade-in duration-100 pointer-events-none',
            positionClasses[side],
            className
          )}
        >
          {content}
          <div className={cn('absolute border-4', arrowClasses[side])} />
        </div>
      )}
    </div>
  )
}
