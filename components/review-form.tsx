'use client'
import { useActionState } from 'react'
import { addReview } from '@/actions/reviews'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'

export function ReviewForm({ listingSlug }: { listingSlug: string }) {
  const [state, action, pending] = useActionState(addReview, undefined)

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardContent className="p-4">
        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="listingSlug" value={listingSlug} />
          <Textarea
            name="body"
            required
            minLength={10}
            maxLength={2000}
            rows={3}
            placeholder="Share what you experienced (min 10 characters)…"
            disabled={pending}
            className="focus:ring-2 focus:ring-indigo-500"
          />
          {state?.error && (
            <p className="text-sm text-rose-600 dark:text-rose-400 flex items-center gap-1" role="alert">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {state.error}
            </p>
          )}
          {state?.ok && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Review posted. Thanks for sharing.
            </p>
          )}
          <Button type="submit" size="sm" disabled={pending} className="self-start">
            {pending ? 'Posting…' : 'Post review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
