import { getCurrentUser, getUserProfile, getUserSubmissions, getUserReviews } from '@/lib/dal'
import { Avatar } from '@/components/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/badges'
import { formatDate, toTitleCase } from '@/lib/utils'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { ListingStatus } from '@prisma/client'

export const metadata: Metadata = { title: 'Your profile' }

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getUserProfile(user.id)
  const submissions = await getUserSubmissions(user.id)
  const reviews = await getUserReviews(user.id)

  const pending = submissions.filter((s) => s.status === 'PENDING')
  const approved = submissions.filter((s) => s.status === 'APPROVED')
  const rejected = submissions.filter((s) => s.status === 'REJECTED')

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
      <aside className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar src={profile?.image} name={profile?.name} size={80} />
            <p className="mt-3 text-lg font-semibold">{profile?.name ?? 'Anonymous'}</p>
            {profile?.role === 'ADMIN' && <Badge variant="secondary">admin</Badge>}
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{profile?.email}</p>
            {profile?.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
            <p className="mt-3 text-xs text-slate-500">
              Member since {profile ? formatDate(profile.createdAt) : '—'}
            </p>
          </CardContent>
        </Card>
      </aside>

      <main className="md:col-span-2 space-y-8">
        <section>
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Your reports
            </h2>
            <Button asChild size="sm" variant="outline">
              <Link href="/report">Add report</Link>
            </Button>
          </header>
          {submissions.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">You haven’t submitted any reports yet.</p>
          ) : (
            <div className="space-y-3">
              {pending.length > 0 && (
                <div>
                  <h3 className="mb-1 text-xs font-semibold uppercase text-amber-700 dark:text-amber-300">
                    Awaiting review ({pending.length})
                  </h3>
                  {pending.map((s) => (
                    <ProfileSubmission key={s.id} listing={s} />
                  ))}
                </div>
              )}
              {approved.length > 0 && (
                <div>
                  <h3 className="mb-1 text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                    Published ({approved.length})
                  </h3>
                  {approved.map((s) => (
                    <ProfileSubmission key={s.id} listing={s} />
                  ))}
                </div>
              )}
              {rejected.length > 0 && (
                <div>
                  <h3 className="mb-1 text-xs font-semibold uppercase text-rose-700 dark:text-rose-300">
                    Not published ({rejected.length})
                  </h3>
                  {rejected.map((s) => (
                    <ProfileSubmission key={s.id} listing={s} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Your reviews
          </h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You haven’t written any reviews yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li
                  key={r.id}
                  className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/listings/${r.listing.slug}`}
                      className="font-medium text-slate-900 hover:underline dark:text-slate-100"
                    >
                      {r.listing.title}
                    </Link>
                    <StatusBadge status={r.listing.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-700 dark:text-slate-300">
                    {r.body}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(r.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

interface SubmissionRow {
  id: string
  slug: string
  title: string
  company: string | null
  status: ListingStatus
  scamType: string
  createdAt: Date
}

function ProfileSubmission({ listing }: { listing: SubmissionRow }) {
  const isApproved = listing.status === 'APPROVED'
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {isApproved ? (
              <Link
                href={`/listings/${listing.slug}`}
                className="font-medium text-slate-900 hover:underline dark:text-slate-100"
              >
                {listing.title}
              </Link>
            ) : (
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {listing.title}
              </span>
            )}
            {listing.company && (
              <p className="text-sm text-slate-600 dark:text-slate-300">{listing.company}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{toTitleCase(listing.scamType)}</Badge>
            <StatusBadge status={listing.status} />
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {formatDate(listing.createdAt)} · {isApproved ? 'Published' : 'Pending admin review'}
        </p>
      </CardContent>
    </Card>
  )
}
