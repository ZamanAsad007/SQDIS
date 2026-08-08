import React from 'react'
import { StaleDataIndicator } from './StaleDataIndicator'
import { cn } from '@/lib/utils'

export interface StaleDataWrapperProps {
  children: React.ReactNode
  isStale?: boolean
  lastUpdated?: string | Date | number | null
  onRefresh?: () => void
  isRefreshing?: boolean
  className?: string
}

export function StaleDataWrapper({
  children,
  isStale = false,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  className,
}: StaleDataWrapperProps) {
  return (
    <div className={cn('relative w-full', className)}>
      {isStale && (
        <div className="mb-3">
          <StaleDataIndicator
            isStale={isStale}
            lastUpdated={lastUpdated}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            variant="banner"
          />
        </div>
      )}
      {children}
    </div>
  )
}
