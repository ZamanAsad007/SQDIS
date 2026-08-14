import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForgotPasswordMutation } from '@/hooks/useAuthMutations'

export function ForgotPasswordPage() {
  const forgotPassword = useForgotPasswordMutation()
  const [email, setEmail] = useState('')

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Reset password</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we will send reset instructions.
        </p>
      </div>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          forgotPassword.mutate(email)
        }}
      >
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        {forgotPassword.isSuccess && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">Reset instructions sent.</p>
        )}
        {forgotPassword.error && (
          <p className="text-sm text-rose-600 dark:text-rose-400">
            {forgotPassword.error instanceof Error ? forgotPassword.error.message : 'Unable to request reset'}
          </p>
        )}
        <Button type="submit" className="w-full" isLoading={forgotPassword.isPending}>
          Send reset link
        </Button>
      </form>
      <Link to="/login" className="text-sm font-medium text-blue-600 hover:underline">
        Back to sign in
      </Link>
    </div>
  )
}
