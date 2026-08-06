import React from 'react'
import { Modal } from '@/components/ui/modal'
import { Keyboard } from 'lucide-react'
import { developerProfileShortcuts } from './keyboardShortcuts'

export interface Shortcut {
  key: string
  description: string
  category?: string
}

export interface KeyboardShortcutsHelpProps {
  shortcuts?: Shortcut[]
  pageName?: string
  isOpen: boolean
  onClose: () => void
}

function KeyBadge({ keyName }: { keyName: string }) {
  const keys = keyName.split(' ')
  return (
    <div className="flex items-center gap-1">
      {keys.map((k, idx) => (
        <kbd
          key={idx}
          className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs"
        >
          {k}
        </kbd>
      ))}
    </div>
  )
}

export function KeyboardShortcutsHelp({
  shortcuts = developerProfileShortcuts,
  pageName = 'General',
  isOpen,
  onClose,
}: KeyboardShortcutsHelpProps) {
  // Group shortcuts by category
  const categories = React.useMemo(() => {
    const grouped: Record<string, Shortcut[]> = {}
    shortcuts.forEach((sc) => {
      const cat = sc.category || 'General'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(sc)
    })
    return grouped
  }, [shortcuts])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span>Keyboard Shortcuts — {pageName}</span>
        </div>
      }
      size="md"
    >
      <div className="space-y-6">
        {Object.entries(categories).map(([category, items]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {category}
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-2">
              {items.map((shortcut, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 px-2">
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {shortcut.description}
                  </span>
                  <KeyBadge keyName={shortcut.key} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
