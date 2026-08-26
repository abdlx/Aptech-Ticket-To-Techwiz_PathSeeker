import mongoose from 'mongoose'
import { QUIZ_ATTEMPT_STATUSES } from '../constants/database.js'

const { Schema } = mongoose

const quizAnswerSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'QuizQuestion', required: true },
    optionKey: { type: String, required: true, trim: true, maxlength: 20 },
  },
  { _id: false },
)

const quizAttemptSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    answers: { type: [quizAnswerSchema], default: [] },
    // Denormalized result fields so the dashboard/history list (see
    // frontendFixtures.quizAttempts in pathseekerApi.js) can be rendered
    // without re-computing scores on every read.
    archetype: { type: String, trim: true, maxlength: 100 },
    score: { type: Number, min: 0, max: 100 },
    topCareerId: { type: Schema.Types.ObjectId, ref: 'Career' },
    status: { type: String, required: true, enum: QUIZ_ATTEMPT_STATUSES, default: 'in_progress' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true, collection: 'quizAttempts' },
)

quizAttemptSchema.pre('validate', function requireCompletionFields() {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date()
  }
})

quizAttemptSchema.index({ userId: 1, createdAt: -1 })
quizAttemptSchema.index({ userId: 1, status: 1 })

export const QuizAttempt =
  mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', quizAttemptSchema)
export default QuizAttempt