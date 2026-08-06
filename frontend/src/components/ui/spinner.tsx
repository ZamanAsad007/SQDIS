import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', className, ...props }, ref) => {
    return (
      <div ref={ref} role="status" aria-label="Loading" {...props}>
        <Loader2
          className={cn(
            'animate-spin text-blue-600 dark:text-blue-400',
            sizeClasses[size],
            className
          )}
        />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'

export interface LoadingOverlayProps {
  message?: string
  className?: string
}

export function LoadingOverlay({ message = 'Loading...', className }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs transition-all animate-in fade-in duration-150',
        className
      )}
    >
      <Spinner size="lg" />
      {message && (
        <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">{message}</p>
      )}
    </div>
  )
}
