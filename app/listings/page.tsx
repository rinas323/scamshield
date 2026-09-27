import {
  getListings,
  getCategories,
  getCurrentUser,
  getViewerUpvotedListingIds,
} from '@/lib/dal'
import { SearchForm } from '@/components/search-form'
import { ListingGrid } from '@/components/listing-grid'
import { Pagination } from '@/components/pagination'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All reports',
}

export default async function ListingsPage({
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
      <section>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
          All reports
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          <span className="font-semibold">{results.total}</span> approved reports
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <SearchForm
          q={q ?? undefined}
          scamType={scamType ?? undefined}
          state={state ?? undefined}
          categoryId={categoryId ?? undefined}
          sort={sort}
          categories={categories}
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{results.pageCount} page(s)</Badge>
        </div>
        <ListingGrid
          items={results.items}
          viewerUpvoted={viewerUpvoted}
        />
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
      </section>
    </div>
  )
}
