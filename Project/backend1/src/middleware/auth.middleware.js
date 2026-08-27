import { env } from '../config/env.js'
import { User } from '../models/index.js'
import { findActiveSessionByRawToken } from '../services/session.service.js'
import AppError from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const rawToken = req.cookies?.[env.sessionCookieName]
  const session = await findActiveSessionByRawToken(rawToken)

  if (!session) {
    throw new AppError(401, 'You must be logged in to do that.', 'UNAUTHENTICATED')
  }

  const user = await User.findById(session.userId)
  if (!user || user.status !== 'active') {
    throw new AppError(401, 'You must be logged in to do that.', 'UNAUTHENTICATED')
  }

  req.user = { ...user.toJSON(), id: user._id.toString() }
  req.session = session
  next()
})

// Public assistant questions should work without a session, while profile-changing
// commands still need the same active user identity as protected endpoints.
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const rawToken = req.cookies?.[env.sessionCookieName]
  if (!rawToken) return next()

  const session = await findActiveSessionByRawToken(rawToken).catch(() => null)
  if (!session) return next()

  const user = await User.findById(session.userId)
  if (user?.status === 'active') {
    req.user = { ...user.toJSON(), id: user._id.toString() }
    req.session = session
  }
  return next()
})

export function requireRole(...allowedRoles) {
  return function checkRole(req, _res, next) {
    if (!req.user) {
      return next(new AppError(401, 'You must be logged in to do that.', 'UNAUTHENTICATED'))
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'You do not have permission to do that.', 'FORBIDDEN'))
    }
    return next()
  }
}

export default { optionalAuth, requireAuth, requireRole }
