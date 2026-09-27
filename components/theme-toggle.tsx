'use client'
import { useEffect, useState, useLayoutEffect, useRef } from 'react'
import { setTheme } from '@/actions/theme'

export function ThemeToggle({ initialTheme }: { initialTheme: 'dark' | 'light' }) {
  const [theme, setThemeState] = useState<'dark' | 'light'>(initialTheme)
  const [pending, setPending] = useState(false)
  const [mounted, setMounted] = useState(false)
  const mountedRef = useRef(false)

  // Apply theme to document - use useLayoutEffect to avoid flash
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Mark as mounted after first render - use a ref to avoid double render
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      setMounted(true)
    }
  }, [])

  // Remove preload class after mount to enable transitions
  useEffect(() => {
    document.documentElement.classList.remove('preload')
  }, [])

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

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle dark mode"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        disabled
      >
        <MoonIcon className="h-5 w-5" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label="Toggle dark mode"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-indigo-500 transition-colors duration-200"
    >
      <span className="absolute transition-all duration-300 ease-in-out" style={{
        opacity: theme === 'dark' ? 0 : 1,
        transform: theme === 'dark' ? 'rotate(-90deg) scale(0.5)' : 'rotate(0deg) scale(1)'
      }}>
        <MoonIcon className="h-5 w-5" />
      </span>
      <span className="absolute transition-all duration-300 ease-in-out" style={{
        opacity: theme === 'dark' ? 1 : 0,
        transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.5)'
      }}>
        <SunIcon className="h-5 w-5" />
      </span>
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
