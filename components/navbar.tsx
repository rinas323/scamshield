import Link from 'next/link'
import { getCurrentUser } from '@/lib/dal'
import { getThemeClass } from '@/lib/theme'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Avatar } from '@/components/avatar'
import { NotificationBell } from '@/components/notification-bell'
import { APP_NAME } from '@/lib/config'
import { MobileMenuButton, MobileMenu } from '@/components/navbar-mobile'
import type { CurrentUser } from '@/lib/types'

export async function Navbar() {
  const user = await getCurrentUser()
  const themeClass = await getThemeClass()
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-950/80 dark:supports-[backdrop-filter]:dark:bg-slate-950/60 transition-colors duration-200">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-700 dark:text-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 rounded-md px-1 -ml-1" aria-label={`${APP_NAME} - Home`}>
          <ShieldCheckIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" role="navigation" aria-label="Main navigation">
          <NavLink href="/listings">All Reports</NavLink>
          <NavLink href="/report">Report a Scam</NavLink>
          {user?.role === 'ADMIN' && <NavLink href="/admin">Admin</NavLink>}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <form action="/" method="get" role="search">
            <label htmlFor="site-search" className="sr-only">
              Search reports
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Search company or job…"
              className="w-56 lg:w-64 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 transition-colors duration-150"
            />
          </form>
          <ThemeToggle initialTheme={themeClass} />
          {user?.role === 'ADMIN' && <NotificationBell />}
          {user ? UserMenu(user) : <AuthLinks />}
        </div>

        <MobileMenuButton user={user} themeClass={themeClass} />
      </div>

      <MobileMenu user={user} themeClass={themeClass} logoutAction={logout} notificationBell={user?.role === 'ADMIN' ? <NotificationBell /> : null} />
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
    >
      {children}
    </Link>
  )
}

function AuthLinks() {
  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm" className="text-slate-700 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-400">
        <Link href="/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" className="text-white">
        <Link href="/signup">Sign up</Link>
      </Button>
    </div>
  )
}

function UserMenu(user: CurrentUser) {
  return (
    <div className="flex items-center gap-2">
      {user.role === 'ADMIN' && (
        <Button asChild variant="outline" size="sm" className="h-9">
          <Link href="/admin" className="px-3">Admin</Link>
        </Button>
      )}
      <Button asChild variant="ghost" size="sm" className="h-9">
        <Link href="/profile" className="px-3">Profile</Link>
      </Button>
      <Avatar src={user.image} name={user.name} size={32} />
      <form action={logout}>
        <Button type="submit" variant="ghost" size="sm" className="h-9 px-3 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400">
          Sign out
        </Button>
      </form>
    </div>
  )
}

function ShieldCheckIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}