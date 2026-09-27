'use server'

import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { APP_NAME, APP_URL } from '@/lib/config'
import { otpEmailTemplate, newReportEmailTemplate, generateOtp } from '@/lib/email-templates'

// Email configuration - expects these env vars in production:
// EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
// For local dev without real SMTP, we log emails instead of sending.
// Set EMAIL_TEST_MODE=true to always print OTP to console instead of sending.

const isDev = process.env.NODE_ENV !== 'production'
const emailEnabled = Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS)
const testMode = process.env.EMAIL_TEST_MODE === 'true'

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (!transporter && emailEnabled) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST!,
      port: Number(process.env.EMAIL_PORT ?? 587),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    })
  }
  return transporter!
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}): Promise<{ sent: boolean; messageId?: string; error?: string }> {
  const from = process.env.EMAIL_FROM ?? `${APP_NAME} <noreply@${new URL(APP_URL).hostname}>`

  // Test mode: always print to console, never send
  if (testMode || (isDev && !emailEnabled)) {
    console.log('[EMAIL TEST MODE]', { to, subject, html: html.slice(0, 500) + '...' })
    return { sent: true, messageId: 'test-mode' }
  }

  try {
    const info = await getTransporter().sendMail({
      from,
      to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]+>/g, '').slice(0, 500),
    })
    return { sent: true, messageId: info.messageId }
  } catch (err) {
    console.error('Email send failed:', err)
    return { sent: false, error: (err as Error).message }
  }
}

// Send OTP email
export async function sendOtpEmail(
  email: string,
  name: string | null
): Promise<{ sent: boolean; otp: string; error?: string }> {
  const otp = generateOtp()
  const { subject, html, text } = otpEmailTemplate({ otp, name })
  const result = await sendEmail({ to: email, subject, html, text })
  if (!result.sent) {
    return { sent: false, otp, error: result.error }
  }
  return { sent: true, otp }
}

// Re-export for other modules
export { generateOtp, otpEmailTemplate, newReportEmailTemplate }