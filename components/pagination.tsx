import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

export interface PaginationProps {
  page: number
  pageCount: number
  query: Record<string, string>
}

export function Pagination({ page, pageCount, query }: PaginationProps) {
  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    params.set('page', String(targetPage))
    return `/?${params.toString()}`
  }

  const pages = visiblePages(page, pageCount)

  if (pageCount <= 1) return null

  return (
    <nav
      aria-label="Pagination"
      className="my-8 flex flex-wrap items-center justify-center gap-1"
    >
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-label="Previous page"
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
          page <= 1 && 'pointer-events-none opacity-50'
        )}
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Link>

      {pages.map((p) =>
        p === 'ellipsis' ? (
          <span
            key="ellipsis"
            className="flex h-9 items-center px-2 text-sm text-slate-500 dark:text-slate-400"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Page ${p}`}
            className={cn(
              'inline-flex h-9 min-w-[36px] items-center justify-center rounded-lg border text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
              p === page
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            )}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildHref(Math.min(pageCount, page + 1))}
        aria-label="Next page"
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
          page >= pageCount && 'pointer-events-none opacity-50'
        )}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Link>
    </nav>
  )
}

function visiblePages(current: number, total: number): (number | 'ellipsis')[] {
  const delta = 1
  const range: (number | 'ellipsis')[] = []
  const left = Math.max(2, current - delta)
  const right = Math.min(total - 1, current + delta)
  range.push(1)
  if (left > 2) range.push('ellipsis')
  for (let i = left; i <= right; i++) range.push(i)
  if (right < total - 1) range.push('ellipsis')
  if (total > 1) range.push(total)
  return range
}
