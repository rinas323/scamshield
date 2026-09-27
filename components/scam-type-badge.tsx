import { Badge } from '@/components/ui/badge'
import { toTitleCase } from '@/lib/utils'
import type { ScamType } from '@prisma/client'

const scamTypeVariant: Record<ScamType, 'danger' | 'warning' | 'secondary' | 'outline'> = {
  FAKE_JOB_POSTING: 'danger',
  IMPERSONATION: 'warning',
  PAYMENT_FRAUD: 'danger',
  DOCUMENT_FRAUD: 'secondary',
  FAKE_OFFER_LETTER: 'warning',
  ADVERTISING_SCAM: 'danger',
  OTHER: 'secondary',
}

export function ScamTypeBadge({ scamType }: { scamType: ScamType }) {
  return (
    <Badge variant={scamTypeVariant[scamType]} className="capitalize">
      {toTitleCase(scamType)}
    </Badge>
  )
}
