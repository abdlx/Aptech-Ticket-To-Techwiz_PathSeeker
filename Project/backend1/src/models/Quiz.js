import mongoose from 'mongoose'
import { QUIZ_QUESTION_TYPES, QUIZ_TRAITS } from '../constants/database.js'

const { Schema } = mongoose

const domainWeightSchema = new Schema({
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain', required: true },
  weight: { type: Number, required: true, min: -10, max: 10 },
}, { _id: false })

const optionSchema = new Schema({
  key: { type: String, required: true, trim: true, maxlength: 20 },
  label: { type: String, required: true, trim: true, maxlength: 300 },
  icon: { type: String, trim: true, maxlength: 50 },
  trait: { type: String, enum: QUIZ_TRAITS },
  value: { type: Number, min: 0, max: 10 },
  domainWeights: { type: [domainWeightSchema], default: [] },
}, { _id: false })

const questionSchema = new Schema({
  key: { type: String, required: true, trim: true, maxlength: 50 },
  questionText: { type: String, required: true, trim: true, maxlength: 500 },
  eyebrow: { type: String, trim: true, maxlength: 100 },
  hint: { type: String, trim: true, maxlength: 300 },
  type: { type: String, enum: QUIZ_QUESTION_TYPES, default: 'multiple_choice' },
  options: { type: [optionSchema], default: [] },
  order: { type: Number, min: 0, required: true },
  timeLimitSeconds: { type: Number, min: 0, max: 3_600 },
}, { _id: false })

const quizSchema = new Schema({
  slug: { type: String, required: true, trim: true, lowercase: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  version: { type: Number, required: true, min: 1 },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 1_000 },
  status: { type: String, enum: ['draft', 'published', 'retired'], default: 'draft' },
  questions: {
    type: [questionSchema],
    default: [],
    validate: {
      validator: (questions) => new Set(questions.map(({ key }) => key)).size === questions.length,
      message: 'Quiz question keys must be unique.',
    },
  },
  algorithmVersion: { type: String, required: true, default: 'passport-v1' },
  publishedAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, collection: 'quizzes' })

quizSchema.index({ slug: 1, version: 1 }, { unique: true })
quizSchema.index({ status: 1, publishedAt: -1 })
quizSchema.pre('validate', function validatePublishedQuiz() {
  if (this.status === 'published') {
    if (this.questions.length === 0) this.invalidate('questions', 'A published quiz needs at least one question.')
    if (!this.publishedAt) this.publishedAt = new Date()
  }
  for (const question of this.questions) {
    if (question.type === 'multiple_choice' && question.options.length < 2) {
      this.invalidate('questions', 'Multiple-choice questions need at least two options.')
    }
    if (new Set(question.options.map(({ key }) => key)).size !== question.options.length) {
      this.invalidate('questions', 'Quiz option keys must be unique within each question.')
    }
  }
})

export const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema)
export default Quiz
