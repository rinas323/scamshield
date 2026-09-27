'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface LoadMoreButtonProps {
  initialCursor: string | null
  params: Record<string, string>
}

export function LoadMoreButton({ initialCursor, params }: LoadMoreButtonProps) {
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const handleLoadMore = async () => {
    if (loading || !cursor || !hasMore) return
    setLoading(true)
    try {
      const searchParams = new URLSearchParams({ ...params, cursor, limit: '20' })
      const res = await fetch(`/api/listings?${searchParams.toString()}`)
      const data = await res.json()
      if (data.items.length > 0) {
        window.dispatchEvent(new CustomEvent('listings:loadmore', { detail: data }))
      }
      setCursor(data.nextCursor)
      setHasMore(data.hasMore)
    } catch (err) {
      console.error('Load more failed:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!hasMore) return null

  return (
    <div className="flex justify-center pt-4">
      <Button
        type="button"
        onClick={handleLoadMore}
        disabled={loading}
        variant="outline"
        size="lg"
        className="min-w-[200px]"
      >
        {loading ? 'Loading...' : 'Load more'}
      </Button>
    </div>
  )
}