import { env } from '../config/env.js'

async function sendViaConsole({ to, subject, text }) {
  console.log('\n===== EMAIL (console provider) =====')
  console.log(`From: ${env.emailFrom}`)
  console.log(`To: ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(text)
  console.log('=====================================\n')
}

async function sendViaHttpProvider({ to, subject, text }) {
  if (!env.emailApiKey) {
    throw new Error('EMAIL_API_KEY is required when EMAIL_PROVIDER is not console.')
  }
  const payload = {
    from: env.emailFrom,
    to: [to],
    subject,
    text,
    ...(env.emailReplyTo ? { reply_to: env.emailReplyTo } : {}),
  }
  const response = await fetch(env.emailApiUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.emailApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Email provider rejected the message (${response.status}). ${detail.slice(0, 300)}`)
  }
  return response.json().catch(() => ({}))
}

export async function sendEmail({ to, subject, text }) {
  if (env.emailProvider === 'console') return sendViaConsole({ to, subject, text })
  if (env.emailProvider === 'resend' || env.emailProvider === 'http') {
    return sendViaHttpProvider({ to, subject, text })
  }
  throw new Error(`Unsupported EMAIL_PROVIDER="${env.emailProvider}". Use console, resend, or http.`)
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
