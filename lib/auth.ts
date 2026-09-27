import 'server-only'
import { jwtVerify, SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { COOKIE_NAME, AUTH_SECRET } from '@/lib/config'

if (!AUTH_SECRET || AUTH_SECRET.length < 32) {
  throw new Error(
    'AUTH_SECRET must be set to a value of at least 32 characters (e.g. `openssl rand -base64 32`).'
  )
}

const secret = new TextEncoder().encode(AUTH_SECRET)
const SESSION_MAX_AGE_DAYS = 30
const ONE_DAY = 24 * 60 * 60 * 1000

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(
  userId: string,
  role: string
): Promise<void> {
  const token = await new SignJWT({ uid: userId, rol: role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_DAYS}d`)
    .sign(secret)

  const expires = new Date(Date.now() + SESSION_MAX_AGE_DAYS * ONE_DAY)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
    maxAge: Math.floor((expires.getTime() - Date.now()) / 1000),
    path: '/',
  })
}

export interface SessionPayload {
  uid: string
  rol: string
}

export async function getSessionToken(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    })
    return {
      uid: payload.uid as string,
      rol: (payload.rol as string) ?? 'USER',
    }
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  ;(await cookies()).delete(COOKIE_NAME)
}
