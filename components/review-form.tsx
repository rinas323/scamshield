'use client'
import { useActionState } from 'react'
import { addReview } from '@/actions/reviews'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function ReviewForm({ listingSlug }: { listingSlug: string }) {
  const [state, action, pending] = useActionState(addReview, undefined)

  return (
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
      />
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-600">Review posted. Thanks for sharing.</p>}
      <Button type="submit" size="sm" disabled={pending} className="self-start">
        {pending ? 'Posting…' : 'Post review'}
      </Button>
    </form>
  )
}
