import { getCurrentUser, getAllAdmins, getAllUsers } from '@/lib/dal'
import { SettingsTabs } from '@/components/admin/settings-tabs'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Settings' }

export default async function AdminSettingsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/admin')

  const [admins, usersResult] = await Promise.all([
    getAllAdmins(),
    getAllUsers(),
  ])

  const nonAdminUsers = usersResult.items.filter((u) => u.role !== 'ADMIN')

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Admin Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage notifications, users, and admin access.
        </p>
      </div>

      <SettingsTabs
        user={user}
        admins={admins}
        nonAdminUsers={nonAdminUsers}
        currentUserId={user.id}
      />
    </div>
  )
}