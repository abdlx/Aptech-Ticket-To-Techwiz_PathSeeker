import crypto from 'node:crypto'

// Opaque session/reset-link tokens: random, URL-safe, sent to the client once.
// Only their SHA-256 hash is ever stored in MongoDB (Session.tokenHash,
// VerificationToken.tokenHash), matching the schemas already in src/models.
export function generateOpaqueToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url')
}

export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex')
}

export default { generateOpaqueToken, hashToken }
