import * as assistantService from '../services/assistant.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import AppError from '../utils/AppError.js'

export const respond = asyncHandler(async (req, res) => {
  const text = String(req.body?.text || '').trim()
  if (!text || text.length > 500) {
    throw new AppError(400, 'Voice text must be between 1 and 500 characters.', 'VALIDATION_ERROR')
  }
  const result = await assistantService.respondToIntent(text, req.user)
  res.status(200).json({ data: result })
})

export default { respond }
