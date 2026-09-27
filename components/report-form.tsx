'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { submitListing } from '@/actions/listings'
import { SCAM_TYPES, INDIAN_STATES } from '@/lib/config'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface CategoryOpt {
  id: string
  name: string
  slug: string
}

export interface ReportFormProps {
  categories: CategoryOpt[]
}

export function ReportForm({ categories }: ReportFormProps) {
  const [state, action, pending] = useActionState(submitListing, undefined)

  if (state?.ok) {
    return (
      <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-emerald-800 dark:text-emerald-200 font-medium">
                Thank you — your report was submitted.
              </p>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                An admin will review it and publish it once verified (usually within 24 hours).
              </p>
              <Link
                href="/profile"
                className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                View your submissions
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form action={action} className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Basic Details</CardTitle>
          <CardDescription>
            Help others identify this scam with a clear, specific title.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Title <span className="text-rose-500" aria-hidden="true">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Fake 'GlobalTech' offer letter"
                required
                maxLength={120}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Company
              </Label>
              <Input
                id="company"
                name="company"
                placeholder="Company name being impersonated"
                maxLength={100}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Location (city)
              </Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. Bangalore"
                maxLength={100}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                State
              </Label>
              <Input
                id="state"
                name="state"
                list="states"
                placeholder="e.g. Karnataka"
                maxLength={60}
                className="mt-1"
              />
              <datalist id="states">
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Job title / role
              </Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                placeholder="e.g. Content moderator"
                maxLength={100}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="scamType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Scam type <span className="text-rose-500" aria-hidden="true">*</span>
              </Label>
              <select
                id="scamType"
                name="scamType"
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-150"
                defaultValue=""
              >
                <option value="" disabled>What kind of scam is this?</option>
                {SCAM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} — {t.description}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="categoryId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category (optional)
              </Label>
              <select
                id="categoryId"
                name="categoryId"
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-150"
                defaultValue=""
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Description & Evidence</CardTitle>
          <CardDescription>
            Provide as much detail as possible to help admins verify the report.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description of the scam <span className="text-rose-500" aria-hidden="true">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Explain what happened: how you were approached, what they asked for, names/emails involved."
              required
              minLength={20}
              maxLength={4000}
              rows={5}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Minimum 20 characters. Be specific about the scam process.
            </p>
          </div>

          <div>
            <Label htmlFor="evidence" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Evidence links (one URL per line)
            </Label>
            <Textarea
              id="evidence"
              name="evidence"
              placeholder="https://example.com/fake-offer.pdf&#10;https://t.me/scam-channel/123"
              rows={3}
              maxLength={2000}
              className="mt-1 font-mono text-sm"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Screenshots, PDFs, chat logs, or any URLs that support your report.
            </p>
          </div>
        </CardContent>
      </Card>

      {state?.error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 dark:bg-rose-900/30 dark:border-rose-800" role="alert">
          <div className="flex items-start gap-3">
            <svg className="flex-shrink-0 w-5 h-5 text-rose-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-rose-800 dark:text-rose-300">{state.error}</p>
          </div>
        </div>
      )}

      <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">
        {pending ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Submitting…
          </span>
        ) : 'Submit for review'}
      </Button>
    </form>
  )
}
