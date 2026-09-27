'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import type { CurrentUser } from '@/lib/types'
import type { ReactNode } from 'react'

export function MobileMenuButton({ user, themeClass }: { user: CurrentUser | null; themeClass: 'dark' | 'light' }) {
  const [isOpen, setIsOpen] = useState(false)
  void themeClass
  void user

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>
    </>
  )
}

type LogoutAction = (formData: FormData) => Promise<void> | void;

export function MobileMenu({ user, themeClass, logoutAction, notificationBell }: { user: CurrentUser | null; themeClass: 'dark' | 'light'; logoutAction: LogoutAction; notificationBell?: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <MobileMenuClient user={user} themeClass={themeClass} isOpen={isOpen} setIsOpen={setIsOpen} logoutAction={logoutAction} notificationBell={notificationBell} />
  )
}

function MobileMenuClient({ user, themeClass, isOpen, setIsOpen, logoutAction, notificationBell }: { user: CurrentUser | null; themeClass: 'dark' | 'light'; isOpen: boolean; setIsOpen: (open: boolean) => void; logoutAction: LogoutAction; notificationBell?: ReactNode }) {
  if (!isOpen) return null

  return (
    <div
      id="mobile-menu"
      className="lg:hidden animate-in slide-in-from-top-2 fade-in duration-200 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-3"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <nav className="space-y-1" aria-label="Main navigation">
        <Link
          href="/listings"
          onClick={() => setIsOpen(false)}
          className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:text-indigo-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-800 transition-colors duration-150"
        >
          All Reports
        </Link>
        <Link
          href="/report"
          onClick={() => setIsOpen(false)}
          className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:text-indigo-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-800 transition-colors duration-150"
        >
          Report a Scam
        </Link>
        {user?.role === 'ADMIN' && (
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:text-indigo-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-800 transition-colors duration-150"
          >
            Admin
          </Link>
        )}
      </nav>

      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <form action="/" method="get" role="search" className="space-y-2">
          <label htmlFor="mobile-search" className="sr-only">
            Search reports
          </label>
          <input
            id="mobile-search"
            name="q"
            type="search"
            placeholder="Search company or job…"
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 transition-colors duration-150"
          />
        </form>

        <div className="flex items-center justify-between">
          <ThemeToggle initialTheme={themeClass} />
          {notificationBell}
        </div>

        <div className="flex items-center gap-2 pt-2">
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/admin" onClick={() => setIsOpen(false)}>Admin</Link>
                </Button>
              )}
              <Button asChild variant="ghost" className="flex-1">
                <Link href="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" className="flex-1 text-rose-600 border-rose-300 hover:bg-rose-50 dark:border-rose-700 dark:hover:bg-rose-900/20">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <Button asChild variant="ghost" className="w-full">
                <Link href="/login" onClick={() => setIsOpen(false)}>Sign in</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/signup" onClick={() => setIsOpen(false)}>Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}