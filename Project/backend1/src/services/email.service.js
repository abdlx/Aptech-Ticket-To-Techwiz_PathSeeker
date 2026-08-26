import { env } from '../config/env.js'
import { Resend } from 'resend'

let resendClient

// Single choke point for outgoing email. Local dev uses EMAIL_PROVIDER=console
// (logs instead of sending). Swap the 'console' branch for a real provider
// (SMTP/SendGrid/etc.) later without touching auth.service.js or any
// controller — they only ever call sendEmail().
async function sendViaConsole({ to, subject, text, html }) {
  console.log('\n===== EMAIL (console provider) =====')
  console.log(`From: ${env.emailFrom}`)
  console.log(`To: ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(text || html)
  console.log('=====================================\n')
}

export async function sendEmail({ to, subject, text, html }) {
  if (env.emailProvider === 'console') {
    return sendViaConsole({ to, subject, text, html })
  }

  if (env.emailProvider === 'resend') {
    resendClient ||= new Resend(env.resendApiKey)
    const { data, error } = await resendClient.emails.send({ from: env.emailFrom, to, subject, text, html })
    if (error) throw new Error(`Resend email delivery failed: ${error.message}`)
    return data
  }

  throw new Error(
    `EMAIL_PROVIDER="${env.emailProvider}" is not implemented. Configure a real provider (SMTP/API) here before using it.`,
  )
}

export async function sendEmailVerificationOtp(user, otp) {
  return sendEmail({
    to: user.email,
    subject: 'Verify your PathSeeker account',
    text: `Hi ${user.name},\n\nYour PathSeeker verification code is ${otp}. It expires in ${env.emailVerificationTtlMinutes} minutes.`,
    html: `
      <h2>Your verification code</h2>
      <p style="font-size:32px;font-weight:bold;letter-spacing:4px">${otp}</p>
      <p>This code expires in ${env.emailVerificationTtlMinutes} minutes.</p>
    `,
  })
}

export async function sendPasswordResetEmail(user, rawToken) {
  return sendEmail({
    to: user.email,
    subject: 'Reset your PathSeeker password',
    text: `Hi ${user.name},\n\nUse this token to reset your password: ${rawToken}\nIt expires in ${env.passwordResetTtlMinutes} minutes.\n\nIf you did not request this, ignore this email.`,
  })
}

export default { sendEmail, sendEmailVerificationOtp, sendPasswordResetEmail }
