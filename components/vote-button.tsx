'use client'
import { vote, downvote } from '@/actions/reviews'
import { cn } from '@/lib/utils'
import { ArrowUpLeftIcon, ArrowDownLeftIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export interface VoteButtonProps {
  targetType: 'LISTING' | 'REVIEW'
  targetId: string
  initialCount: number
  initialDownCount?: number
  initialUpvoted: boolean
  initialDownvoted?: boolean
}

export function VoteButton({
  targetType,
  targetId,
  initialCount,
  initialDownCount = 0,
  initialUpvoted,
  initialDownvoted = false,
}: VoteButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [downCount, setDownCount] = useState(initialDownCount)
  const [upvoted, setUpvoted] = useState(initialUpvoted)
  const [downvoted, setDownvoted] = useState(initialDownvoted)
  const [loading, setLoading] = useState(false)

  const handleUpvote = async () => {
    if (loading) return
    setLoading(true)
    const prevCount = count
    const prevUpvoted = upvoted
    // Optimistic update
    setUpvoted(!upvoted)
    setCount(upvoted ? count - 1 : count + 1)
    try {
      const res = await vote(targetType, targetId)
      if (res?.ok) {
        setCount(res.upvotes ?? count)
      } else {
        setUpvoted(prevUpvoted)
        setCount(prevCount)
      }
    } catch {
      setUpvoted(prevUpvoted)
      setCount(prevCount)
    } finally {
      setLoading(false)
    }
  }

  const handleDownvote = async () => {
    if (loading) return
    setLoading(true)
    const prevDownCount = downCount
    const prevDownvoted = downvoted
    // Optimistic update
    setDownvoted(!downvoted)
    setDownCount(downvoted ? downCount - 1 : downCount + 1)
    try {
      const res = await downvote(targetId)
      if (res?.ok) {
        setDownCount(res.downvotes ?? downCount)
      } else {
        setDownvoted(prevDownvoted)
        setDownCount(prevDownCount)
      }
    } catch {
      setDownvoted(prevDownvoted)
      setDownCount(prevDownCount)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          handleUpvote()
        }}
        disabled={loading}
        aria-pressed={upvoted}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
          upvoted
            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        )}
      >
        <ArrowUpLeftIcon className={cn('h-4 w-4', upvoted && 'text-indigo-600 dark:text-indigo-400')} />
        <span>{count}</span>
      </button>
      {targetType === 'REVIEW' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleDownvote()
          }}
          disabled={loading}
          aria-pressed={downvoted}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            downvoted
              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/60'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          )}
        >
          <ArrowDownLeftIcon className={cn('h-4 w-4', downvoted && 'text-rose-600 dark:text-rose-400')} />
          <span>{downCount}</span>
        </button>
      )}
    </div>
  )
}