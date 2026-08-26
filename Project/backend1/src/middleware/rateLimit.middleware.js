import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

// Applied to sensitive auth routes (login, register, forgot-password, etc.)
// to slow down brute-force/credential-stuffing attempts, per the SRS
// non-functional "Security" requirement.
export const authRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMinutes * 60 * 1000,
  max: env.rateLimitMaxAttempts,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.', code: 'RATE_LIMITED' },
})

export const assistantRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many assistant requests. Please try again shortly.', code: 'RATE_LIMITED' },
})

export default authRateLimiter