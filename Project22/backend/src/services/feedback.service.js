import { Feedback } from '../models/index.js'
import { stripHtml } from '../utils/sanitize.js'

export async function submitFeedback(userId, { category, message, rating, context, contactConsent }) {
  return Feedback.create({ userId, category, message: stripHtml(message).slice(0, 2000), rating, context: stripHtml(context || '').slice(0, 1000), contactConsent })
}

export async function listMyFeedback(userId) {
  return Feedback.find({ userId }).sort({ createdAt: -1 })
}

export default { submitFeedback, listMyFeedback }