import crypto from 'node:crypto'

// Opaque session/reset-link tokens: random, URL-safe, sent to the client once.
// Only their SHA-256 hash is ever stored in MongoDB (Session.tokenHash,
// VerificationToken.tokenHash), matching the schemas already in src/models.
export function generateOpaqueToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url')
}

// Six-digit numeric code for email verification, matching the OTP input
// already built in frontend/src/pages/auth/verify-email.jsx.
export function generateNumericOtp(digits = 6) {
  const min = 10 ** (digits - 1)
  const max = 10 ** digits - 1
  return String(crypto.randomInt(min, max + 1))
}

export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex')
}

export default { generateOpaqueToken, generateNumericOtp, hashToken }