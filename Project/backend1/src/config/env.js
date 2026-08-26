import 'dotenv/config'

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toBool(value, fallback) {
  if (value === undefined) return fallback
  return value === 'true'
}

function toList(value, fallback) {
  if (!value) return fallback
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 4000),

  mongodbUri: process.env.MONGODB_URI,
  mongodbDbName: process.env.MONGODB_DB_NAME,

  frontendOrigins: toList(process.env.FRONTEND_ORIGIN, ['http://localhost:5173']),

  sessionCookieName: process.env.SESSION_COOKIE_NAME || 'ps_session',
  sessionTtlDays: toInt(process.env.SESSION_TTL_DAYS, 30),
  sessionCookieSecure: toBool(process.env.SESSION_COOKIE_SECURE, process.env.NODE_ENV === 'production'),
  sessionCookieSameSite: process.env.SESSION_COOKIE_SAMESITE || 'lax',

  bcryptSaltRounds: toInt(process.env.BCRYPT_SALT_ROUNDS, 12),

  emailProvider: process.env.EMAIL_PROVIDER || 'console',
  emailFrom: process.env.EMAIL_FROM || 'no-reply@pathseeker.local',

  passwordResetTtlMinutes: toInt(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES, 20),

  rateLimitWindowMinutes: toInt(process.env.AUTH_RATE_LIMIT_WINDOW_MINUTES, 15),
  rateLimitMaxAttempts: toInt(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS, 20),
}

// Fail fast on boot if a genuinely required variable is missing. Values with
// safe defaults above are intentionally not required here.
export function assertRequiredEnv() {
  const missing = []
  if (!env.mongodbUri) missing.push('MONGODB_URI')
  if (!env.mongodbDbName) missing.push('MONGODB_DB_NAME')

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

export default env
