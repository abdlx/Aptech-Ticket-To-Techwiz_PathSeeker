import { Session, User } from '../models/index.js'
import { hashToken } from '../utils/token.js'
import { AppError } from '../utils/appError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'ps_session'

export const requireAuth = asyncHandler(async (req, res, next) => {
  const rawToken = req.cookies?.[SESSION_COOKIE_NAME]

  if (!rawToken) {
    throw new AppError('Login is required for this action.', 401)
  }

  const tokenHash = hashToken(rawToken)

  const session = await Session.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).select('+tokenHash')

  if (!session) {
    throw new AppError('Your session is invalid or has expired.', 401)
  }

  const user = await User.findById(session.userId)

  if (!user || user.status !== 'active') {
    throw new AppError('This account is not available.', 401)
  }

  session.lastUsedAt = new Date()
  await session.save()

  req.user = user
  req.session = session
  next()
})

export function requireRole(...allowedRoles) {
  return function checkRole(req, res, next) {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403))
    }
    next()
  }
}