import { Feedback } from '../models/index.js'

export async function submitFeedback(userId, { category, message }) {
  return Feedback.create({ userId, category, message })
}

export async function listMyFeedback(userId) {
  return Feedback.find({ userId }).sort({ createdAt: -1 })
}

export default { submitFeedback, listMyFeedback }