import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ChartSuspenseProps {
  children: ReactNode
  className?: string
  height?: number | string
}

export function ChartSuspense({ children, className, height = 300 }: ChartSuspenseProps) {
  return (
    <Suspense
      fallback={
        <div
          className={cn('flex w-full items-center justify-center rounded-lg', className)}
          style={{ height }}
        >
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
