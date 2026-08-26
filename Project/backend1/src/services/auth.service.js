import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { User, UserProfile, VerificationToken } from '../models/index.js'
import { env } from '../config/env.js'
import AppError from '../utils/AppError.js'
import { generateOpaqueToken, hashToken } from '../utils/token.js'
import { sendEmailVerificationOtp, sendPasswordResetEmail } from './email.service.js'
import { getSettings } from './settings.service.js'

function toSafeUser(userDocument) {
  return userDocument.toJSON ? userDocument.toJSON() : userDocument
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

async function createAndSendVerificationOtp(user) {
  const otp = crypto.randomInt(100000, 1000000).toString()
  const expiresAt = new Date(Date.now() + env.emailVerificationTtlMinutes * 60 * 1000)

  await VerificationToken.deleteMany({ userId: user._id, purpose: 'email_verification' })
  await VerificationToken.create({
    userId: user._id,
    purpose: 'email_verification',
    otpHash: hashOtp(otp),
    expiresAt,
  })
  await sendEmailVerificationOtp(user, otp)
}

export async function registerUser({ name, email, password, stage }) {
  const settings = await getSettings()
  if (!settings.allowNewRegistrations) {
    throw new AppError(403, 'New registrations are currently paused.', 'REGISTRATION_DISABLED')
  }
  const normalizedEmail = email.trim().toLowerCase()
  const existing = await User.findOne({ normalizedEmail })
  if (existing) {
    throw new AppError(409, 'An account with this email already exists.', 'EMAIL_IN_USE')
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds)
  const user = await User.create({
    name,
    email: normalizedEmail,
    normalizedEmail,
    passwordHash,
    role: 'user',
    stage,
    emailVerified: false,
  })

  try {
    await UserProfile.create({ userId: user._id })
  } catch (error) {
    await User.deleteOne({ _id: user._id })
    throw error
  }

  await createAndSendVerificationOtp(user)
  return toSafeUser(user)
}

export async function verifyEmail({ email, otp }) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await User.findOne({ normalizedEmail })
  if (!user) throw new AppError(400, 'Invalid OTP.', 'INVALID_OTP')
  if (user.emailVerified) return toSafeUser(user)

  const record = await VerificationToken.findOne({
    userId: user._id,
    purpose: 'email_verification',
  }).sort({ createdAt: -1 }).select('+otpHash')

  if (!record) throw new AppError(400, 'Invalid OTP.', 'INVALID_OTP')
  if (record.expiresAt <= new Date()) {
    await VerificationToken.deleteOne({ _id: record._id })
    throw new AppError(400, 'OTP expired.', 'OTP_EXPIRED')
  }
  if (record.attempts >= env.emailVerificationMaxAttempts) {
    throw new AppError(429, 'Maximum OTP attempts reached. Request a new code.', 'OTP_ATTEMPTS_EXCEEDED')
  }

  const submittedHash = hashOtp(otp)
  const matches = crypto.timingSafeEqual(Buffer.from(submittedHash), Buffer.from(record.otpHash))
  if (!matches) {
    record.attempts += 1
    await record.save()
    if (record.attempts >= env.emailVerificationMaxAttempts) {
      throw new AppError(429, 'Maximum OTP attempts reached. Request a new code.', 'OTP_ATTEMPTS_EXCEEDED')
    }
    throw new AppError(400, 'Invalid OTP.', 'INVALID_OTP')
  }

  user.emailVerified = true
  user.emailVerifiedAt = new Date()
  await user.save()
  await VerificationToken.deleteOne({ _id: record._id })
  return toSafeUser(user)
}

export async function resendVerification(email) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await User.findOne({ normalizedEmail })
  if (!user) throw new AppError(404, 'Account not found.', 'ACCOUNT_NOT_FOUND')
  if (user.emailVerified) throw new AppError(409, 'Email is already verified.', 'EMAIL_ALREADY_VERIFIED')

  const current = await VerificationToken.findOne({
    userId: user._id,
    purpose: 'email_verification',
  }).sort({ createdAt: -1 })
  const cooldownMs = env.emailVerificationResendCooldownSeconds * 1000
  const elapsedMs = current ? Date.now() - current.createdAt.getTime() : cooldownMs
  if (elapsedMs < cooldownMs) {
    const retryAfter = Math.ceil((cooldownMs - elapsedMs) / 1000)
    throw new AppError(429, `Please wait ${retryAfter} seconds before requesting another code.`, 'OTP_RESEND_COOLDOWN')
  }

  await createAndSendVerificationOtp(user)
}

export async function verifyCredentials(email, password) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await User.findOne({ normalizedEmail }).select('+passwordHash')
  if (!user) throw new AppError(401, 'Incorrect email or password.', 'INVALID_CREDENTIALS')

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatches) throw new AppError(401, 'Incorrect email or password.', 'INVALID_CREDENTIALS')
  if (user.status !== 'active') throw new AppError(403, 'This account is not active.', 'ACCOUNT_INACTIVE')
  if (user.role === 'user' && !user.emailVerified) {
    throw new AppError(403, 'Verify your email before logging in.', 'EMAIL_NOT_VERIFIED')
  }

  user.lastLoginAt = new Date()
  await user.save()
  return toSafeUser(user)
}

export async function forgotPassword(email) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await User.findOne({ normalizedEmail })
  if (!user) return

  const rawToken = generateOpaqueToken()
  const expiresAt = new Date(Date.now() + env.passwordResetTtlMinutes * 60 * 1000)
  await VerificationToken.create({
    userId: user._id,
    purpose: 'password_reset',
    tokenHash: hashToken(rawToken),
    expiresAt,
  })
  await sendPasswordResetEmail(user, rawToken)
}

export async function resetPassword({ token, password }) {
  const verificationToken = await VerificationToken.findOne({
    purpose: 'password_reset',
    tokenHash: hashToken(token),
    usedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  })
  if (!verificationToken) {
    throw new AppError(400, 'This reset link is invalid or has expired.', 'INVALID_RESET_TOKEN')
  }

  const user = await User.findById(verificationToken.userId)
  if (!user) throw new AppError(400, 'This reset link is invalid or has expired.', 'INVALID_RESET_TOKEN')

  user.passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds)
  await user.save()
  verificationToken.usedAt = new Date()
  await verificationToken.save()
  return user
}

export default {
  registerUser,
  verifyEmail,
  resendVerification,
  verifyCredentials,
  forgotPassword,
  resetPassword,
}
