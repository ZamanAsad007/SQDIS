import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        The page may have moved or is not part of this phase yet.
      </p>
      <Button className="mt-6">
        <Link to="/dashboard">Go to dashboard</Link>
      </Button>
    </div>
  )
}
