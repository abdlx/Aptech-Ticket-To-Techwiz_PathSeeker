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

const quizSnapshotOptionSchema = new Schema({ key: String, label: String, domainWeights: [{ domainId: { type: Schema.Types.ObjectId, ref: 'Domain' }, weight: Number }] }, { _id: false })
const quizSnapshotQuestionSchema = new Schema({ questionId: { type: Schema.Types.ObjectId, ref: 'QuizQuestion' }, version: Number, questionText: String, type: String, timeLimitSeconds: Number, options: { type: [quizSnapshotOptionSchema], default: [] } }, { _id: false })
const quizScoreBreakdownSchema = new Schema({ domainId: { type: Schema.Types.ObjectId, ref: 'Domain', required: true }, score: { type: Number, required: true }, percentage: { type: Number, min: 0, max: 100 } }, { _id: false })

const quizAttemptSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    answers: { type: [quizAnswerSchema], default: [] },
    quizVersion: { type: Number, min: 1, default: 1 },
    questionSnapshot: { type: [quizSnapshotQuestionSchema], default: [] },
    // Denormalized result fields keep dashboard/history reads fast without
    // re-running the authoritative scoring calculation on every read.
    archetype: { type: String, trim: true, maxlength: 100 },
    score: { type: Number, min: 0, max: 100 },
    topCareerId: { type: Schema.Types.ObjectId, ref: 'Career' },
    scoreBreakdown: { type: [quizScoreBreakdownSchema], default: [] },
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