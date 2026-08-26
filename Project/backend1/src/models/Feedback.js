import mongoose from 'mongoose'
import { FEEDBACK_CATEGORIES, FEEDBACK_STATUSES } from '../constants/database.js'

const { Schema } = mongoose

const feedbackSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    category: { type: String, required: true, enum: FEEDBACK_CATEGORIES },
    message: { type: String, required: true, trim: true, maxlength: 2_000 },
    status: { type: String, required: true, enum: FEEDBACK_STATUSES, default: 'open' },
    response: { type: String, trim: true, maxlength: 2_000 },
    respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    respondedAt: { type: Date },
  },
  { timestamps: true, collection: 'feedback' },
)

feedbackSchema.pre('validate', function requireResponseFields() {
  if (this.response && !this.respondedAt) {
    this.respondedAt = new Date()
  }
})

feedbackSchema.index({ status: 1, category: 1, createdAt: -1 })
feedbackSchema.index({ userId: 1, createdAt: -1 })

export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema)
export default Feedback