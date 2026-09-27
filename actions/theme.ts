'use server'
import { cookies } from 'next/headers'
import { type Theme } from '@/lib/config'

// Persist the user's color-scheme preference in a non-httpOnly cookie so the
// root layout can apply the matching `dark` class on SSR and the client toggle
// can read it. No redirect: the caller (client) flips the class instantly.
export async function setTheme(theme: Theme) {
  if (theme !== 'light' && theme !== 'dark' && theme !== 'system') return
  const cookieStore = await cookies()
  cookieStore.set('theme', theme, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })
  return { ok: true }
}
