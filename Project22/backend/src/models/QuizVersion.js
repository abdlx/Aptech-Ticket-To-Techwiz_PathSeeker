import mongoose from 'mongoose'
const { Schema } = mongoose
const snapshotOption = new Schema({ key: String, label: String, domainWeights: [{ domainId: { type: Schema.Types.ObjectId, ref: 'Domain' }, weight: Number }] }, { _id: false })
const snapshotQuestion = new Schema({ questionId: { type: Schema.Types.ObjectId, ref: 'QuizQuestion' }, version: Number, questionText: String, type: String, order: Number, timeLimitSeconds: Number, options: { type: [snapshotOption], default: [] } }, { _id: false })
const quizVersionSchema = new Schema({
  version: { type: Number, required: true, min: 1 },
  title: { type: String, trim: true, maxlength: 200, default: 'Interest Quiz' },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  questions: { type: [snapshotQuestion], default: [] },
  scoringVersion: { type: String, default: 'domain-weight-v1' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  publishedAt: Date,
}, { timestamps: true, collection: 'quizVersions' })
quizVersionSchema.index({ version: 1 }, { unique: true })
quizVersionSchema.index({ status: 1, version: -1 })
export const QuizVersion = mongoose.models.QuizVersion || mongoose.model('QuizVersion', quizVersionSchema)
export default QuizVersion
