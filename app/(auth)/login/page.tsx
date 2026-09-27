'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/actions/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Sign in to your account
      </h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Track your submissions and reviews.
      </p>

      <form action={action} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            minLength={8}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
        {state?.error && (
          <p className="text-sm text-rose-600">{state.error}</p>
        )}
      </form>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        No account?{' '}
        <Link
          href="/signup"
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
