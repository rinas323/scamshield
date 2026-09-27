'use server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/dal'
import { revalidatePath } from 'next/cache'

export async function updateEmailNotifications(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  const emailNotifications = formData.get('emailNotifications') === 'on'
  const notificationEmail = formData.get('notificationEmail')?.toString().trim() || null

  await prisma.user.update({
    where: { id: admin.id },
    data: {
      emailNotifications,
      notificationEmail,
    },
  })
  revalidatePath('/admin/settings')
}