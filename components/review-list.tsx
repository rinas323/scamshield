import { getReviews } from '@/lib/dal'
import { ReviewItem } from '@/components/review-item'
import Link from 'next/link'
import { ArrowUpRightIcon } from '@heroicons/react/24/solid'
import type { ReviewDTO } from '@/lib/dal'

export interface ReviewListProps {
  listingId: string
  listingSlug: string
  viewerId: string | null
  cursor?: string | null
}

export async function ReviewList({
  listingId,
  listingSlug,
  viewerId,
  cursor,
}: ReviewListProps) {
  const { items, nextCursor } = await getReviews(
    listingId,
    viewerId,
    20,
    cursor
  )

  return (
    <>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((r: ReviewDTO) => (
            <ReviewItem key={r.id} review={r} viewerId={viewerId} />
          ))}
        </ul>
      )}

      {nextCursor ? (
        <Link
          href={`/listings/${listingSlug}?cursor=${nextCursor}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          Load more
          <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
      ) : null}
    </>
  )
}
