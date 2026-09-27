import { getAllUsers } from '@/lib/dal'
import { getCurrentUser } from '@/lib/dal'
import { type NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || undefined
  const cursor = searchParams.get('cursor') || undefined
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  const result = await getAllUsers({ q, cursor, limit })
  return Response.json(result)
}