import { notFound } from 'next/navigation'
import { ADMIN_LOGIN_SLUG } from '@/lib/config'
import { AdminLoginForm } from '@/components/admin-login-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin sign in',
  robots: { index: false, follow: false },
}

// Obfuscated admin login route. The [slug] must match ADMIN_LOGIN_SLUG (derived
// from AUTH_SECRET). Any other value returns 404 — the route is invisible to
// crawlers and regular users. IP-based restriction can be layered in here later.
// This route lives outside /admin/ so the admin layout's requireAdmin() guard
// does not block unauthenticated access.
export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (slug !== ADMIN_LOGIN_SLUG) notFound()

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Admin sign in
      </h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Restricted access. Authorised personnel only.
      </p>
      <AdminLoginForm />
    </div>
  )
}
