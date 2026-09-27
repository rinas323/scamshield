'use client'
import { useActionState } from 'react'
import { adminLogin } from '@/actions/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLogin, undefined)

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <div>
        <Label htmlFor="admin-email">Admin email</Label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          placeholder="admin@example.com"
          required
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="admin-password">Password</Label>
        <Input
          id="admin-password"
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
  )
}
