// Lightweight in-memory IP rate limiter for abuse-prone actions (e.g. upvoting).
//
// IMPORTANT: good for a single-process dev/CI deployment. For multi-instance /
// production deployments swap this for a shared store (Redis) — the interface
// stays the same (`checkRateLimit`).
const DEFAULT_WINDOW_MS = 60_000 // 1 minute
const DEFAULT_MAX = 60 // max actions per window per IP

interface Bucket {
  count: number
  resetAt: number
}

const store = new Map<string, Bucket>()

// Best-effort periodic cleanup of expired entries (avoids unbounded growth).
let lastCleanup = Date.now()
function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < 30_000) return
  lastCleanup = now
  for (const [key, bucket] of store) {
    if (bucket.resetAt < now) store.delete(key)
  }
}

export function checkRateLimit(
  ip: string,
  max = DEFAULT_MAX,
  windowMs = DEFAULT_WINDOW_MS
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup()
  const now = Date.now()
  const key = `ip:${ip}`
  const existing = store.get(key)
  if (!existing || existing.resetAt < now) {
    const bucket: Bucket = { count: 1, resetAt: now + windowMs }
    store.set(key, bucket)
    return { allowed: true, remaining: max - 1, resetAt: bucket.resetAt }
  }
  if (existing.count >= max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }
  existing.count += 1
  return { allowed: true, remaining: max - existing.count, resetAt: existing.resetAt }
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = headers.get('x-real-ip')
  return realIp ? realIp.trim() : 'unknown'
}
