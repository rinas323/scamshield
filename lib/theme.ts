// Server-only helpers for resolving the active theme so the <html> element
// gets the right `dark` / `light` class on every SSR render.
import { cookies } from 'next/headers'
import type { Theme } from '@/lib/config'

export async function getThemeClass(): Promise<'dark' | 'light'> {
  const theme = ((await cookies()).get('theme')?.value ?? 'system') as Theme
  if (theme === 'system') {
    // On the server we can't read `prefers-color-scheme`, so default to light.
    // The client applies the real preference on mount via the ThemeToggle.
    return 'light'
  }
  return theme === 'dark' ? 'dark' : 'light'
}
