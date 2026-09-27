'use server'
import { prisma } from '@/lib/prisma'
import { verifySession, requireAdmin } from '@/lib/dal'
import { uniqueSlug } from '@/lib/slug'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ListingStatus, VerificationStatus } from '@prisma/client'
import { sendNotificationEmails } from '@/actions/notification-emails'

const createSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120),
  company: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  state: z.string().max(60).optional(),
  jobTitle: z.string().max(100).optional(),
  description: z
    .string()
    .min(20, 'Please describe the scam in at least 20 characters')
    .max(4000),
  scamType: z.enum([
    'FAKE_JOB_POSTING',
    'IMPERSONATION',
    'PAYMENT_FRAUD',
    'DOCUMENT_FRAUD',
    'FAKE_OFFER_LETTER',
    'ADVERTISING_SCAM',
    'OTHER',
  ]),
  categoryId: z.string().optional(),
  evidence: z.array(z.string().url('Must be a valid URL')).max(10).optional(),
})

export interface SubmitState {
  ok: boolean
  error?: string
  slug?: string
}

// Any authenticated user can report a scam. It starts PENDING and only an
// admin can approve it before it shows publicly.
export async function submitListing(
  _: SubmitState | undefined,
  formData: FormData
) {
  const user = await verifySession()

  const evidence = (formData.get('evidence')?.toString() ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  const parsed = createSchema.safeParse({
    title: formData.get('title'),
    company: formData.get('company') || undefined,
    location: formData.get('location') || undefined,
    state: formData.get('state') || undefined,
    jobTitle: formData.get('jobTitle') || undefined,
    description: formData.get('description'),
    scamType: formData.get('scamType'),
    categoryId: formData.get('categoryId') || undefined,
    evidence,
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((e) => e.message).join('; ') }
  }

  try {
    const slugBase = `${parsed.data.title}-${parsed.data.company ?? 'company'}`
    const slug = uniqueSlug(slugBase, `${user.id}${Date.now()}`)

    const existing = await prisma.scamListing.findUnique({ where: { slug } })
    let finalSlug = slug
    if (existing) finalSlug = `${slug}-${Math.random().toString(36).slice(2, 8)}`

    await prisma.scamListing.create({
      data: {
        ...parsed.data,
        slug: finalSlug,
        submittedById: user.id,
        status: ListingStatus.PENDING,
        verification: VerificationStatus.UNVERIFIED,
      },
    })

    // Notify all admins that a new report is awaiting review.
    const notification = await prisma.notification.create({
      data: {
        type: 'NEW_REPORT',
        listingId: null,
        title: `New report: ${parsed.data.title}`,
        body: `${parsed.data.company ?? 'Unknown company'} · ${parsed.data.scamType.replace(/_/g, ' ').toLowerCase()}`,
      },
    })

    // Fire-and-forget: send emails to admins who opted in
    // Don't await this to keep the response fast
    sendNotificationEmails(notification).catch((err) =>
      console.error('Background email send failed:', err)
    )

    revalidatePath('/admin/submissions')
    revalidatePath('/admin')
    return { ok: true, slug: finalSlug }
  } catch (err) {
    console.error('submitListing error', err)
    return { ok: false, error: 'Could not save the report. Please try again.' }
  }
}

export interface AdminActionState {
  ok: boolean
  error?: string
}

export async function approveListing(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  const id = formData.get('id')?.toString()
  const description = formData.get('adminDescription')?.toString()
  if (!id) return
  try {
    await prisma.scamListing.update({
      where: { id },
      data: {
        status: ListingStatus.APPROVED,
        verification: VerificationStatus.VERIFIED,
        adminDescription: description ?? null,
        approvedBy: { connect: { id: admin.id } },
        approvedAt: new Date(),
      },
    })
    revalidatePath(`/listings/${id}`)
    revalidatePath('/admin/submissions')
    revalidatePath('/admin')
  } catch (err) {
    console.error('approveListing error', err)
  }
}

export async function rejectListing(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = formData.get('id')?.toString()
  if (!id) return
  try {
    await prisma.scamListing.update({
      where: { id },
      data: {
        status: ListingStatus.REJECTED,
        verification: VerificationStatus.DISPUTED,
      },
    })
    revalidatePath('/admin/submissions')
  } catch (err) {
    console.error('rejectListing error', err)
  }
}

export async function deleteListing(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = formData.get('id')?.toString()
  if (!id) return
  try {
    await prisma.scamListing.delete({ where: { id } })
    revalidatePath('/admin/submissions')
  } catch (err) {
    console.error('deleteListing error', err)
  }
}

export async function setVerification(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = formData.get('id')?.toString()
  const status = formData.get('status')?.toString() as VerificationStatus | undefined
  if (!id || !status) return
  try {
    await prisma.scamListing.update({ where: { id }, data: { verification: status } })
    revalidatePath(`/listings/${id}`)
  } catch (err) {
    console.error('setVerification error', err)
  }
}
