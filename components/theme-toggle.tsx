'use client'
import { useEffect, useState } from 'react'
import { setTheme } from '@/actions/theme'

export function ThemeToggle({ initialTheme }: { initialTheme: 'dark' | 'light' }) {
  // `initialTheme` is resolved on the server from the theme cookie, so the very
  // first client render matches the server HTML (no hydration mismatch). We never
  // read `window`/`document.cookie` during render to keep that invariant.
  const [theme, setThemeState] = useState<'dark' | 'light'>(initialTheme)
  const [pending, setPending] = useState(false)

  // The <html>.dark class must follow the *chosen* theme (state), not the cookie:
  // the cookie is written asynchronously by `setTheme` below, so reading it here
  // would lag one render behind the user's click. `theme` state updates
  // synchronously, so the class stays in step with the icon.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggle = async () => {
    const next: 'dark' | 'light' = theme === 'dark' ? 'light' : 'dark'
    setThemeState(next)
    setPending(true)
    try {
      await setTheme(next)
    } finally {
      setPending(false)
    }
  }

  const Icon = theme === 'dark' ? SunIcon : MoonIcon

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label="Toggle dark mode"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-indigo-500"
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}

function SunIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle cx={12} cy={12} r={5} />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}
function MoonIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
