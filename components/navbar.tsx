import Link from 'next/link'
import { getCurrentUser } from '@/lib/dal'
import { getThemeClass } from '@/lib/theme'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Avatar } from '@/components/avatar'
import { NotificationBell } from '@/components/notification-bell'
import { APP_NAME } from '@/lib/config'

export async function Navbar() {
  const user = await getCurrentUser()
  const themeClass = await getThemeClass()
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-700 dark:text-indigo-400">
          <ShieldCheckIcon className="h-6 w-6" />
          {APP_NAME}
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink href="/listings">All reports</NavLink>
          <NavLink href="/report">Report a scam</NavLink>
          {user?.role === 'ADMIN' && <NavLink href="/admin">Admin</NavLink>}
        </nav>

        <div className="flex items-center gap-3">
          <form action="/" method="get" className="hidden sm:block">
            <label htmlFor="site-search" className="sr-only">
              Search reports
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Search company or job…"
              className="w-56 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </form>
          <ThemeToggle initialTheme={themeClass} />
          {user?.role === 'ADMIN' && <NotificationBell />}
          {user ? UserMenu(user) : <AuthLinks />}
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-slate-700 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-400"
    >
      {children}
    </Link>
  )
}

function AuthLinks() {
  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/login">Sign in</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/signup">Sign up</Link>
      </Button>
    </div>
  )
}

function UserMenu(user: {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  bio: string | null
}) {
  return (
    <div className="flex items-center gap-3">
      {user.role === 'ADMIN' && (
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">Admin</Link>
        </Button>
      )}
      <Button asChild variant="ghost" size="sm">
        <Link href="/profile">Profile</Link>
      </Button>
      <Avatar src={user.image} name={user.name} size={32} />
      <form action={logout}>
        <Button type="submit" variant="ghost" size="sm">
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
