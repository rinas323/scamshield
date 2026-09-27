'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { updateEmailNotifications } from '@/actions/admin-settings'
import { UserManagementClient } from '@/components/admin/user-management'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SettingsTabs({ 
  user,
  admins,
  nonAdminUsers,
  currentUserId,
}: {
  user: { emailNotifications: boolean; notificationEmail: string | null; email: string | null; id: string }
  admins: { id: string; name: string | null; email: string | null; role: string }[]
  nonAdminUsers: { id: string; name: string | null; email: string | null; role: string }[]
  currentUserId: string
}) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'users'>('notifications')

  return (
    <div>
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <TabButton id="notifications" label="Notifications" activeTab={activeTab} onTabChange={setActiveTab} />
        <TabButton id="users" label="User Management" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === 'notifications' && (
        <div id="notifications-panel" className="space-y-6">
          <NotificationSettings user={user} />
          <EmailConfigInfo />
        </div>
      )}

      {activeTab === 'users' && (
        <div id="users-panel" className="space-y-6">
          <UserManagementClient
            admins={admins}
            nonAdminUsers={nonAdminUsers}
            currentUserId={currentUserId}
          />
        </div>
      )}
    </div>
  )
}

function TabButton({ id, label, activeTab, onTabChange }: { id: 'notifications' | 'users'; label: string; activeTab: string; onTabChange: (tab: string) => void }) {
  const isActive = activeTab === id
  return (
    <button
      type="button"
      onClick={() => onTabChange(id as 'notifications' | 'users')}
      id={`tab-${id}`}
      className={`flex-1 py-3 px-4 border-b-2 text-sm font-medium transition-colors ${
        isActive
          ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
          : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  )
}

// Client-side notification settings form
function NotificationSettings({ user }: { 
  user: { emailNotifications: boolean; notificationEmail: string | null; email: string | null }
}) {
  const [state, action, pending] = useActionState(updateEmailNotifications, undefined)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={action} className="space-y-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="emailNotifications"
              name="emailNotifications"
              defaultChecked={user.emailNotifications}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <Label htmlFor="emailNotifications" className="font-medium text-slate-900 dark:text-slate-100">
                Receive email notifications for new reports
              </Label>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Get an email immediately when a user submits a new scam report that needs review.
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="notificationEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Notification email address (optional)
            </Label>
            <Input
              id="notificationEmail"
              name="notificationEmail"
              type="email"
              placeholder="notifications@yourdomain.com"
              defaultValue={user.notificationEmail ?? ''}
              className="mt-1"
            />
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Leave blank to use your account email ({user.email}). Use a different address if you want
              report notifications sent to a dedicated inbox or team alias.
            </p>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save preferences'}
          </Button>
          {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
          {state?.ok && <p className="text-sm text-emerald-600">Saved!</p>}
        </form>
      </CardContent>
    </Card>
  )
}

function EmailConfigInfo() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <h3 className="font-medium text-slate-900 dark:text-slate-100">Email Configuration</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Email sending requires the following environment variables on your server:
      </p>
      <ul className="mt-2 space-y-1 text-sm font-mono text-slate-700 dark:text-slate-300">
        <li><code>EMAIL_HOST</code> — SMTP server hostname (e.g., smtp.resend.com)</li>
        <li><code>EMAIL_PORT</code> — SMTP port (default: 587)</li>
        <li><code>EMAIL_USER</code> — SMTP username</li>
        <li><code>EMAIL_PASS</code> — SMTP password / API key</li>
        <li><code>EMAIL_FROM</code> — Optional custom from address</li>
      </ul>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Without these configured, emails are logged to the console in development mode.
      </p>
    </div>
  )
}