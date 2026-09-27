import { APP_NAME, APP_URL } from '@/lib/config'

// Generate 6-digit OTP
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Template for OTP email
export function otpEmailTemplate({
  otp,
  name,
}: {
  otp: string
  name: string | null
}): { subject: string; html: string; text: string } {
  const subject = `Your ${APP_NAME} verification code: ${otp}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="margin: 0; color: white; font-size: 20px;">${APP_NAME} - Verify your email</h1>
  </div>
  <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin: 0 0 16px;">Hi ${name ?? 'there'},</p>
    <p style="margin: 0 0 16px;">Welcome to ${APP_NAME}! Please use the verification code below to complete your registration.</p>
    <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 16px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Your verification code</p>
      <p style="margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #4f46e5; font-family: monospace;">${otp}</p>
    </div>
    <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">
      This code expires in <strong>10 minutes</strong>. If you didn't request this, please ignore this email.
    </p>
    <p style="margin: 24px 0 0; font-size: 12px; color: #6b7280;">
      - The ${APP_NAME} Team
    </p>
  </div>
</body>
</html>`

  const text = `
${APP_NAME} - Verify your email

Hi ${name ?? 'there'},

Welcome to ${APP_NAME}! Please use the verification code below to complete your registration.

Your verification code: ${otp}

This code expires in 10 minutes. If you didn't request this, please ignore this email.

- The ${APP_NAME} Team
`

  return { subject, html, text }
}

// Template for new report notification (admin emails)
export function newReportEmailTemplate({
  adminName,
  reportTitle,
  reportUrl,
  scamType,
  company,
}: {
  adminName: string
  reportTitle: string
  reportUrl: string
  scamType: string
  company: string | null
}): { subject: string; html: string; text: string } {
  const subject = `New scam report awaiting review: ${reportTitle}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="margin: 0; color: white; font-size: 20px;">${APP_NAME} - New Report</h1>
  </div>
  <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin: 0 0 16px;">Hi ${adminName},</p>
    <p style="margin: 0 0 16px;">A new scam report has been submitted and is awaiting your review.</p>
    <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 16px;">
      <p style="margin: 0 0 8px;"><strong>Title:</strong> ${reportTitle}</p>
      <p style="margin: 0 0 8px;"><strong>Type:</strong> ${scamType.replace(/_/g, ' ').toLowerCase()}</p>
      ${company ? `<p style="margin: 0 0 8px;"><strong>Company:</strong> ${company}</p>` : ''}
      <p style="margin: 0;"><strong>Status:</strong> <span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">PENDING REVIEW</span></p>
    </div>
    <p style="margin: 24px 0 8px;">
      <a href="${reportUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Review this report
      </a>
    </p>
    <p style="margin: 24px 0 0; font-size: 12px; color: #6b7280;">
      You received this because you enabled email notifications in your admin settings.
      <br>
      <a href="${APP_URL}/admin/notifications" style="color: #4f46e5;">Manage notification preferences</a>
    </p>
  </div>
</body>
</html>`

  const text = `
${APP_NAME} - New Report

Hi ${adminName},

A new scam report has been submitted and is awaiting your review.

Title: ${reportTitle}
Type: ${scamType.replace(/_/g, ' ').toLowerCase()}
${company ? `Company: ${company}` : ''}
Status: PENDING REVIEW

Review this report: ${reportUrl}

You received this because you enabled email notifications in your admin settings.
Manage notification preferences: ${APP_URL}/admin/notifications
`

  return { subject, html, text }
}