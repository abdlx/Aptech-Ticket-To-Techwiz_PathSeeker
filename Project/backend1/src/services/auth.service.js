import bcrypt from 'bcryptjs'
import { User, UserProfile, VerificationToken } from '../models/index.js'
import { env } from '../config/env.js'
import AppError from '../utils/AppError.js'
import { generateOpaqueToken, hashToken } from '../utils/token.js'
import { sendPasswordResetEmail } from './email.service.js'
import { getSettings } from './settings.service.js'

function toSafeUser(userDocument) {
  // Model's toJSON transform already strips passwordHash/normalizedEmail/deletedAt.
  return userDocument.toJSON ? userDocument.toJSON() : userDocument
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
    emailVerified: true,
    emailVerifiedAt: new Date(),
  })

  try {
    await UserProfile.create({ userId: user._id })
  } catch (error) {
    await User.deleteOne({ _id: user._id })
    throw error
  }

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
  verifyCredentials,
  forgotPassword,
  resetPassword,
}
