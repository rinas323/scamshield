'use server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/dal'
import { revalidatePath } from 'next/cache'

// Mark a single notification as read.
export async function markNotificationRead(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = formData.get('id')?.toString()
  if (!id) return
  try {
    await prisma.notification.update({ where: { id }, data: { read: true } })
    revalidatePath('/admin')
    revalidatePath('/admin/notifications')
  } catch (err) {
    console.error('markNotificationRead error', err)
  }
}

// Mark all unread notifications as read.
export async function markAllNotificationsRead(): Promise<void> {
  await requireAdmin()
  try {
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    })
    revalidatePath('/admin')
    revalidatePath('/admin/notifications')
  } catch (err) {
    console.error('markAllNotificationsRead error', err)
  }
}

// Delete a notification (admin dismiss).
export async function deleteNotification(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = formData.get('id')?.toString()
  if (!id) return
  try {
    await prisma.notification.delete({ where: { id } })
    revalidatePath('/admin')
    revalidatePath('/admin/notifications')
  } catch (err) {
    console.error('deleteNotification error', err)
  }
}
