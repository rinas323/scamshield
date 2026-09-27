import Link from 'next/link'
import { SCAM_TYPES, INDIAN_STATES } from '@/lib/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface SearchFormProps {
  q?: string
  scamType?: string
  state?: string
  categoryId?: string
  sort?: string
  categories: { id: string; name: string; slug: string }[]
}

export function SearchForm({
  q = '',
  scamType = '',
  state = '',
  categoryId = '',
  sort = 'newest',
  categories,
}: SearchFormProps) {
  return (
    <form action="/" method="get" className="grid grid-cols-1 gap-3 sm:grid-cols-6">
      <div className="sm:col-span-2">
        <label className="sr-only">Search</label>
        <Input name="q" type="search" placeholder="Search company or job…" defaultValue={q} />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          Scam type
        </label>
        <select
          name="scamType"
          defaultValue={scamType || '_all'}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="_all">All types</option>
          {SCAM_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          State
        </label>
        <select
          name="state"
          defaultValue={state || '_all'}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="_all">All states</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          Category
        </label>
        <select
          name="categoryId"
          defaultValue={categoryId || '_all'}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="_all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          Sort
        </label>
        <select
          name="sort"
          defaultValue={sort || 'newest'}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="newest">Newest first</option>
          <option value="top">Most upvoted</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>
      <div className="sm:col-span-6 flex items-end gap-3">
        <Button type="submit" size="md">
          Search
        </Button>
        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-indigo-700 dark:text-slate-400 dark:hover:text-indigo-400">
          Clear filters
        </Link>
      </div>
    </form>
  )
}
