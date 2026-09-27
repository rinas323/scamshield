'use client'
import { useActionState } from 'react'
import { addReply } from '@/actions/reviews'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function ReplyForm({ listingSlug, parentId }: { listingSlug: string; parentId: string }) {
  const [state, action, pending] = useActionState(addReply, undefined)

  return (
    <form action={action} className="flex flex-col gap-2 mt-2 ml-10 border-l-2 border-slate-200 pl-3 dark:border-slate-700">
      <input type="hidden" name="listingSlug" value={listingSlug} />
      <input type="hidden" name="parentId" value={parentId} />
      <Textarea
        name="body"
        required
        minLength={5}
        maxLength={2000}
        rows={2}
        placeholder="Write a reply..."
        className="text-sm"
        disabled={pending}
      />
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <Button type="submit" size="sm" disabled={pending} className="self-start">
        {pending ? 'Posting…' : 'Reply'}
      </Button>
    </form>
  )
}