import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Lightweight connectivity probe.
    await prisma.user.count()
    return Response.json({ status: 'ok', db: 'connected' })
  } catch (e) {
    return Response.json({ status: 'degraded', db: 'disconnected', error: (e as Error).message }, { status: 503 })
  }
}
