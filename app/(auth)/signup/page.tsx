'use client'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signup } from '@/actions/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function SignupPage() {
  const router = useRouter()
  const [state, action, pending] = useActionState(signup, undefined)

  // Redirect to verify-email page when OTP sent successfully
  useEffect(() => {
    if (state?.ok && state?.email) {
      router.push(`/verify-email?email=${encodeURIComponent(state.email)}`)
    }
  }, [state, router])

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Reports and reviews are tied to a profile so we can keep quality high.
      </p>

      <form action={action} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Asha Patel" required minLength={2} />
        </div>
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
            placeholder="Min 8 chars, with a letter and number"
            required
            minLength={8}
          />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" name="confirm" type="password" placeholder="••••••••" required minLength={8} />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Creating account…' : 'Create account'}
        </Button>
        {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      </form>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
