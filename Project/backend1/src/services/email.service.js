import { env } from '../config/env.js'

// Single choke point for outgoing email. Local dev uses EMAIL_PROVIDER=console
// (logs instead of sending). Swap the 'console' branch for a real provider
// (SMTP/SendGrid/etc.) later without touching auth.service.js or any
// controller — they only ever call sendEmail().
async function sendViaConsole({ to, subject, text }) {
  console.log('\n===== EMAIL (console provider) =====')
  console.log(`From: ${env.emailFrom}`)
  console.log(`To: ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(text)
  console.log('=====================================\n')
}

export async function sendEmail({ to, subject, text }) {
  if (env.emailProvider === 'console') {
    return sendViaConsole({ to, subject, text })
  }

  throw new Error(
    `EMAIL_PROVIDER="${env.emailProvider}" is not implemented. Configure a real provider (SMTP/API) here before using it.`,
  )
}

export async function sendVerificationOtpEmail(user, otp) {
  return sendEmail({
    to: user.email,
    subject: 'Verify your PathSeeker email',
    text: `Hi ${user.name},\n\nYour PathSeeker verification code is: ${otp}\nIt expires in ${env.verificationOtpTtlMinutes} minutes.\n\nIf you did not request this, ignore this email.`,
  })
}

export async function sendPasswordResetEmail(user, rawToken) {
  return sendEmail({
    to: user.email,
    subject: 'Reset your PathSeeker password',
    text: `Hi ${user.name},\n\nUse this token to reset your password: ${rawToken}\nIt expires in ${env.passwordResetTtlMinutes} minutes.\n\nIf you did not request this, ignore this email.`,
  })
}

export default { sendEmail, sendVerificationOtpEmail, sendPasswordResetEmail }