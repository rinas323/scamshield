import {
  getListings,
  getCategories,
  getCurrentUser,
  getViewerUpvotedListingIds,
} from '@/lib/dal'
import { SearchForm } from '@/components/search-form'
import { ListingGrid } from '@/components/listing-grid'
import { Pagination } from '@/components/pagination'
import { LoadMoreButton } from '@/components/load-more-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home',
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const getString = (key: string) => {
    const v = sp[key]
    return Array.isArray(v) ? v[0] : (v ?? null)
  }

  const q = getString('q')
  const scamType = getString('scamType')
  const state = getString('state') === '_all' ? null : getString('state')
  const categoryId = getString('categoryId') === '_all' ? null : getString('categoryId')
  const sort = (getString('sort') as 'newest' | 'oldest' | 'top') ?? 'newest'
  const page = parseInt(getString('page') ?? '1', 10) || 1

  const [results, categories, user] = await Promise.all([
    getListings({
      q: q ?? undefined,
      scamType: scamType ?? undefined,
      state: state ?? undefined,
      categoryId: categoryId ?? undefined,
      sort,
      page,
    }),
    getCategories(),
    getCurrentUser(),
  ])

  const viewerUpvoted =
    page === 1
      ? await getViewerUpvotedListingIds(
          user?.id,
          results.items.map((i) => i.id)
        )
      : new Set<string>()

  return (
    <div className="flex flex-col gap-8">
      <section className="text-center py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 mb-4">
          <svg className="w-7 h-7 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
          Track job & internship scams in India
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Report, review and upvote suspicious job & internship listings before
          they hurt others.
        </p>
      </section>

      <section className="relative">
        <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <SearchForm
              q={q ?? undefined}
              scamType={scamType ?? undefined}
              state={state ?? undefined}
              categoryId={categoryId ?? undefined}
              sort={sort}
              categories={categories}
            />
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{results.total}</span> approved report{results.total !== 1 ? 's' : ''}
          </p>
          <Badge variant="secondary" className="text-xs">{results.pageCount} page{results.pageCount !== 1 ? 's' : ''}</Badge>
        </div>
        {results.items.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="py-12 text-center">
              <svg className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No reports found</h3>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Try adjusting your filters or <a href="/report" className="text-indigo-600 hover:underline dark:text-indigo-400">report a new scam</a>.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ListingGrid
            items={results.items}
            viewerUpvoted={viewerUpvoted}
          />
        )}
        <Pagination
          page={results.page}
          pageCount={results.pageCount}
          query={{
            q: q ?? '',
            scamType: scamType ?? '',
            state: state ?? '',
            categoryId: categoryId ?? '',
          }}
        />
        {/* Load More button for cursor-based infinite scroll */}
        {results.hasMore && (
          <LoadMoreButton
            initialCursor={results.nextCursor ?? null}
            params={{
              q: q ?? '',
              scamType: scamType ?? '',
              state: state ?? '',
              categoryId: categoryId ?? '',
              sort,
            }}
          />
        )}
      </section>
    </div>
  )
}