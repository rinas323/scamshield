'use server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/dal'
import { revalidatePath } from 'next/cache'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'
import { sendOtpEmail } from '@/lib/email'

// Promote an existing user to ADMIN
export async function promoteToAdmin(formData: FormData): Promise<void> {
  await requireAdmin()
  const userId = formData.get('userId')?.toString()
  if (!userId) return

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.role === 'ADMIN') return

  await prisma.user.update({
    where: { id: userId },
    data: { role: 'ADMIN' },
  })
  revalidatePath('/admin/settings')
}

// Demote an admin back to USER (cannot demote yourself)
export async function demoteFromAdmin(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  const userId = formData.get('userId')?.toString()
  if (!userId || userId === admin.id) return

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.role !== 'ADMIN') return

  await prisma.user.update({
    where: { id: userId },
    data: { role: 'USER' },
  })
  revalidatePath('/admin/settings')
}

// Create a new admin user directly (invite flow)
const createAdminSchema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().min(2, 'Name required'),
  password: z.string().min(8, 'Password must be 8+ chars').optional().or(z.literal('')),
})

export async function createAdminUser(formData: FormData): Promise<void> {
  await requireAdmin()
  const parsed = createAdminSchema.safeParse({
    email: formData.get('email')?.toString().toLowerCase().trim(),
    name: formData.get('name')?.toString().trim(),
    password: formData.get('password')?.toString() || '',
  })
  if (!parsed.success) return

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) return

  const passwordHash = parsed.data.password ? await hashPassword(parsed.data.password) : null

  // If password provided, user can log in immediately after email verification
  // If no password, they'll need to use "Forgot password" or we send OTP
  const otpResult = await sendOtpEmail(parsed.data.email, parsed.data.name)

  await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      password: passwordHash,
      role: 'ADMIN',
      emailNotifications: true,
      emailOtp: otpResult.sent ? otpResult.otp : null,
      emailOtpExpires: otpResult.sent ? new Date(Date.now() + 10 * 60 * 1000) : null,
    },
  })
  revalidatePath('/admin/settings')
}