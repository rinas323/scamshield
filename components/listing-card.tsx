import { Badge } from '@/components/ui/badge'
import { VerificationBadge } from '@/components/badges'
import { ScamTypeBadge } from '@/components/scam-type-badge'
import { VoteButton } from '@/components/vote-button'
import { formatDate } from '@/lib/utils'
import type { ListingCard } from '@/lib/dal'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

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

  const handleCardClick = () => {
    router.push(`/listings/${listing.slug}`)
  }

  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 cursor-pointer',
        'hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5',
        'dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950'
      )}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      tabIndex={0}
      role="article"
      aria-label={`View details for ${listing.title}`}
    >
      <div className="flex flex-wrap items-start gap-1.5">
        {listing.category ? (
          <Badge variant="outline" className="text-xs">{listing.category.name}</Badge>
        ) : (
          <Badge variant="outline" className="text-xs">Uncategorized</Badge>
        )}
        <ScamTypeBadge scamType={listing.scamType} />
        <VerificationBadge status={listing.verification} />
      </div>

      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
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

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <button
            onClick={handleReviewsClick}
            className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 rounded"
            title="View reviews"
            aria-label={`View ${listing.reviewsCount} review${listing.reviewsCount !== 1 ? 's' : ''}`}
          >
            <ChatIcon className="h-4 w-4" />
            <span className="font-medium">{listing.reviewsCount}</span>
          </button>
          <time dateTime={listing.createdAt.toISOString()} className="text-xs whitespace-nowrap">
            {formatDate(listing.createdAt)}
          </time>
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