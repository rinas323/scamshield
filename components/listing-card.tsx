import { Badge } from '@/components/ui/badge'
import { VerificationBadge } from '@/components/badges'
import { ScamTypeBadge } from '@/components/scam-type-badge'
import { VoteButton } from '@/components/vote-button'
import { formatDate } from '@/lib/utils'
import type { ListingCard } from '@/lib/dal'
import { useRouter } from 'next/navigation'

export interface ListingCardProps {
  listing: ListingCard
  viewerUpvoted: boolean
}

export function ListingCard({ listing, viewerUpvoted }: ListingCardProps) {
  const router = useRouter()
  const primary = listing.adminDescription || listing.description
  const truncated =
    primary.length > 220 ? `${primary.slice(0, 220)}…` : primary

  const handleReviewsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/listings/${listing.slug}#reviews`)
  }

  return (
    <article
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md cursor-pointer dark:border-slate-800 dark:bg-slate-950"
      onClick={() => router.push(`/listings/${listing.slug}`)}
    >
      <div className="flex flex-wrap items-start gap-2">
        {listing.category ? (
          <Badge variant="outline">{listing.category.name}</Badge>
        ) : (
          <Badge variant="outline">Uncategorized</Badge>
        )}
        <ScamTypeBadge scamType={listing.scamType} />
        <VerificationBadge status={listing.verification} />
      </div>

      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {listing.title}
      </h3>

      {listing.company && (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <span className="font-medium">Company:</span> {listing.company}
          {listing.location && `, ${listing.location}`}
          {listing.state && `, ${listing.state}`}
        </p>
      )}
      {listing.jobTitle && (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <span className="font-medium">Role:</span> {listing.jobTitle}
        </p>
      )}

      <p className="mt-1 line-clamp-3 text-sm text-slate-700 dark:text-slate-300">
        {truncated}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <a
            href="#"
            onClick={handleReviewsClick}
            className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="View reviews"
          >
            <ChatIcon className="h-4 w-4" /> {listing.reviewsCount}
          </a>
          <span className="text-xs">{formatDate(listing.createdAt)}</span>
        </div>
        <VoteButton
          targetType="LISTING"
          targetId={listing.id}
          initialCount={listing.upvotesCount}
          initialUpvoted={viewerUpvoted}
        />
      </div>
    </article>
  )
}

function ChatIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}