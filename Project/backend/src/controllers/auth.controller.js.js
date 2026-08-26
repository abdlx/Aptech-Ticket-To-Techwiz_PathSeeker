import { env } from '../config/env.js'
import * as authService from '../services/auth.service.js'
import { createSession, revokeSessionByRawToken, sessionCookieOptions } from '../services/session.service.js'
import { revokeAllSessionsForUser } from '../services/session.service.js'
import AppError from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { isNonEmptyString, isValidEmail, isValidOtp, isValidPassword, isValidStage } from '../utils/validators.js'

const STAFF_ROLES = ['content_editor', 'support_manager', 'admin', 'super_admin']

async function issueSessionCookie(res, user, req) {
  const { rawToken, expiresAt } = await createSession(user, {
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  })
  res.cookie(env.sessionCookieName, rawToken, sessionCookieOptions(expiresAt))
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, stage } = req.body

  if (!isNonEmptyString(name, { min: 2, max: 120 })) {
    throw new AppError(400, 'Full name must be between 2 and 120 characters.', 'VALIDATION_ERROR')
  }
  if (!isValidEmail(email)) {
    throw new AppError(400, 'Enter a valid email address.', 'VALIDATION_ERROR')
  }
  if (!isValidPassword(password)) {
    throw new AppError(
      400,
      'Password must be at least 8 characters and include an uppercase letter, a number, and a special character.',
      'VALIDATION_ERROR',
    )
  }
  if (!isValidStage(stage)) {
    throw new AppError(400, 'Stage must be one of: student, graduate, professional.', 'VALIDATION_ERROR')
  }

  const user = await authService.registerUser({ name: name.trim(), email, password, stage })

  res.status(201).json({
    data: { user },
    message: 'Account created. Check your email for a verification code.',
  })
})

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body

  if (!isValidEmail(email) || !isValidOtp(code)) {
    throw new AppError(400, 'A valid email and 6-digit code are required.', 'VALIDATION_ERROR')
  }

  const user = await authService.verifyEmailOtp({ email, code })
  await issueSessionCookie(res, user, req)

  res.status(200).json({ data: { user }, message: 'Email verified.' })
})

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!isValidEmail(email)) {
    throw new AppError(400, 'Enter a valid email address.', 'VALIDATION_ERROR')
  }

  await authService.resendVerificationOtp(email)

  res.status(200).json({ data: null, message: 'If that account exists, a new code has been sent.' })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!isValidEmail(email) || !isNonEmptyString(password, { min: 1, max: 200 })) {
    throw new AppError(400, 'Email and password are required.', 'VALIDATION_ERROR')
  }

  const user = await authService.verifyCredentials(email, password)
  await issueSessionCookie(res, user, req)

  res.status(200).json({ data: { user }, message: 'Logged in.' })
})

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!isValidEmail(email) || !isNonEmptyString(password, { min: 1, max: 200 })) {
    throw new AppError(400, 'Email and password are required.', 'VALIDATION_ERROR')
  }

  const user = await authService.verifyCredentials(email, password)

  if (!STAFF_ROLES.includes(user.role)) {
    throw new AppError(403, 'This account does not have admin access.', 'NOT_ADMIN')
  }

  await issueSessionCookie(res, user, req)

  res.status(200).json({ data: { user }, message: 'Logged in.' })
})

export const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.[env.sessionCookieName]
  await revokeSessionByRawToken(rawToken)
  res.clearCookie(env.sessionCookieName, { path: '/' })
  res.status(200).json({ data: null, message: 'Logged out.' })
})

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({ data: { user: req.user } })
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!isValidEmail(email)) {
    throw new AppError(400, 'Enter a valid email address.', 'VALIDATION_ERROR')
  }

  await authService.forgotPassword(email)

  res.status(200).json({
    data: null,
    message: 'If that email is registered, a reset link has been sent.',
  })
})

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body
  if (!isNonEmptyString(token, { min: 10, max: 500 })) {
    throw new AppError(400, 'A valid reset token is required.', 'VALIDATION_ERROR')
  }
  if (!isValidPassword(password)) {
    throw new AppError(
      400,
      'Password must be at least 8 characters and include an uppercase letter, a number, and a special character.',
      'VALIDATION_ERROR',
    )
  }

  const user = await authService.resetPassword({ token, password })
  await revokeAllSessionsForUser(user._id)

  res.status(200).json({ data: null, message: 'Password updated. Please log in again.' })
})

export default {
  register,
  verifyEmail,
  resendVerification,
  login,
  adminLogin,
  logout,
  me,
  forgotPassword,
  resetPassword,
}