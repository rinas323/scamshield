import { getListings } from '@/lib/dal'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const scamType = sp.get('scamType') || undefined
  const state = sp.get('state') || undefined
  const categoryId = sp.get('categoryId') || undefined
  const sort = (sp.get('sort') as 'newest' | 'oldest' | 'top') ?? 'newest'
  const page = parseInt(sp.get('page') ?? '1', 10)
  const limit = parseInt(sp.get('limit') ?? '20', 10)
  const cursor = sp.get('cursor') || undefined

  const result = await getListings({
    q: sp.get('q') ?? undefined,
    scamType,
    state,
    categoryId,
    sort,
    page,
    limit,
    cursor,
  })

  return Response.json({
    items: result.items,
    total: result.total,
    page: result.page,
    pageCount: result.pageCount,
    hasNext: result.hasNext,
    hasPrev: result.hasPrev,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  })
}

// Tell edge/runtime this is dynamic.
export const dynamic = 'force-dynamic'
