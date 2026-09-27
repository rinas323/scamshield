'use server'
import { prisma } from '@/lib/prisma'
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
} from '@/lib/auth'
import { ADMIN_EMAILS } from '@/lib/config'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { sendOtpEmail } from '@/lib/email'

function roleFor(email: string) {
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? 'ADMIN' : 'USER'
}

function isAdminEmail(email: string) {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

const nameSchema = z.string().min(2, 'Name must be at least 2 characters')
const emailSchema = z.string().email({ message: 'Enter a valid email address' })
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Must contain at least one letter')
  .regex(/[0-9]/, 'Must contain at least one number')

const otpSchema = z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be 6 digits')

export interface AuthState {
  ok: boolean
  error?: string
  email?: string // for redirecting to verify page
}

export async function signup(_: AuthState | undefined, formData: FormData) {
  const name = formData.get('name')?.toString().trim()
  const email = (formData.get('email')?.toString().toLowerCase() ?? '').trim()
  const password = formData.get('password')?.toString() ?? ''
  const confirm = formData.get('confirm')?.toString() ?? ''

  const n = nameSchema.safeParse(name)
  const e = emailSchema.safeParse(email)
  const p = passwordSchema.safeParse(password)
  const firstError =
    !n.success
      ? n.error.format()._errors.join('; ')
      : !e.success
        ? e.error.format()._errors.join('; ')
        : !p.success
          ? p.error.format()._errors.join('; ')
          : password !== confirm
            ? 'Passwords do not match'
            : null

  if (firstError) return { ok: false, error: firstError }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      // If existing user is not verified, allow resending OTP
      if (existing.emailVerified === null) {
        const otpResult = await sendOtpEmail(email, existing.name)
        if (!otpResult.sent) {
          return { ok: false, error: 'Could not send verification code.' }
        }
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            emailOtp: otpResult.otp,
            emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          },
        })
        return { ok: true, email, error: 'Verification code sent to your email.' }
      }
      return { ok: false, error: 'An account with that email already exists' }
    }

    const hash = await hashPassword(password)
    const otpResult = await sendOtpEmail(email, n.data as string)
    if (!otpResult.sent) {
      return { ok: false, error: 'Could not send verification code.' }
    }

    await prisma.user.create({
      data: {
        name: n.data,
        email,
        password: hash,
        role: roleFor(email),
        emailOtp: otpResult.otp,
        emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    })
    return { ok: true, email, error: 'Verification code sent to your email.' }
  } catch (err) {
    console.error('signup error', err)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
}

// Verify OTP and complete registration
export async function verifyOtp(_: AuthState | undefined, formData: FormData) {
  const email = (formData.get('email')?.toString().toLowerCase() ?? '').trim()
  // Support both single 'otp' field and split 'otp0'-'otp5' fields
  const otpSingle = formData.get('otp')?.toString() ?? ''
  const otpParts = [
    formData.get('otp0')?.toString() ?? '',
    formData.get('otp1')?.toString() ?? '',
    formData.get('otp2')?.toString() ?? '',
    formData.get('otp3')?.toString() ?? '',
    formData.get('otp4')?.toString() ?? '',
    formData.get('otp5')?.toString() ?? '',
  ]
  const otp = otpSingle || otpParts.join('')

  const e = emailSchema.safeParse(email)
  if (!e.success) return { ok: false, error: 'Invalid email' }

  const o = otpSchema.safeParse(otp)
  if (!o.success) return { ok: false, error: 'Invalid OTP format' }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return { ok: false, error: 'User not found' }
    if (user.emailVerified) return { ok: false, error: 'Email already verified' }
    if (!user.emailOtp || !user.emailOtpExpires) return { ok: false, error: 'No OTP found. Request a new one.' }
    if (user.emailOtpExpires < new Date()) return { ok: false, error: 'OTP expired. Request a new one.' }
    if (user.emailOtp !== otp) return { ok: false, error: 'Invalid OTP' }

    // Verify successful
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailOtp: null,
        emailOtpExpires: null,
      },
    })
    await createSession(user.id, user.role)
    return { ok: true }
  } catch (err) {
    console.error('verifyOtp error', err)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
}

// Resend OTP
export async function resendOtp(_: AuthState | undefined, formData: FormData) {
  const email = (formData.get('email')?.toString().toLowerCase() ?? '').trim()
  const e = emailSchema.safeParse(email)
  if (!e.success) return { ok: false, error: 'Invalid email' }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return { ok: false, error: 'User not found' }
    if (user.emailVerified) return { ok: false, error: 'Email already verified' }

    const otpResult = await sendOtpEmail(email, user.name)
    if (!otpResult.sent) {
      return { ok: false, error: 'Could not send verification code.' }
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailOtp: otpResult.otp,
        emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    })
    return { ok: true, error: 'New verification code sent.' }
  } catch (err) {
    console.error('resendOtp error', err)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function login(_: AuthState | undefined, formData: FormData) {
  const email = (formData.get('email')?.toString().toLowerCase() ?? '').trim()
  const password = formData.get('password')?.toString() ?? ''

  const e = emailSchema.safeParse(email)
  if (!e.success) return { ok: false, error: e.error.format()._errors.join('; ') }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.password) return { ok: false, error: 'Invalid email or password' }
    if (!user.emailVerified) {
      // Auto-resend OTP if not verified
const otpResult = await sendOtpEmail(email, user.name ?? null)
      if (otpResult.sent) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailOtp: otpResult.otp,
            emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
          },
        })
      }
      return { ok: false, error: 'Email not verified. A new verification code has been sent.' }
    }
    const valid = await verifyPassword(password, user.password)
    if (!valid) return { ok: false, error: 'Invalid email or password' }
    await createSession(user.id, user.role)
  } catch (err) {
    console.error('login error', err)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
  redirect('/')
}

// Admin-only login. Only accepts emails in ADMIN_EMAILS; rejects everyone else
// with a generic error (no information leakage). Called from the obfuscated
// /admin/auth/[slug] page so the admin login surface is not publicly known.
export async function adminLogin(_: AuthState | undefined, formData: FormData) {
  const email = (formData.get('email')?.toString().toLowerCase() ?? '').trim()
  const password = formData.get('password')?.toString() ?? ''

  const e = emailSchema.safeParse(email)
  if (!e.success) return { ok: false, error: 'Invalid credentials' }

  if (!isAdminEmail(email)) {
    return { ok: false, error: 'Invalid credentials' }
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.password) return { ok: false, error: 'Invalid credentials' }
    if (!user.emailVerified) {
      return { ok: false, error: 'Admin email not verified. Please verify your email first.' }
    }
    const valid = await verifyPassword(password, user.password)
    if (!valid) return { ok: false, error: 'Invalid credentials' }
    if (user.role !== 'ADMIN') {
      return { ok: false, error: 'This account does not have admin access.' }
    }
    await createSession(user.id, user.role)
  } catch (err) {
    console.error('adminLogin error', err)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
  redirect('/admin')
}

export async function logout() {
  'use server'
  await destroySession()
  redirect('/login')
}