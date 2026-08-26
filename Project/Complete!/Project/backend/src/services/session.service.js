import { Session } from '../models/index.js'
import { env } from '../config/env.js'
import { generateOpaqueToken, hashToken } from '../utils/token.js'

export async function createSession(user, { ipAddress, userAgent } = {}) {
  const rawToken = generateOpaqueToken()
  const expiresAt = new Date(Date.now() + env.sessionTtlDays * 24 * 60 * 60 * 1000)

  await Session.create({
    userId: user._id,
    tokenHash: hashToken(rawToken),
    ipAddress,
    userAgent,
    expiresAt,
  })

  return { rawToken, expiresAt }
}

// Returns the active Session document (with userId populated) for a raw
// cookie token, or null if it does not exist, is revoked, or has expired.
export async function findActiveSessionByRawToken(rawToken) {
  if (!rawToken) return null

  const session = await Session.findOne({
    tokenHash: hashToken(rawToken),
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  })

  if (!session) return null

  session.lastUsedAt = new Date()
  await session.save()

  return session
}

export async function revokeSessionByRawToken(rawToken) {
  if (!rawToken) return
  await Session.updateOne(
    { tokenHash: hashToken(rawToken), revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } },
  )
}

// Used after a password reset so every other device is logged out.
export async function revokeAllSessionsForUser(userId) {
  await Session.updateMany(
    { userId, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } },
  )
}

export function sessionCookieOptions(expiresAt) {
  return {
    httpOnly: true,
    secure: env.sessionCookieSecure,
    sameSite: env.sessionCookieSameSite,
    expires: expiresAt,
    path: '/',
  }
}

export default {
  createSession,
  findActiveSessionByRawToken,
  revokeSessionByRawToken,
  revokeAllSessionsForUser,
  sessionCookieOptions,
}