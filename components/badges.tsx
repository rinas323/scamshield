import { Badge } from '@/components/ui/badge'
import { toTitleCase } from '@/lib/utils'
import type { ListingStatus, VerificationStatus } from '@prisma/client'

const statusVariant: Record<
  ListingStatus,
  'success' | 'warning' | 'danger' | 'secondary' | 'outline'
> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
}

export function StatusBadge({ status }: { status: ListingStatus }) {
  return (
    <Badge variant={statusVariant[status]} className="capitalize">
      {toTitleCase(status)}
    </Badge>
  )
}

const verificationVariant: Record<
  VerificationStatus,
  'success' | 'warning' | 'danger' | 'secondary' | 'outline'
> = {
  UNVERIFIED: 'secondary',
  VERIFIED: 'success',
  DISPUTED: 'warning',
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  return (
    <Badge variant={verificationVariant[status]} className="capitalize">
      {toTitleCase(status)}
    </Badge>
  )
}
