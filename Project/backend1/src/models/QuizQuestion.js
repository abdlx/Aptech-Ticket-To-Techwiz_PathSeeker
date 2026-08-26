import mongoose from 'mongoose'
import { QUIZ_QUESTION_TYPES, QUIZ_TRAITS } from '../constants/database.js'

const { Schema } = mongoose

// Each option nudges the quiz result toward one or more domains. Scoring
// (see QuizAttempt) sums these weights across a user's answers to suggest
// streams/careers, matching the SRS "AI-Powered Interest Quiz" requirement
// without requiring an actual ML model.
const domainWeightSchema = new Schema(
  {
    domainId: { type: Schema.Types.ObjectId, ref: 'Domain', required: true },
    weight: { type: Number, required: true, min: -10, max: 10 },
  },
  { _id: false },
)

const quizOptionSchema = new Schema(
  {
    key: { type: String, required: true, trim: true, maxlength: 20 },
    label: { type: String, required: true, trim: true, maxlength: 300 },
    icon: { type: String, trim: true, maxlength: 50 },
    trait: { type: String, enum: QUIZ_TRAITS },
    domainWeights: { type: [domainWeightSchema], default: [] },
  },
  { _id: false },
)

const quizQuestionSchema = new Schema(
  {
    questionText: { type: String, required: true, trim: true, maxlength: 500 },
    eyebrow: { type: String, trim: true, maxlength: 100 },
    hint: { type: String, trim: true, maxlength: 300 },
    type: { type: String, required: true, enum: QUIZ_QUESTION_TYPES, default: 'multiple_choice' },
    options: {
      type: [quizOptionSchema],
      default: [],
      validate: {
        validator: (options) => new Set(options.map(({ key }) => key)).size === options.length,
        message: 'Quiz option keys must be unique within a question.',
      },
    },
    order: { type: Number, min: 0, default: 0 },
    timeLimitSeconds: { type: Number, min: 0 },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'quizQuestions' },
)

quizQuestionSchema.pre('validate', function requireOptionsForChoiceTypes() {
  if (this.type === 'multiple_choice' && this.options.length < 2) {
    this.invalidate('options', 'Multiple-choice questions need at least two options.')
  }
})

quizQuestionSchema.index({ active: 1, order: 1 })

export const QuizQuestion =
  mongoose.models.QuizQuestion || mongoose.model('QuizQuestion', quizQuestionSchema)
export default QuizQuestion
