'use client'

import { useState, useEffect } from 'react'
import { promoteToAdmin, demoteFromAdmin, createAdminUser } from '@/actions/admin-users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface AdminUser {
  id: string
  name: string | null
  email: string | null
  role: string
}

interface UserRow {
  id: string
  name: string | null
  email: string | null
  role: string
}

interface UserSearchResult {
  items: UserRow[]
  nextCursor: string | null
}

export function UserManagementClient({
  admins,
  nonAdminUsers: initialUsers,
  currentUserId,
}: {
  admins: AdminUser[]
  nonAdminUsers: UserRow[]
  currentUserId: string
}) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [users, setUsers] = useState<UserRow[]>(initialUsers)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch users when debounced query or cursor changes
  const fetchUsers = async (newCursor?: string | null, isNewSearch = false) => {
    if (loading) return
    setLoading(true)
    try {
      const searchParams = new URLSearchParams()
      if (debouncedQuery) searchParams.set('q', debouncedQuery)
      if (newCursor) searchParams.set('cursor', newCursor)
      searchParams.set('limit', '20')

      const res = await fetch(`/api/admin/users?${searchParams.toString()}`)
      const data: UserSearchResult = await res.json()
      
      if (isNewSearch) {
        setUsers(data.items)
      } else {
        setUsers(prev => [...prev, ...data.items])
      }
      setCursor(data.nextCursor)
      setHasMore(data.nextCursor !== null)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load more
  const loadMore = () => {
    if (cursor && hasMore && !loading) {
      fetchUsers(cursor, false)
    }
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }

  // Reset and search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setUsers([])
    setCursor(null)
    setHasMore(true)
    fetchUsers(null, true)
  }

  return (
    <div className="space-y-6">
      {/* Current Admins */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Current Admins ({admins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No admins yet.</p>
          ) : (
            <div className="space-y-2">
              {admins.map((admin) => (
                <AdminRow key={admin.id} admin={admin} currentUserId={currentUserId} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promote User to Admin */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Promote User to Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="flex gap-2">
              <Input
                type="search"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={handleSearch}
                className="flex-1"
              />
              <Button type="submit" variant="outline" size="sm" disabled={loading}>
                <MagnifyingGlassIcon className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {initialUsers.length === 0 && !debouncedQuery ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">All users are already admins.</p>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <PromoteRow key={u.id} user={u} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-4 text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Admin */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create New Admin</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Add Admin'}
          </Button>
        </CardHeader>
        <CardContent>
          {showCreateForm && <CreateAdminForm onClose={() => setShowCreateForm(false)} />}
        </CardContent>
      </Card>
    </div>
  )
}

function AdminRow({ admin, currentUserId }: { admin: AdminUser; currentUserId: string }) {
  const isSelf = admin.id === currentUserId
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium">
          {(admin.name ?? admin.email ?? 'U')[0].toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">{admin.name ?? 'Unnamed'}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{admin.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Admin</Badge>
        {!isSelf && (
          <form action={demoteFromAdmin}>
            <input type="hidden" name="userId" value={admin.id} />
            <Button type="submit" variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20">
              Demote
            </Button>
          </form>
        )}
        {isSelf && <Badge variant="outline">You</Badge>}
      </div>
    </div>
  )
}

function PromoteRow({ user }: { user: UserRow }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-medium">
          {(user.name ?? user.email ?? 'U')[0].toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">{user.name ?? 'Unnamed'}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
        </div>
      </div>
      <form action={promoteToAdmin}>
        <input type="hidden" name="userId" value={user.id} />
        <Button type="submit" variant="success" size="sm">
          Promote to Admin
        </Button>
      </form>
    </div>
  )
}

function CreateAdminForm({ onClose }: { onClose: () => void }) {
  return (
    <form action={createAdminUser} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="admin-name">Name</Label>
          <Input id="admin-name" name="name" placeholder="Full name" required minLength={2} />
        </div>
        <div>
          <Label htmlFor="admin-email">Email</Label>
          <Input id="admin-email" name="email" type="email" placeholder="admin@example.com" required />
        </div>
      </div>
      <div>
        <Label htmlFor="admin-password">Password (optional)</Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          placeholder="Leave blank to set later via password reset"
          minLength={8}
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          If empty, the user must use &ldquo;Forgot password&rdquo; on login or you share a temporary password.
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="success">Create Admin</Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  )
}