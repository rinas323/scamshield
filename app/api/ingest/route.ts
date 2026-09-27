import { getCurrentUser } from '@/lib/dal'
import { ingest } from '@/lib/ingestion'



// Admin-only endpoint that (re)runs all configured scrapers and imports new
// listings. Triggered manually from the admin dashboard.
export async function POST() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const report = await ingest()
    return Response.json(report)
  } catch (e) {
    return Response.json(
      { error: 'Ingest failed', message: (e as Error).message },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
