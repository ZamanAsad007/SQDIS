import { Suspense, type ReactNode } from 'react';
import { Spinner } from '@/components/ui/spinner';

interface ChartSuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ChartSuspense({ children, fallback }: ChartSuspenseProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800">
            <Spinner />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}

