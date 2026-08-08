import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Github, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLoginMutation } from '@/hooks/useAuthMutations'

export default function SignIn() {
  const login = useLoginMutation()
  const backendBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    []
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Continue to your SQDIS workspace.
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
        <Input
          label="Email"
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
          autoComplete="current-password"
          required
        />

        {login.error && (
          <p className="text-sm text-rose-600 dark:text-rose-400">
            {login.error instanceof Error ? login.error.message : 'Sign in failed'}
          </p>
        )}

        <Button type="submit" className="w-full" isLoading={login.isPending}>
          Sign in
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <Link to="/forgot-password" className="font-medium text-blue-600 hover:underline">
          Forgot password?
        </Link>
        <Link to="/register" className="font-medium text-blue-600 hover:underline">
          Create account
        </Link>
      </div>
    </div>
  )
}
