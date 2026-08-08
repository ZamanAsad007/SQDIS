/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (message: string, options?: { type?: ToastType; description?: string; duration?: number }) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_STYLES: Record<ToastType, { icon: React.ReactNode; containerClass: string; iconClass: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    containerClass: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950',
    iconClass: 'text-emerald-500',
  },
  error: {
    icon: <AlertCircle className="h-5 w-5" />,
    containerClass: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
    iconClass: 'text-red-500',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    containerClass: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950',
    iconClass: 'text-amber-500',
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    containerClass: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
    iconClass: 'text-blue-500',
  },
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, options?: { type?: ToastType; description?: string; duration?: number }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const type = options?.type ?? 'info';
      const duration = options?.duration ?? 5000;

      setToasts((prev) => [...prev, { id, type, message, description: options?.description, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2" aria-live="polite">
        {toasts.map((t) => {
          const style = TOAST_STYLES[t.type];
          return (
            <div
              key={t.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm ${style.containerClass}`}
            >
              <span className={`mt-0.5 shrink-0 ${style.iconClass}`}>{style.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.message}</p>
                {t.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;