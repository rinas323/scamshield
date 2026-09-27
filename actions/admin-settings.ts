'use server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/dal'
import { revalidatePath } from 'next/cache'

export interface UpdateEmailNotificationsState {
  ok: boolean
  error?: string
}

export async function updateEmailNotifications(_: UpdateEmailNotificationsState | undefined, formData: FormData): Promise<UpdateEmailNotificationsState> {
  const admin = await requireAdmin()
  const emailNotifications = formData.get('emailNotifications') === 'on'
  const notificationEmail = formData.get('notificationEmail')?.toString().trim() || null

  try {
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        emailNotifications,
        notificationEmail,
      },
    })
    revalidatePath('/admin/settings')
    return { ok: true }
  } catch (err) {
    console.error('updateEmailNotifications error', err)
    return { ok: false, error: 'Failed to update preferences' }
  }
}