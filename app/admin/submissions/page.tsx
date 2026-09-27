import { getPendingSubmissions } from '@/lib/dal'
import { approveListing, rejectListing, deleteListing } from '@/actions/listings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge, VerificationBadge } from '@/components/badges'
import { ScamTypeBadge } from '@/components/scam-type-badge'
import { formatDate } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { type Metadata } from 'next'

export const metadata: Metadata = { title: 'Pending submissions' }

export default async function AdminSubmissionsPage() {
  const submissions = await getPendingSubmissions()

  // Fetch full details for each submission so the admin can see the description
  // and evidence links without navigating to a separate page.
  const details = await Promise.all(
    submissions.map((s) =>
      prisma.scamListing.findUnique({
        where: { id: s.id },
        select: { id: true, description: true, evidence: true, jobTitle: true, location: true },
      })
    )
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Pending submissions
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {submissions.length} report{submissions.length === 1 ? '' : 's'} awaiting admin review.
        </p>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-slate-500 dark:text-slate-400">
            No pending reports — nice work!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {submissions.map((s, i) => (
            <AdminSubmissionCard
              key={s.id}
              submission={s}
              detail={details[i]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AdminSubmissionCard({
  submission,
  detail,
}: {
  submission: {
    id: string
    title: string
    slug: string
    company: string | null
    state: string | null
    scamType: string
    status: string
    verification: string
    upvotesCount: number
    reviewsCount: number
    createdAt: Date
    submittedBy: { name: string | null } | null
  }
  detail: { id: string; description: string; evidence: string[]; jobTitle: string | null; location: string | null } | null
}) {
  return (
    <Card id={submission.id} className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base text-slate-900 dark:text-slate-100">
              {submission.title}
            </CardTitle>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <ScamTypeBadge scamType={submission.scamType as never} />
              <StatusBadge status={submission.status as never} />
              <VerificationBadge status={submission.verification as never} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
          {submission.company && (
            <span><span className="font-medium">Company:</span> {submission.company}</span>
          )}
          {detail?.jobTitle && (
            <span><span className="font-medium">Role:</span> {detail.jobTitle}</span>
          )}
          {submission.state && (
            <span><span className="font-medium">State:</span> {submission.state}</span>
          )}
          {detail?.location && (
            <span><span className="font-medium">Location:</span> {detail.location}</span>
          )}
          <span><span className="font-medium">Submitted:</span> {formatDate(submission.createdAt)}</span>
          {submission.submittedBy?.name && (
            <span><span className="font-medium">by</span> {submission.submittedBy.name}</span>
          )}
        </div>

        {detail?.description && (
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
            <p className="line-clamp-4 text-sm text-slate-700 dark:text-slate-300">
              {detail.description}
            </p>
          </div>
        )}

        {detail && detail.evidence.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              Evidence
            </p>
            <ul className="space-y-0.5">
              {detail.evidence.slice(0, 3).map((url, i) => (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    {url}
                  </a>
                </li>
              ))}
              {detail.evidence.length > 3 && (
                <li className="text-xs text-slate-500">+{detail.evidence.length - 3} more</li>
              )}
            </ul>
          </div>
        )}

        <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
            <form action={approveListing} className="w-full sm:flex-1 sm:max-w-lg">
              <input type="hidden" name="id" defaultValue={submission.id} />
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Admin note (optional)
              </label>
              <textarea
                name="adminDescription"
                rows={2}
                placeholder="Verification summary shown to readers…"
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <Button type="submit" variant="success" className="mt-2 w-full sm:w-auto" size="sm">
                Approve & publish
              </Button>
            </form>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3 w-full sm:flex-1">
              <form action={rejectListing} className="flex-1">
                <input type="hidden" name="id" defaultValue={submission.id} />
                <Button type="submit" variant="danger" className="w-full" size="sm">
                  Reject
                </Button>
              </form>
              <form action={deleteListing} className="flex-1">
                <input type="hidden" name="id" defaultValue={submission.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="w-full text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                >
                  Delete
                </Button>
              </form>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}