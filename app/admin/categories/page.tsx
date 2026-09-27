import { getCategories } from '@/lib/dal'
import { deleteCategory } from '@/actions/admin'
import { CreateCategoryForm } from '@/components/create-category-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Metadata } from 'next'

export const metadata: Metadata = { title: 'Manage categories' }

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Manage categories
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Categories group scam reports so visitors can filter them.
        </p>
      </div>

      <CreateCategoryForm />

      <Card>
        <CardHeader>
          <CardTitle>Existing categories</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase dark:text-slate-400">
                <th className="pb-2 font-medium">Icon</th>
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Slug</th>
                <th className="pb-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500 dark:text-slate-400">
                    No categories yet. Add one above.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="align-top">
                    <td className="py-2">{c.icon ?? '—'}</td>
                    <td className="py-2 font-medium text-slate-900 dark:text-slate-100">{c.name}</td>
                    <td className="py-2 text-slate-500 dark:text-slate-400">{c.slug}</td>
                    <td className="py-2 text-right">
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" defaultValue={c.id} />
                        <Button type="submit" variant="danger" size="sm" disabled={c.name === 'Uncategorized'}>
                          Delete
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
