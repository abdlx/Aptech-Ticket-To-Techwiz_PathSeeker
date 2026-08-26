import mongoose from 'mongoose'

const { Schema } = mongoose

const scoreSchema = new Schema({
  key: { type: String, required: true, trim: true, lowercase: true },
  label: { type: String, required: true, trim: true },
  score: { type: Number, required: true, min: 0, max: 100 },
}, { _id: false })

const passportSkillSchema = new Schema({
  skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
  level: { type: Number, required: true, min: 0, max: 10 },
  source: { type: String, enum: ['profile', 'assessment', 'approved_voice_insight'], default: 'profile' },
}, { _id: false })

const careerPassportSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  sourceAttemptId: { type: Schema.Types.ObjectId, ref: 'QuizAttempt', required: true },
  profileVersion: { type: Date, required: true },
  archetype: { type: String, required: true, trim: true, maxlength: 100 },
  traitScores: { type: [scoreSchema], default: [] },
  domainScores: { type: [scoreSchema], default: [] },
  skills: { type: [passportSkillSchema], default: [] },
  completionPercent: { type: Number, min: 0, max: 100, required: true },
  targetCareerId: { type: Schema.Types.ObjectId, ref: 'Career' },
  algorithmVersion: { type: String, required: true, default: 'passport-v1' },
  calculatedAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true, collection: 'careerPassports' })

careerPassportSchema.index({ userId: 1, calculatedAt: -1 })
careerPassportSchema.index({ sourceAttemptId: 1 }, { unique: true })

export const CareerPassport = mongoose.models.CareerPassport || mongoose.model('CareerPassport', careerPassportSchema)
export default CareerPassport
