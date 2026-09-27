'use client'
import { useState } from 'react'
import { Avatar } from '@/components/avatar'
import { VoteButton } from '@/components/vote-button'
import { deleteReview } from '@/actions/reviews'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ReplyForm } from '@/components/reply-form'
import { TrashIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import type { ReviewDTO } from '@/lib/dal'
import { cn } from '@/lib/utils'

export interface ReviewItemProps {
  review: ReviewDTO
  viewerId: string | null
  depth?: number
}

export function ReviewItem({ review, viewerId, depth = 0 }: ReviewItemProps) {
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)

  const canDelete =
    viewerId &&
    (viewerId === review.author.id || review.author.role === 'ADMIN')

  const hasReplies = review.repliesCount > 0

  return (
    <li className="flex gap-3" style={{ marginLeft: `${depth * 24}px` }}>
      <Avatar src={review.author.image} name={review.author.name} size={32} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{review.author.name ?? 'Anonymous'}</span>
          {review.author.role === 'ADMIN' && <Badge variant="secondary">admin</Badge>}
          <time dateTime={review.createdAt.toISOString()} className="text-slate-500 dark:text-slate-400">
            {formatDate(review.createdAt)}
          </time>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
          {review.body}
        </p>
        <div className="mt-2 flex items-center gap-4">
          <VoteButton
            targetType="REVIEW"
            targetId={review.id}
            initialCount={review.upvotesCount}
            initialDownCount={review.downvotesCount}
            initialUpvoted={viewerId ? review.currentViewerUpvoted : false}
            initialDownvoted={viewerId ? review.currentViewerDownvoted : false}
          />
          {hasReplies && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className={cn(
                'inline-flex items-center gap-1 text-sm font-medium transition-colors',
                'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400'
              )}
              aria-expanded={showReplies}
            >
              <ChevronRightIcon
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  showReplies && 'rotate-90'
                )}
                aria-hidden="true"
              />
              {showReplies ? 'Hide' : 'View'} replies
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {review.repliesCount}
              </span>
            </button>
          )}
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-medium"
          >
            Reply
          </button>
          {canDelete && (
            <form action={deleteReview}>
              <input type="hidden" name="id" value={review.id} />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:text-rose-700"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </Button>
            </form>
          )}
        </div>

        {showReplyForm && (
          <ReplyForm listingSlug={review.listingSlug} parentId={review.id} />
        )}

        {showReplies && review.replies && review.replies.length > 0 && (
          <ul className="mt-4 space-y-3 ml-10 border-l-2 border-slate-200 pl-4 dark:border-slate-700 animate-in slide-in-from-top-2 fade-in duration-200">
            {review.replies.map((reply) => (
              <ReviewItem key={reply.id} review={reply} viewerId={viewerId} depth={depth + 1} />
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}