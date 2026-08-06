import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <ShieldAlert className="h-12 w-12 text-amber-500" />
      <h1 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">Access restricted</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Your current role does not include permission for this workspace area.
      </p>
      <Button asChild={false} className="mt-6">
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  )
}
