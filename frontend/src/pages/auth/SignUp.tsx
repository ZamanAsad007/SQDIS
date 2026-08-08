import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Github, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRegisterMutation } from '@/hooks/useAuthMutations'

export default function SignUp() {
  const register = useRegisterMutation()
  const backendBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    []
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setLocalError(null)

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.')
      return
    }

    register.mutate({ name, email, password })
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Create account</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Start tracking engineering quality across your organization.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          leftIcon={<Mail className="h-4 w-4" />}
          onClick={() => {
            window.location.href = `${backendBaseUrl.replace(/\/$/, '')}/auth/google`
          }}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          leftIcon={<Github className="h-4 w-4" />}
          onClick={() => {
            window.location.href = `${backendBaseUrl.replace(/\/$/, '')}/auth/github`
          }}
        >
          GitHub
        </Button>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} required />
        <Input
          label="Work email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
        />

        {(localError || register.error) && (
          <p className="text-sm text-rose-600 dark:text-rose-400">
            {localError || (register.error instanceof Error ? register.error.message : 'Registration failed')}
          </p>
        )}

        <Button type="submit" className="w-full" isLoading={register.isPending}>
          Create account
        </Button>
      </form>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
