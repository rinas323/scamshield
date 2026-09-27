import { requireAdmin } from '@/lib/dal'
import type { ReactNode } from 'react'

// All /admin/* routes require an admin session. verifySession()/requireAdmin()
// redirect non-admins to the home page.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin()
  return <>{children}</>
}
