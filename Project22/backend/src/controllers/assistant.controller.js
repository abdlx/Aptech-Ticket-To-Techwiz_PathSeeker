import * as assistantService from '../services/assistant.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { findActiveSessionByRawToken } from '../services/session.service.js'
import { User } from '../models/index.js'
import { env } from '../config/env.js'
import AppError from '../utils/AppError.js'

export const respond = asyncHandler(async (req, res) => {
  const text = String(req.body?.text || '').trim()
  if (!text || text.length > 500) throw new AppError(400, 'Voice text must be between 1 and 500 characters.', 'VALIDATION_ERROR')

  // Resolve session if user is logged in
  let user = null
  const rawToken = req.cookies?.[env.sessionCookieName]
  if (rawToken) {
    const session = await findActiveSessionByRawToken(rawToken).catch(() => null)
    if (session?.userId) {
      user = await User.findById(session.userId).catch(() => null)
    }
  }

  const result = await assistantService.respondToIntent(text, user)
  res.status(200).json({ data: result })
})

export default { respond }
