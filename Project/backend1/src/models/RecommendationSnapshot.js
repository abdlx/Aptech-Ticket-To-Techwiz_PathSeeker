import mongoose from 'mongoose'

const { Schema } = mongoose

const componentSchema = new Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  weight: { type: Number, required: true, min: 0, max: 1 },
}, { _id: false })

const gapSchema = new Schema({
  skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
  currentLevel: { type: Number, min: 0, max: 10, required: true },
  requiredLevel: { type: Number, min: 1, max: 10, required: true },
  difference: { type: Number, min: 0, max: 10, required: true },
  importance: { type: String, enum: ['nice_to_have', 'important', 'critical'], required: true },
  readinessImpact: { type: Number, min: 0, max: 100, required: true },
}, { _id: false })

const matchSchema = new Schema({
  careerId: { type: Schema.Types.ObjectId, ref: 'Career', required: true },
  compatibilityScore: { type: Number, min: 0, max: 100, required: true },
  readinessScore: { type: Number, min: 0, max: 100, required: true },
  confidence: { type: Number, min: 0, max: 100, required: true },
  components: { type: [componentSchema], default: [] },
  reasons: { type: [{ type: String, trim: true, maxlength: 300 }], default: [] },
  skillGap: { type: [gapSchema], default: [] },
}, { _id: false })

const recommendationSnapshotSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  passportId: { type: Schema.Types.ObjectId, ref: 'CareerPassport', required: true, immutable: true },
  sourceAttemptId: { type: Schema.Types.ObjectId, ref: 'QuizAttempt', required: true, immutable: true },
  matches: { type: [matchSchema], default: [] },
  algorithmVersion: { type: String, required: true, default: 'recommendation-v1' },
}, { timestamps: true, collection: 'recommendationSnapshots' })

recommendationSnapshotSchema.index({ userId: 1, createdAt: -1 })
recommendationSnapshotSchema.index({ passportId: 1 }, { unique: true })

export const RecommendationSnapshot = mongoose.models.RecommendationSnapshot || mongoose.model('RecommendationSnapshot', recommendationSnapshotSchema)
export default RecommendationSnapshot
