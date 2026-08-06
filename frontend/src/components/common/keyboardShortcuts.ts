import type { Shortcut } from './KeyboardShortcutsHelp'

export const developerProfileShortcuts: Shortcut[] = [
  { key: '?', description: 'Show keyboard shortcuts', category: 'General' },
  { key: 'g d', description: 'Go to Dashboard', category: 'Navigation' },
  { key: 'g l', description: 'Go to Leaderboard', category: 'Navigation' },
  { key: 'r', description: 'Refresh profile metrics', category: 'Actions' },
  { key: 'e', description: 'Export metrics report', category: 'Actions' },
  { key: 'c', description: 'Compare with developer', category: 'Actions' },
]
