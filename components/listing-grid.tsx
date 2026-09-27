'use client'

import { useEffect, useState } from 'react'
import { ListingCard } from '@/components/listing-card'
import type { ListingCard as ListingCardType } from '@/lib/dal'

export interface ListingGridProps {
  items: ListingCardType[]
  viewerUpvoted: Set<string>
}

export function ListingGrid({ items: initialItems, viewerUpvoted }: ListingGridProps) {
  const [items, setItems] = useState<ListingCardType[]>(initialItems)

  useEffect(() => {
    const handleLoadMore = (event: CustomEvent) => {
      const data = event.detail
      if (data.items && data.items.length > 0) {
        // Append new items, avoiding duplicates by id
        setItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.id))
          const newItems = data.items.filter((i: ListingCardType) => !existingIds.has(i.id))
          return [...prev, ...newItems]
        })
      }
    }

    window.addEventListener('listings:loadmore', handleLoadMore as EventListener)
    return () => window.removeEventListener('listings:loadmore', handleLoadMore as EventListener)
  }, [])

  if (!items.length) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        No reports match your search. Try adjusting the filters or report a new scam.
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ListingCard
          key={item.id}
          listing={item}
          viewerUpvoted={viewerUpvoted.has(item.id)}
        />
      ))}
    </div>
  )
}