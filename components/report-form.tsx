'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { submitListing } from '@/actions/listings'
import { SCAM_TYPES } from '@/lib/config'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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
      <Card>
        <CardContent className="pt-6">
          <p className="text-emerald-700 dark:text-emerald-300">
            Thank you — your report was submitted. An admin will review it and
            publish it once verified (usually within 24 hours).
          </p>
          <Link
            href="/profile"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View your submissions
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="e.g. Fake ‘GlobalTech’ offer letter" required maxLength={120} />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" placeholder="Company name being impersonated" maxLength={100} />
        </div>
        <div>
          <Label htmlFor="location">Location (city)</Label>
          <Input id="location" name="location" placeholder="e.g. Bangalore" maxLength={100} />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" list="states" placeholder="e.g. Karnataka" maxLength={60} />
          <datalist id="states">
            {INDIAN_STATE_OPTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div>
          <Label htmlFor="jobTitle">Job title / role</Label>
          <Input id="jobTitle" name="jobTitle" placeholder="e.g. Content moderator" maxLength={100} />
        </div>
        <div>
          <Label htmlFor="scamType">Scam type</Label>
          <select
            id="scamType"
            name="scamType"
            required
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
          <Label htmlFor="categoryId">Category (optional)</Label>
          <select
            id="categoryId"
            name="categoryId"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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

      <div>
        <Label htmlFor="description">Description of the scam</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Explain what happened: how you were approached, what they asked for, names/emails involved."
          required
          minLength={20}
          maxLength={4000}
          rows={5}
        />
      </div>

      <div>
        <Label htmlFor="evidence">Evidence links (one URL per line)</Label>
        <Textarea
          id="evidence"
          name="evidence"
          placeholder="https://example.com/fake-offer.pdf"
          rows={3}
          maxLength={2000}
        />
      </div>

      {state?.error && (
        <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} size="lg">
        {pending ? 'Submitting…' : 'Submit for review'}
      </Button>
    </form>
  )
}

// Local copy to avoid importing the long array into the client bundle twice.
const INDIAN_STATE_OPTIONS = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep', 'Puducherry', 'Jammu and Kashmir', 'Ladakh',
]
