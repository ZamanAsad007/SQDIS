import { useEffect } from 'react';

export interface KeyShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
}

export function useKeyboardNavigation(shortcuts: KeyShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = !!shortcut.ctrlKey === (event.ctrlKey || event.metaKey);
        const matchesAlt = !!shortcut.altKey === event.altKey;
        const matchesShift = !!shortcut.shiftKey === event.shiftKey;

        if (matchesKey && matchesCtrl && matchesAlt && matchesShift) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
