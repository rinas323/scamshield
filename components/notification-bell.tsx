import { getNotifications, getUnreadNotificationCount } from '@/lib/dal'
import { markNotificationRead, markAllNotificationsRead } from '@/actions/notifications'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export async function NotificationBell() {
  const [unread, notifications] = await Promise.all([
    getUnreadNotificationCount(),
    getNotifications(8),
  ])

  return (
    <div className="relative group">
      <button
        type="button"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
          <path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75v-.7V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.078 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-xs font-bold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <div className="invisible absolute right-0 top-full z-50 mt-2 w-80 origin-top-right rounded-lg border border-slate-200 bg-white shadow-lg opacity-0 transition-all group-hover:visible group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-3 dark:border-slate-700">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Notifications
          </span>
          {unread > 0 && (
            <form action={markAllNotificationsRead}>
              <button
                type="submit"
                className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Mark all read
              </button>
            </form>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="p-4 text-sm text-slate-500 dark:text-slate-400">
            No notifications yet.
          </p>
        ) : (
          <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-2 p-3 ${n.read ? '' : 'bg-indigo-50/50 dark:bg-indigo-950/20'}`}
              >
                {!n.read && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {n.body}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
                {!n.read && (
                  <form action={markNotificationRead}>
                    <input type="hidden" name="id" value={n.id} />
                    <button
                      type="submit"
                      className="shrink-0 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                      aria-label="Mark as read"
                    >
                      ✓
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-slate-200 p-2 dark:border-slate-700">
          <Link
            href="/admin/notifications"
            className="block rounded-md px-3 py-1.5 text-center text-sm font-medium text-indigo-600 hover:bg-slate-100 dark:text-indigo-400 dark:hover:bg-slate-800"
          >
            View all notifications
          </Link>
        </div>
      </div>
    </div>
  )
}
