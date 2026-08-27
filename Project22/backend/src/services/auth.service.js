import bcrypt from 'bcryptjs'
import { User, UserProfile, VerificationToken } from '../models/index.js'
import { env } from '../config/env.js'
import AppError from '../utils/AppError.js'
import { generateNumericOtp, generateOpaqueToken, hashToken } from '../utils/token.js'
import { sendPasswordResetEmail, sendVerificationOtpEmail } from './email.service.js'
import { getSettings } from './settings.service.js'

function toSafeUser(userDocument) {
  // Model's toJSON transform already strips passwordHash/normalizedEmail/deletedAt.
  return userDocument.toJSON ? userDocument.toJSON() : userDocument
}

async function issueEmailVerificationOtp(user) {
  const otp = generateNumericOtp(6)
  const expiresAt = new Date(Date.now() + env.verificationOtpTtlMinutes * 60 * 1000)

  await VerificationToken.create({
    userId: user._id,
    purpose: 'email_verification',
    tokenHash: hashToken(otp),
    expiresAt,
  })

  await sendVerificationOtpEmail(user, otp)
}

export async function registerUser({ name, email, password, stage, termsAccepted }) {
  const settings = await getSettings()
  if (settings.allowNewRegistrations === false) throw new AppError(403, 'New registrations are temporarily disabled.', 'REGISTRATION_DISABLED')
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
    termsAcceptedAt: termsAccepted ? new Date() : undefined,
  })

  await UserProfile.create({ userId: user._id })

  await issueEmailVerificationOtp(user)

  return toSafeUser(user)
}

export async function resendVerificationOtp(email) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await User.findOne({ normalizedEmail })

  // Do not reveal whether the account exists.
  if (!user || user.emailVerified) return

  await issueEmailVerificationOtp(user)
}

export async function verifyEmailOtp({ email, code }) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await User.findOne({ normalizedEmail })

  if (!user) {
    throw new AppError(400, 'Invalid email or verification code.', 'INVALID_CODE')
  }

  if (user.emailVerified) {
    return toSafeUser(user)
  }

  const token = await VerificationToken.findOne({
    userId: user._id,
    purpose: 'email_verification',
    usedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .select('+tokenHash')

  if (!token) {
    throw new AppError(400, 'This code has expired. Request a new one.', 'CODE_EXPIRED')
  }

  if (token.attempts >= 10) {
    throw new AppError(429, 'Too many attempts. Request a new code.', 'TOO_MANY_ATTEMPTS')
  }

  if (token.tokenHash !== hashToken(code)) {
    token.attempts += 1
    await token.save()
    throw new AppError(400, 'Invalid email or verification code.', 'INVALID_CODE')
  }

  token.usedAt = new Date()
  await token.save()

  user.emailVerified = true
  user.emailVerifiedAt = new Date()
  await user.save()

  return toSafeUser(user)
}

export async function verifyCredentials(email, password) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await User.findOne({ normalizedEmail }).select('+passwordHash')

  if (!user) {
    throw new AppError(401, 'Incorrect email or password.', 'INVALID_CREDENTIALS')
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatches) {
    throw new AppError(401, 'Incorrect email or password.', 'INVALID_CREDENTIALS')
  }

  if (user.status !== 'active') {
    throw new AppError(403, 'This account is not active.', 'ACCOUNT_INACTIVE')
  }

  if (!user.emailVerified) {
    throw new AppError(403, 'Please verify your email before logging in.', 'EMAIL_NOT_VERIFIED')
  }

  user.lastLoginAt = new Date()
  await user.save()

  return toSafeUser(user)
}

export async function forgotPassword(email) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await User.findOne({ normalizedEmail })

  // Always behave the same way whether or not the account exists.
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
  const tokenHash = hashToken(token)

  const verificationToken = await VerificationToken.findOne({
    purpose: 'password_reset',
    tokenHash,
    usedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  })

  if (!verificationToken) {
    throw new AppError(400, 'This reset link is invalid or has expired.', 'INVALID_RESET_TOKEN')
  }

  const user = await User.findById(verificationToken.userId)
  if (!user) {
    throw new AppError(400, 'This reset link is invalid or has expired.', 'INVALID_RESET_TOKEN')
  }

  user.passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds)
  await user.save()

  verificationToken.usedAt = new Date()
  await verificationToken.save()

  return user
}

export default {
  registerUser,
  resendVerificationOtp,
  verifyEmailOtp,
  verifyCredentials,
  forgotPassword,
  resetPassword,
}