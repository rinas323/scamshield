import { prisma } from '@/lib/prisma'
import { getUnreadNotificationCount, getPendingSubmissions } from '@/lib/dal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge, VerificationBadge } from '@/components/badges'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ListingStatus } from '@prisma/client'
import { type Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin dashboard' }

export default async function AdminDashboardPage() {
  const [total, pending, approved, rejected, unread, recentPending] = await Promise.all([
    prisma.scamListing.count(),
    prisma.scamListing.count({ where: { status: ListingStatus.PENDING } }),
    prisma.scamListing.count({ where: { status: ListingStatus.APPROVED } }),
    prisma.scamListing.count({ where: { status: ListingStatus.REJECTED } }),
    getUnreadNotificationCount(),
    getPendingSubmissions(),
  ])

  const stats = [
    { label: 'Total reports', value: total },
    { label: 'Pending review', value: pending },
    { label: 'Approved', value: approved },
    { label: 'Rejected', value: rejected },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Admin dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Review submissions and manage the platform.
          </p>
        </div>
        {unread > 0 && (
          <Link
            href="/admin/notifications"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
          >
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            {unread} new {unread === 1 ? 'notification' : 'notifications'}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/submissions">Review submissions ({pending})</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/admin/categories">Manage categories</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/notifications">Notifications</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/settings">Settings</Link>
        </Button>
      </div>

      {recentPending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Recent pending submissions
          </h2>
          <div className="space-y-2">
            {recentPending.slice(0, 5).map((s) => (
              <Link
                key={s.id}
                href={`/admin/submissions#${s.id}`}
                className="block rounded-lg border border-slate-200 p-3 hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-800 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/20"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {s.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={s.status as never} />
                    <VerificationBadge status={s.verification as never} />
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {s.company ?? 'Unknown'} · {formatDate(s.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
