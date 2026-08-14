import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useResetPasswordMutation } from '@/hooks/useAuthMutations'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const resetPassword = useResetPasswordMutation()
  const [password, setPassword] = useState('')
  const token = searchParams.get('token') ?? ''

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Choose a new password</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Use the reset token from your email.
        </p>
      </div>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          resetPassword.mutate({ token, password })
        }}
      >
        <Input label="Reset token" value={token} readOnly helperText="Token is read from the reset URL." />
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {resetPassword.error && (
          <p className="text-sm text-rose-600 dark:text-rose-400">
            {resetPassword.error instanceof Error ? resetPassword.error.message : 'Unable to reset password'}
          </p>
        )}
        <Button type="submit" className="w-full" isLoading={resetPassword.isPending} disabled={!token}>
          Reset password
        </Button>
      </form>
      <Link to="/login" className="text-sm font-medium text-blue-600 hover:underline">
        Back to sign in
      </Link>
    </div>
  )
}
