import mongoose from 'mongoose'
import { QUIZ_ATTEMPT_STATUSES } from '../constants/database.js'

const { Schema } = mongoose

const quizAnswerSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'QuizQuestion' },
    questionKey: { type: String, trim: true, maxlength: 50 },
    optionKey: { type: String, required: true, trim: true, maxlength: 20 },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

quizAnswerSchema.pre('validate', function requireQuestionReference() {
  if (!this.questionId && !this.questionKey) this.invalidate('questionKey', 'An answer requires a question reference.')
})

const questionSnapshotSchema = new Schema({
  key: { type: String, required: true },
  questionText: { type: String, required: true },
  type: { type: String, required: true },
  order: { type: Number, required: true },
  timeLimitSeconds: { type: Number },
  options: { type: [{
    key: { type: String, required: true },
    label: { type: String, required: true },
    trait: { type: String },
    value: { type: Number },
    domainWeights: { type: [{ domainId: Schema.Types.ObjectId, weight: Number }], default: [] },
  }], default: [] },
}, { _id: false })

const quizAttemptSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
    quizVersion: { type: Number, min: 1 },
    questionSnapshots: { type: [questionSnapshotSchema], default: [] },
    answers: { type: [quizAnswerSchema], default: [] },
    // Denormalized result fields so the dashboard/history list (see
    // frontendFixtures.quizAttempts in pathseekerApi.js) can be rendered
    // without re-computing scores on every read.
    archetype: { type: String, trim: true, maxlength: 100 },
    score: { type: Number, min: 0, max: 100 },
    topCareerId: { type: Schema.Types.ObjectId, ref: 'Career' },
    passportId: { type: Schema.Types.ObjectId, ref: 'CareerPassport' },
    recommendationSnapshotId: { type: Schema.Types.ObjectId, ref: 'RecommendationSnapshot' },
    algorithmVersion: { type: String, default: 'passport-v1' },
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
quizAttemptSchema.index({ quizId: 1, userId: 1, status: 1 })

export const QuizAttempt =
  mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', quizAttemptSchema)
export default QuizAttempt
