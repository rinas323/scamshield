import { getCurrentUser, getCategories } from '@/lib/dal'
import { ReportForm } from '@/components/report-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { type Metadata } from 'next'

export const metadata: Metadata = { title: 'Report a scam' }

export default async function ReportPage() {
  const user = await getCurrentUser()
  const categories = await getCategories()

  if (!user) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Report a scam
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          You must be signed in to submit a report. Accounts are free and your
          name stays private in reviews.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Button asChild><Link href="/login">Sign in</Link></Button>
          <Button asChild variant="secondary"><Link href="/signup">Create account</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Report a job or internship scam
      </h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Your report is private until an admin verifies and publishes it.
      </p>
      <div className="mt-6">
        <ReportForm categories={categories} />
      </div>
    </div>
  )
}
