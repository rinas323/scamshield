import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCurrentUser, getListingDetail, getReviews, getViewerUpvotedListingIds } from '@/lib/dal'
import { ReviewList } from '@/components/review-list'
import { ReviewForm } from '@/components/review-form'
import { VoteButton } from '@/components/vote-button'
import { StatusBadge, VerificationBadge } from '@/components/badges'
import { ScamTypeBadge } from '@/components/scam-type-badge'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { ListingStatus } from '@prisma/client'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const listing = await getListingDetail(slug)
  if (!listing) return { title: 'Report not found' }
  return { title: listing.title, description: listing.description.slice(0, 160) }
}

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ cursor?: string | string[] }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const cursor =
    typeof sp.cursor === 'string'
      ? sp.cursor
      : Array.isArray(sp.cursor)
        ? sp.cursor[0]
        : null

  const user = await getCurrentUser()
  const listing = await getListingDetail(slug, user?.id)

  if (!listing) notFound()
  const isPublic = listing.status === ListingStatus.APPROVED
  if (!isPublic && user?.role !== 'ADMIN') notFound()

  const [upvotedSet, reviewPage] = await Promise.all([
    getViewerUpvotedListingIds(user?.id, [listing.id]),
    getReviews(listing.id, user?.id, 20, cursor),
  ])

  const viewerUpvoted = upvotedSet.has(listing.id)

  return (
    <article className="mx-auto max-w-3xl">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={listing.status} />
          <VerificationBadge status={listing.verification} />
          <ScamTypeBadge scamType={listing.scamType} />
          {listing.category && <Badge variant="outline">{listing.category.name}</Badge>}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {listing.title}
        </h1>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
          {listing.company && <span><span className="font-medium">Company:</span> {listing.company}</span>}
          {listing.location && <span><span className="font-medium">Location:</span> {listing.location}</span>}
          {listing.state && <span><span className="font-medium">State:</span> {listing.state}</span>}
          {listing.jobTitle && <span><span className="font-medium">Role:</span> {listing.jobTitle}</span>}
          <span><span className="font-medium">Reported:</span> {formatDate(listing.createdAt)}</span>
        </div>
      </header>

      {listing.screenshotUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {listing.screenshotUrls.map((url, i) => (
            <div key={i} className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
              <Image src={url} alt={`evidence ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {listing.evidence.length > 0 && (
        <div className="mt-4 space-y-1">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Evidence links</p>
          <ul className="space-y-1">
            {listing.evidence.map((url, i) => (
              <li key={i}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {url} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="mt-6 text-slate-700 dark:text-slate-300">
        <h2 className="mb-2 text-sm font-semibold uppercase text-slate-600 dark:text-slate-400">
          About this report
        </h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {listing.description}
        </p>
      </section>

      {listing.adminDescription && (
        <section className="mt-6 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4 dark:bg-amber-900/15">
          <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Admin note</h2>
          <p className="mt-1 text-sm text-amber-900 dark:text-amber-100">
            {listing.adminDescription}
          </p>
        </section>
      )}

      <footer className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span>{listing.viewCount ?? 0} views</span>
          <span>{listing.reviewsCount} reviews</span>
          <span>{formatDate(listing.createdAt)} reported</span>
        </div>
        <VoteButton
          targetType="LISTING"
          targetId={listing.id}
          initialCount={listing.upvotesCount}
          initialUpvoted={viewerUpvoted}
        />
      </footer>

      <section id="reviews" className="mt-10 border-t border-slate-200 pt-8 dark:border-slate-800">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Reviews ({listing.reviewsCount})
        </h2>
        {isPublic && user ? (
          <div className="mt-4">
            <ReviewForm listingSlug={listing.slug} />
          </div>
        ) : isPublic && !user ? (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            <Link href="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Sign in
            </Link>{' '}
            to share a review.
          </p>
        ) : null}

        <div className="mt-6 space-y-1">
          <ReviewList
            listingId={listing.id}
            listingSlug={listing.slug}
            viewerId={user?.id ?? null}
            cursor={cursor}
          />
          <div>{reviewPage.items.length > 0 && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Showing {reviewPage.items.length} review{reviewPage.items.length === 1 ? '' : 's'}.
            </p>
          )}</div>
        </div>
      </section>
    </article>
  )
}
