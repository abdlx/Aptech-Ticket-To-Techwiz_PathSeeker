import { env } from '../config/env.js'
import AppError from '../utils/AppError.js'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export function csrfOriginGuard(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) return next()
  const origin = req.get('origin')
  if (!origin) return next() // Non-browser clients do not send Origin; cookie auth still requires the session.
  if (!env.frontendOrigins.includes(origin)) {
    return next(new AppError(403, 'Request origin is not allowed.', 'CSRF_ORIGIN_REJECTED'))
  }
  return next()
}

export default { csrfOriginGuard }
