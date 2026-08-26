import * as feedbackService from '../services/feedback.service.js'
import AppError from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { isNonEmptyString } from '../utils/validators.js'
import { FEEDBACK_CATEGORIES } from '../constants/database.js'

export const submitFeedback = asyncHandler(async (req, res) => {
  const { category, message } = req.body
  if (!FEEDBACK_CATEGORIES.includes(category)) {
    throw new AppError(400, `category must be one of: ${FEEDBACK_CATEGORIES.join(', ')}`, 'VALIDATION_ERROR')
  }
  if (!isNonEmptyString(message, { min: 5, max: 2_000 })) {
    throw new AppError(400, 'message must be between 5 and 2000 characters.', 'VALIDATION_ERROR')
  }

  const feedback = await feedbackService.submitFeedback(req.user.id, { category, message })
  res.status(201).json({ data: { feedback }, message: 'Thanks for helping us grow.' })
})

export const getMyFeedback = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.listMyFeedback(req.user.id)
  res.status(200).json({ data: { feedback } })
})

export default { submitFeedback, getMyFeedback }