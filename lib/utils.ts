import clsx from 'clsx'

export function cn(...inputs: (string | false | null | undefined)[]) {
  return clsx(inputs)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function toTitleCase(s: string): string {
  return s
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\w+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}
