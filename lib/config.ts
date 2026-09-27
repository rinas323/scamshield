import { createHash } from 'crypto'

// Centralised environment + constant helpers for ScamShield.
// Server-only module: never import into Client Components directly.

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'ScamShield'
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
export const AUTH_SECRET = process.env.AUTH_SECRET

// Comma-separated list of emails that become admins on first signup.
// Server-only (never exposed to the client).
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export const COOKIE_NAME = 'scamshield-session'
export type Theme = 'light' | 'dark' | 'system'

// Obfuscated admin login path. Derived from AUTH_SECRET so it's unguessable
// without the secret. Override with ADMIN_LOGIN_SLUG env var if needed.
// The route is /admin/auth/[slug] where slug must match this value.
export const ADMIN_LOGIN_SLUG =
  process.env.ADMIN_LOGIN_SLUG ??
  createHash('sha256')
    .update(`${AUTH_SECRET ?? 'fallback'}:admin-login`)
    .digest('hex')
    .slice(0, 24)

// Scam categories shown in navigation / filters. `slug` is stored on Category.
export const SCAM_TYPES: ReadonlyArray<{
  value: string
  label: string
  description: string
}> = [
  {
    value: 'FAKE_JOB_POSTING',
    label: 'Fake job posting',
    description: 'Genuine-looking ads that don\'t lead to a real job.',
  },
  {
    value: 'IMPERSONATION',
    label: 'Impersonation',
    description: 'Scammers pose as recruiters, HR, or known companies.',
  },
  {
    value: 'PAYMENT_FRAUD',
    label: 'Payment / fee fraud',
    description: 'Asks you to pay fees, "processing charges", or buy equipment.',
  },
  {
    value: 'DOCUMENT_FRAUD',
    label: 'Document fraud',
    description: 'Forged offer letters, appointment letters, or experience letters.',
  },
  {
    value: 'FAKE_OFFER_LETTER',
    label: 'Fake offer letter',
    description: 'Planted offer letters to trick students / job-seekers.',
  },
  {
    value: 'ADVERTISING_SCAM',
    label: 'Advertising / work-from-home scam',
    description: 'Fake "earn money" schemes disguised as jobs.',
  },
  { value: 'OTHER', label: 'Other', description: 'Anything else suspicious.' },
]

// Indian states / union territories for location filters.
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep', 'Puducherry', 'Jammu and Kashmir', 'Ladakh',
]

export const ROLES = { USER: 'USER', ADMIN: 'ADMIN' } as const

// Email configuration (server-only)
export const EMAIL_HOST = process.env.EMAIL_HOST
export const EMAIL_PORT = process.env.EMAIL_PORT ?? '587'
export const EMAIL_USER = process.env.EMAIL_USER
export const EMAIL_PASS = process.env.EMAIL_PASS
export const EMAIL_FROM = process.env.EMAIL_FROM
export const EMAIL_ENABLED = Boolean(EMAIL_HOST && EMAIL_USER && EMAIL_PASS)
