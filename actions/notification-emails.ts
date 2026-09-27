'use server'

import { getAdminsWithEmailNotifications } from '@/lib/dal'
import { sendEmail, newReportEmailTemplate } from '@/lib/email'
import { APP_URL } from '@/lib/config'

// Called after creating a new notification to send emails to admins who opted in.
// Runs async in background (fire-and-forget) to not slow down the request.
export async function sendNotificationEmails(
  notification: {
    id: string
    type: string
    title: string
    body: string
    listingId: string | null
  }
): Promise<void> {
  if (notification.type !== 'NEW_REPORT') return

  try {
    const admins = await getAdminsWithEmailNotifications()
    if (admins.length === 0) return

    // Extract report details from notification
    // notification.title = "New report: <title>"
    // notification.body = "<company> · <scamType>"
    const titleMatch = notification.title.match(/^New report: (.+)$/)
    const reportTitle = titleMatch ? titleMatch[1] : 'Untitled report'
    const [company, scamType] = notification.body.split(' · ') ?? []

    const reportUrl = notification.listingId
      ? `${APP_URL}/admin/submissions#${notification.listingId}`
      : `${APP_URL}/admin/submissions`

    // Send emails in parallel (fire-and-forget)
    await Promise.all(
      admins.map(async (admin) => {
        const to = admin.notificationEmail ?? admin.email
        if (!to) return

        const { subject, html, text } = newReportEmailTemplate({
          adminName: admin.name ?? 'Admin',
          reportTitle,
          reportUrl,
          scamType: scamType ?? 'Unknown',
          company: company ?? null,
        })

        await sendEmail({ to, subject, html, text })
      })
    )
  } catch (err) {
    console.error('sendNotificationEmails error:', err)
  }
}