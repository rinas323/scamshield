'use server'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { getClientIp, checkRateLimit } from '@/lib/rateLimit'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { z } from 'zod'
import { ListingStatus, type Prisma } from '@prisma/client'

const reviewSchema = z.object({
  listingSlug: z.string().min(1),
  body: z.string().min(10, 'Review must be at least 10 characters').max(2000),
})

const replySchema = z.object({
  listingSlug: z.string().min(1),
  parentId: z.string().min(1),
  body: z.string().min(5, 'Reply must be at least 5 characters').max(2000),
})

export interface ReviewState {
  ok: boolean
  error?: string
}

export interface ReplyState {
  ok: boolean
  error?: string
  replyId?: string
}

export interface VoteState {
  ok: boolean
  error?: string
  upvotes?: number
  downvotes?: number
}

export interface DeleteReviewState {
  ok: boolean
  error?: string
}

// Authenticated users leave a text review (their profile is attached).
export async function addReview(_: ReviewState | undefined, formData: FormData) {
  const user = await verifySession()

  const parsed = reviewSchema.safeParse({
    listingSlug: formData.get('listingSlug'),
    body: formData.get('body'),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  try {
    const listing = await prisma.scamListing.findUnique({
      where: { slug: parsed.data.listingSlug },
      select: { id: true, status: true },
    })
    if (!listing) return { ok: false, error: 'Listing not found' }
    if (listing.status !== ListingStatus.APPROVED) return { ok: false, error: 'You can only review approved reports' }

    await prisma.$transaction(async (tx) => {
      await tx.review.create({
        data: { listingId: listing.id, authorId: user.id, body: parsed.data.body },
      })
      await tx.scamListing.update({
        where: { id: listing.id },
        data: { reviewsCount: { increment: 1 } },
      })
    })
    revalidatePath(`/listings/${parsed.data.listingSlug}`)
    return { ok: true }
  } catch (err) {
    console.error('addReview error', err)
    return { ok: false, error: 'Could not post your review.' }
  }
}

export async function deleteReview(formData: FormData): Promise<void> {
  const user = await verifySession()
  const id = formData.get('id')?.toString()
  if (!id) return
  try {
    const review = await prisma.review.findUnique({
      where: { id },
      select: { id: true, authorId: true, listingId: true },
    })
    if (!review) return
    if (review.authorId !== user.id && user.role !== 'ADMIN') return

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: review.id } })
      await tx.scamListing.update({
        where: { id: review.listingId },
        data: { reviewsCount: { decrement: 1 } },
      })
    })
    revalidatePath(`/listings/${review.listingId}`)
  } catch (err) {
    console.error('deleteReview error', err)
  }
}

// Upvote (or undo the upvote) a listing or a review.
// Requires login (profile-based vote) + IP rate-limit to curb bots.
export async function vote(targetType: 'LISTING' | 'REVIEW', targetId: string) {
  const user = await verifySession()
  const ip = getClientIp(await headers())
  const rl = checkRateLimit(ip, 40, 60_000) // 40 votes / minute per IP
  if (!rl.allowed) {
    return { ok: false, error: 'Too many actions from this IP, please wait a moment.' }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.vote.findFirst({
        where: { userId: user.id, targetType, targetId },
      })

      if (existing) {
        await tx.vote.delete({ where: { id: existing.id } })
        const updated = await decrementCounter(tx, targetType, targetId)
        return { toggled: false, upvotes: updated }
      }

      await tx.vote.create({
        data: { userId: user.id, targetType, targetId },
      })
      const updated = await incrementCounter(tx, targetType, targetId)
      return { toggled: true, upvotes: updated }
    })

    return { ok: true, upvotes: result.upvotes }
  } catch (err) {
    console.error('vote error', err)
    return { ok: false, error: 'Could not record your vote.' }
  }
}

// Downvote (or undo the downvote) a review.
// Requires login (profile-based vote) + IP rate-limit to curb bots.
export async function downvote(reviewId: string) {
  const user = await verifySession()
  const ip = getClientIp(await headers())
  const rl = checkRateLimit(ip, 40, 60_000) // 40 votes / minute per IP
  if (!rl.allowed) {
    return { ok: false, error: 'Too many actions from this IP, please wait a moment.' }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check if user already downvoted this review
      const existing = await tx.vote.findFirst({
        where: { userId: user.id, targetType: 'REVIEW', targetId: reviewId },
      })

      if (existing) {
        await tx.vote.delete({ where: { id: existing.id } })
        const updated = await decrementCounter(tx, 'REVIEW', reviewId)
        return { toggled: false, downvotes: updated }
      }

      await tx.vote.create({
        data: { userId: user.id, targetType: 'REVIEW', targetId: reviewId },
      })
      const updated = await incrementCounter(tx, 'REVIEW', reviewId)
      return { toggled: true, downvotes: updated }
    })

    return { ok: true, downvotes: result.downvotes }
  } catch (err) {
    console.error('downvote error', err)
    return { ok: false, error: 'Could not record your vote.' }
  }
}

// Reply to a review (threaded replies)
export async function addReply(_: ReplyState | undefined, formData: FormData) {
  const user = await verifySession()

  const parsed = replySchema.safeParse({
    listingSlug: formData.get('listingSlug'),
    parentId: formData.get('parentId'),
    body: formData.get('body'),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  try {
    const listing = await prisma.scamListing.findUnique({
      where: { slug: parsed.data.listingSlug },
      select: { id: true, status: true },
    })
    if (!listing) return { ok: false, error: 'Listing not found' }
    if (listing.status !== ListingStatus.APPROVED) return { ok: false, error: 'You can only reply to approved reports' }

    // Verify parent review exists and belongs to this listing
    const parentReview = await prisma.review.findUnique({
      where: { id: parsed.data.parentId },
      select: { id: true, listingId: true },
    })
    if (!parentReview || parentReview.listingId !== listing.id) {
      return { ok: false, error: 'Parent review not found' }
    }

    const reply = await prisma.review.create({
      data: {
        listingId: listing.id,
        authorId: user.id,
        body: parsed.data.body,
        parentId: parsed.data.parentId,
      },
    })

    await prisma.scamListing.update({
      where: { id: listing.id },
      data: { reviewsCount: { increment: 1 } },
    })

    revalidatePath(`/listings/${parsed.data.listingSlug}`)
    return { ok: true, replyId: reply.id }
  } catch (err) {
    console.error('addReply error', err)
    return { ok: false, error: 'Could not post your reply.' }
  }
}

export interface ReplyState {
  ok: boolean
  error?: string
  replyId?: string
}

export interface DeleteReviewState {
  ok: boolean
  error?: string
}

export interface VoteState {
  ok: boolean
  error?: string
  upvotes?: number
  downvotes?: number
}

// Internal: keep the denormalised counter in sync with the Vote rows.
// Uses retry logic with exponential backoff to handle write conflicts/deadlocks.
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 50
): Promise<T> {
  let lastError: Error
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err as Error
      // Check if it's a transient error (P2034 = write conflict, P2028 = transaction timeout)
      const prismaError = err as { code?: string }
      const isTransient = prismaError.code === 'P2034' || prismaError.code === 'P2028'
      if (!isTransient || attempt === maxRetries) throw err
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 50
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw lastError!
}

async function incrementCounter(
  tx: PrismaClient,
  targetType: 'LISTING' | 'REVIEW',
  targetId: string
): Promise<number> {
  return withRetry(async () => {
    if (targetType === 'LISTING') {
      const l = await tx.scamListing.update({
        where: { id: targetId },
        data: { upvotesCount: { increment: 1 } },
        select: { upvotesCount: true },
      })
      return l.upvotesCount
    }
    const r = await tx.review.update({
      where: { id: targetId },
      data: { upvotesCount: { increment: 1 } },
      select: { upvotesCount: true },
    })
    return r.upvotesCount
  })
}

async function decrementCounter(
  tx: PrismaClient,
  targetType: 'LISTING' | 'REVIEW',
  targetId: string
): Promise<number> {
  return withRetry(async () => {
    if (targetType === 'LISTING') {
      const l = await tx.scamListing.update({
        where: { id: targetId },
        data: { upvotesCount: { decrement: 1 } },
        select: { upvotesCount: true },
      })
      return l.upvotesCount
    }
    const r = await tx.review.update({
      where: { id: targetId },
      data: { upvotesCount: { decrement: 1 } },
      select: { upvotesCount: true },
    })
    return r.upvotesCount
  })
}

type PrismaClient = Prisma.TransactionClient