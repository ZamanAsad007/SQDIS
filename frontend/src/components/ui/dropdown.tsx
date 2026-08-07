import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface DropdownProps {
  trigger?: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ trigger, children, align = 'left', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Support both prop-based and children-based usage:
  // 1. <Dropdown trigger={...}>...</Dropdown>
  // 2. <Dropdown><DropdownTrigger>...</DropdownTrigger><DropdownMenu>...</DropdownMenu></Dropdown>
  // In children-based mode, the first child (DropdownTrigger) is the trigger,
  // and the remaining children (DropdownMenu) are the menu content.
  let triggerNode = trigger
  let menuContent = children

  if (!triggerNode && React.isValidElement(children)) {
    const childArray = React.Children.toArray(children)
    if (childArray.length > 0) {
      triggerNode = childArray[0]
      menuContent = childArray.slice(1)
    }
  }

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)}>{triggerNode}</div>
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 w-56 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1 animate-in fade-in zoom-in-95 duration-100',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
          onClick={() => setIsOpen(false)}
        >
          {menuContent}
        </div>
      )}
    </div>
  )
}

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  danger?: boolean
}

export const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ className, icon, danger, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'group flex w-full items-center px-4 py-2 text-sm transition-colors text-left font-normal select-none',
          danger
            ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
          className
        )}
        {...props}
      >
        {icon && <span className="mr-2.5 h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100">{icon}</span>}
        <span className="flex-1 truncate">{children}</span>
      </button>
    )
  }
)

DropdownItem.displayName = 'DropdownItem'

export function DropdownDivider() {
  return <div className="my-1 h-px bg-slate-200 dark:bg-slate-800" />
}

// ============================================================
// Compatibility aliases used by pages importing Radix-style API
// (DropdownTrigger / DropdownMenu)
// ============================================================

export interface DropdownTriggerProps {
  asChild?: boolean
  children: React.ReactNode
  className?: string
}

export function DropdownTrigger(props: DropdownTriggerProps) {
  // asChild isn't necessary here since we render children directly
  // which is how the existing Dropdown component works (children act as trigger)
  return <>{props.children}</>
}

export interface DropdownMenuProps {
  align?: 'left' | 'right' | 'end'
  children: React.ReactNode
  className?: string
}

export function DropdownMenu(props: DropdownMenuProps) {
  // This is a rendering shim - the actual menu is rendered by the parent Dropdown.
  // We render children directly since Dropdown already handles the positioning.
  return <>{props.children}</>
}
