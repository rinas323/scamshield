import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSessionToken } from '@/lib/auth'
import { Prisma, ListingStatus } from '@prisma/client'
import type { Role, ScamType, VerificationStatus } from '@prisma/client'
export interface CurrentUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: Role
  bio: string | null
  emailNotifications: boolean
  notificationEmail: string | null
}

// Cache the current user per-request so we don't re-read the DB / cookie on
// every component that needs auth state.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = await getSessionToken()
  if (!token) return null
  const user = await prisma.user.findUnique({
    where: { id: token.uid },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      bio: true,
      emailNotifications: true,
      notificationEmail: true,
    },
  })
  return user
})

export async function verifySession(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'ADMIN') redirect('/')
  return user
}

// Categories are static-ish; cache them.
export const getCategories = cache(async () =>
  prisma.category.findMany({ orderBy: { name: 'asc' } })
)

export const getCategoryBySlug = cache(async (slug: string) =>
  prisma.category.findUnique({ where: { slug } })
)

export interface ListingCard {
  id: string
  slug: string
  title: string
  company: string | null
  location: string | null
  state: string | null
  jobTitle: string | null
  description: string
  scamType: ScamType
  category: { name: string; icon: string | null } | null
  adminDescription: string | null
  verification: VerificationStatus
  upvotesCount: number
  reviewsCount: number
  createdAt: Date
}

export interface ListingSearchParams {
  q?: string | null
  scamType?: string | null
  state?: string | null
  categoryId?: string | null
  sort?: 'newest' | 'oldest' | 'top'
  page?: number
  limit?: number
  // Cursor-based pagination (for infinite scroll / load more)
  cursor?: string | null // base64 encoded: createdAt|id
}

export interface ListingsResult {
  items: ListingCard[]
  total: number
  page: number
  pageCount: number
  hasNext: boolean
  hasPrev: boolean
  // Cursor-based pagination fields
  nextCursor?: string | null
  hasMore?: boolean
}

// Returns approved listings matching the filters. Supports both page-based
// and cursor-based pagination.
export async function getListings(params: ListingSearchParams): Promise<ListingsResult> {
  const take = Math.min(Math.max(params.limit ?? 20, 1), 40)
  const page = Math.max(params.page ?? 1, 1)
  const skip = (page - 1) * take

  const where: Record<string, unknown> = {
    status: ListingStatus.APPROVED,
  }
  const q = (params.q ?? '').trim()
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { company: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { location: { contains: q, mode: 'insensitive' } },
      { jobTitle: { contains: q, mode: 'insensitive' } },
      { state: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (params.scamType && params.scamType !== '_all') where.scamType = (params.scamType as ScamType)
  if (params.state && params.state !== '_all') where.state = params.state
  if (params.categoryId && params.categoryId !== '_all') where.categoryId = params.categoryId

  const orderBy: Prisma.ScamListingOrderByWithRelationInput =
    params.sort === 'top'
      ? { upvotesCount: 'desc' }
      : params.sort === 'oldest'
        ? { createdAt: 'asc' }
        : { createdAt: 'desc' }

  // Cursor-based pagination: decode cursor and add to where clause
  if (params.cursor) {
    try {
      const decoded = Buffer.from(params.cursor, 'base64').toString()
      const [createdAt, id] = decoded.split('|')
      if (createdAt && id) {
        // For descending order, we want items BEFORE the cursor
        where.createdAt = {
          lt: new Date(createdAt),
        }
        // Tie-breaker: if same createdAt, use id
        where.id = { not: id }
      }
    } catch {
      // Invalid cursor, ignore
    }
  }

  const [rows, total] = await Promise.all([
    prisma.scamListing.findMany({
      where,
      orderBy,
      take: take + 1, // Fetch one extra to detect if there are more
      skip: params.cursor ? 0 : skip, // No skip with cursor
      include: { category: { select: { name: true, icon: true } } },
    }),
    prisma.scamListing.count({ where }),
  ])

  const hasMore = rows.length > take
  const items = hasMore ? rows.slice(0, take) : rows

  // Generate next cursor from the last item
  const nextCursor = hasMore && items.length > 0
    ? Buffer.from(`${items[items.length - 1].createdAt.toISOString()}|${items[items.length - 1].id}`).toString('base64')
    : null

  const itemsMapped: ListingCard[] = items.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    company: r.company,
    location: r.location,
    state: r.state,
    jobTitle: r.jobTitle,
    description: r.description,
    scamType: r.scamType,
    category: r.category ? { name: r.category.name, icon: r.category.icon } : null,
    adminDescription: r.adminDescription,
    verification: r.verification,
    upvotesCount: r.upvotesCount,
    reviewsCount: r.reviewsCount,
    createdAt: r.createdAt,
  }))

  const pageCount = Math.max(1, Math.ceil(total / take))

  return {
    items: itemsMapped,
    total,
    page,
    pageCount,
    hasNext: page < pageCount,
    hasPrev: page > 1,
    nextCursor,
    hasMore,
  }
}

export interface ListingDetail {
  id: string
  slug: string
  title: string
  company: string | null
  location: string | null
  state: string | null
  country: string | null
  jobTitle: string | null
  description: string
  scamType: ScamType
  category: { id: string; name: string; icon: string | null } | null
  evidence: string[]
  screenshotUrls: string[]
  adminDescription: string | null
  verification: VerificationStatus
  status: ListingStatus
  upvotesCount: number
  reviewsCount: number
  viewCount: number
  createdAt: Date
  submittedBy: { name: string | null } | null
}

export async function getListingDetail(
  slug: string,
  viewerId?: string | null
): Promise<ListingDetail | null> {
  const listing = await prisma.scamListing.findUnique({
    where: { slug },
    include: { category: { select: { id: true, name: true, icon: true } }, submittedBy: { select: { name: true } } },
  })
  if (!listing) return null

  if (viewerId) {
    await prisma.scamListing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    })
  }

  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    company: listing.company,
    location: listing.location,
    state: listing.state,
    country: listing.country,
    jobTitle: listing.jobTitle,
    description: listing.description,
    scamType: listing.scamType,
    category: listing.category
      ? { id: listing.category.id, name: listing.category.name, icon: listing.category.icon }
      : null,
    evidence: listing.evidence ?? [],
    screenshotUrls: listing.screenshotUrls ?? [],
    adminDescription: listing.adminDescription,
    verification: listing.verification,
    status: listing.status,
    upvotesCount: listing.upvotesCount,
    reviewsCount: listing.reviewsCount,
    viewCount: listing.viewCount,
    createdAt: listing.createdAt,
    submittedBy: listing.submittedBy ?? null,
  }
}

export interface ReviewDTO {
  id: string
  body: string
  upvotesCount: number
  downvotesCount: number
  createdAt: Date
  author: { id: string; name: string | null; image: string | null; role: Role }
  currentViewerUpvoted: boolean
  currentViewerDownvoted: boolean
  listingSlug: string
  repliesCount: number
  replies?: ReviewDTO[]
}

// Paginated reviews newest-first.
export async function getReviews(
  listingId: string,
  viewerId?: string | null,
  take = 20,
  cursor?: string | null
) {
  const skip = cursor ? 1 : 0
  const rows = await prisma.review.findMany({
    where: { listingId },
    orderBy: { createdAt: 'desc' },
    take,
    skip,
    cursor: cursor ? { id: cursor } : undefined,
select: {
        id: true,
        body: true,
        upvotesCount: true,
        downvotesCount: true,
        createdAt: true,
        listingId: true,
        author: { select: { id: true, name: true, image: true, role: true } },
        _count: { select: { replies: true } },
        replies: {
          take: 3,
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            body: true,
            upvotesCount: true,
            downvotesCount: true,
            createdAt: true,
            author: { select: { id: true, name: true, image: true, role: true } },
          },
        },
        listing: { select: { slug: true } },
      },
  })

  const viewerVotes = viewerId
    ? await prisma.vote.findMany({
        where: { userId: viewerId, targetType: 'REVIEW', targetId: { in: rows.map((r) => r.id) } },
        select: { targetId: true },
      })
    : []
  const upvoted = new Set(viewerVotes.map((v) => v.targetId))

  // Also get downvotes
  const viewerDownVotes = viewerId
    ? await prisma.vote.findMany({
        where: { userId: viewerId, targetType: 'REVIEW', targetId: { in: rows.map((r) => r.id) } },
        select: { targetId: true },
      })
    : []
  const downvoted = new Set(viewerDownVotes.map((v) => v.targetId))

  // Get listing slug for reply form
  const listingSlug = rows[0]?.listing?.slug ?? ''

  const items: ReviewDTO[] = rows.map((r) => ({
    id: r.id,
    body: r.body,
    upvotesCount: r.upvotesCount,
    downvotesCount: r.downvotesCount ?? 0,
    createdAt: r.createdAt,
    author: { id: r.author.id, name: r.author.name, image: r.author.image, role: r.author.role },
    currentViewerUpvoted: upvoted.has(r.id),
    currentViewerDownvoted: downvoted.has(r.id),
    listingSlug,
    repliesCount: r._count?.replies ?? 0,
    replies: r.replies?.map((reply) => ({
      id: reply.id,
      body: reply.body,
      upvotesCount: reply.upvotesCount,
      downvotesCount: reply.downvotesCount ?? 0,
      createdAt: reply.createdAt,
      author: { id: reply.author.id, name: reply.author.name, image: reply.author.image, role: reply.author.role },
      currentViewerUpvoted: upvoted.has(reply.id),
      currentViewerDownvoted: downvoted.has(reply.id),
      listingSlug,
      repliesCount: 0,
    })),
  }))

  const nextCursor = rows.length === take ? rows[take - 1].id : null
  return { items, nextCursor }
}

// --- Admin / user-scoped reads ---
export interface SubmissionListItem {
  id: string
  title: string
  slug: string
  company: string | null
  state: string | null
  scamType: string
  status: ListingStatus
  verification: string
  upvotesCount: number
  reviewsCount: number
  createdAt: Date
  submittedBy: { name: string | null } | null
}

export async function getPendingSubmissions() {
  const rows = await prisma.scamListing.findMany({
    where: { status: ListingStatus.PENDING },
    orderBy: { createdAt: 'asc' },
    include: { submittedBy: { select: { name: true } } },
  })
  return rows.map(
    (r): SubmissionListItem => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      company: r.company,
      state: r.state,
      scamType: r.scamType,
      status: r.status,
      verification: r.verification,
      upvotesCount: r.upvotesCount,
      reviewsCount: r.reviewsCount,
      createdAt: r.createdAt,
      submittedBy: r.submittedBy,
    })
  )
}

export async function getAdminListing(id: string) {
  return prisma.scamListing.findUnique({
    where: { id },
    include: { category: true, submittedBy: { select: { id: true, name: true } } },
  })
}

export async function getUserSubmissions(userId: string, status?: ListingStatus) {
  const where: Record<string, unknown> = { submittedById: userId }
  if (status) where.status = status
  return prisma.scamListing.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { name: true, icon: true } },
    },
  })
}

export async function getUserProfile(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      bio: true,
      createdAt: true,
      _count: { select: { submissions: true, reviews: true } },
    },
  })
}

export async function getUserReviews(userId: string) {
  return prisma.review.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      listing: { select: { id: true, slug: true, title: true, status: true } },
    },
  })
}

export async function getViewerUpvotedListingIds(
  viewerId: string | undefined,
  listingIds: string[]
): Promise<Set<string>> {
  if (!viewerId || listingIds.length === 0) return new Set()
  const votes = await prisma.vote.findMany({
    where: { userId: viewerId, targetType: 'LISTING', targetId: { in: listingIds } },
    select: { targetId: true },
  })
  return new Set(votes.map((v) => v.targetId))
}

// --- Notifications ---

export interface NotificationDTO {
  id: string
  type: string
  listingId: string | null
  title: string
  body: string
  read: boolean
  createdAt: Date
}

export async function getNotifications(limit = 20): Promise<NotificationDTO[]> {
  const rows = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return rows.map((n) => ({
    id: n.id,
    type: n.type,
    listingId: n.listingId,
    title: n.title,
    body: n.body,
    read: n.read,
    createdAt: n.createdAt,
  }))
}

export async function getUnreadNotificationCount(): Promise<number> {
  return prisma.notification.count({ where: { read: false } })
}

// Get admins who have email notifications enabled
export async function getAdminsWithEmailNotifications(): Promise<
  { id: string; name: string | null; email: string | null; notificationEmail: string | null }[]
> {
  return prisma.user.findMany({
    where: {
      role: 'ADMIN',
      emailNotifications: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      notificationEmail: true,
    },
  })
}

// Get all admins (for user management UI)
export async function getAllAdmins(): Promise<{ id: string; name: string | null; email: string | null; role: string }[]> {
  return prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { createdAt: 'desc' },
  })
}

// Get all users with search and pagination (for promote-to-admin UI)
export interface UserSearchParams {
  q?: string | null
  cursor?: string | null
  limit?: number
}

export async function getAllUsers(params: UserSearchParams = {}): Promise<{
  items: { id: string; name: string | null; email: string | null; role: string }[]
  nextCursor: string | null
}> {
  const take = Math.min(Math.max(params.limit ?? 20, 1), 50)
  const q = (params.q ?? '').trim()

  const where: Record<string, unknown> = {
    role: 'USER', // Only non-admin users for promotion
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ]
  }

  const rows = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: take + 1,
    cursor: params.cursor ? { id: params.cursor } : undefined,
    select: { id: true, name: true, email: true, role: true },
  })

  const hasMore = rows.length > take
  const items = hasMore ? rows.slice(0, take) : rows
const nextCursor = hasMore ? items[items.length - 1].id : null
  return { items, nextCursor }
}
