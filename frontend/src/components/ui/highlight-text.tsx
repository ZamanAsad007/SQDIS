import React from 'react'
import { cn } from '@/lib/utils'

export interface HighlightTextProps {
  text: string
  highlight?: string
  className?: string
  highlightClassName?: string
}

export function HighlightText({
  text,
  highlight,
  className,
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-900/60 text-slate-900 dark:text-yellow-100 rounded-sm px-0.5 font-medium',
}: HighlightTextProps) {
  if (!text) return null
  if (!highlight || !highlight.trim()) {
    return <span className={className}>{text}</span>
  }

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi')
  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className={cn(highlightClassName)}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </span>
  )
}
