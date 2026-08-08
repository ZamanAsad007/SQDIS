import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, X } from 'lucide-react'

export interface SelectOption {
  label: string
  value: string
}

export interface MultiSelectProps {
  options: SelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  label?: string
  error?: string
  className?: string
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = 'Select options...',
  label,
  error,
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const handleRemove = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation()
    onChange(value.filter((v) => v !== optionValue))
  }

  const selectedOptions = options.filter((opt) => value.includes(opt.value))

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-blue-500',
          error && 'border-rose-500'
        )}
      >
        {selectedOptions.length > 0 ? (
          selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              {opt.label}
              <button
                type="button"
                onClick={(e) => handleRemove(e, opt.value)}
                className="hover:text-rose-500 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
        )}

        <div className="ml-auto flex items-center pl-2 text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1 shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500">
              No options available
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = value.includes(opt.value)
              return (
                <div
                  key={opt.value}
                  onClick={() => handleToggle(opt.value)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                    isSelected && 'font-semibold text-blue-600 dark:text-blue-400'
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                </div>
              )
            })
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  )
}
