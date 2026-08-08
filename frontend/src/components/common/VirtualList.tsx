import { useState, useRef } from 'react'
import type { ReactNode, UIEvent } from 'react'
import { cn } from '@/lib/utils'

export interface VirtualListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  overscan?: number
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  overscan = 5,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalHeight = items.length * itemHeight

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + height) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1)
  const offsetY = startIndex * itemHeight

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height }}
      className={cn('overflow-y-auto relative w-full border border-slate-200 dark:border-slate-800 rounded-lg', className)}
    >
      <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)`, position: 'absolute', top: 0, left: 0, right: 0 }}>
          {visibleItems.map((item, idx) => {
            const actualIndex = startIndex + idx
            return (
              <div key={actualIndex} style={{ height: itemHeight }}>
                {renderItem(item, actualIndex)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
