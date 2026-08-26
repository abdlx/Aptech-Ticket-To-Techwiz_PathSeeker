import mongoose from 'mongoose'
import { CAREER_DEMAND_LEVELS, SKILL_IMPORTANCE_LEVELS } from '../constants/database.js'

const { Schema } = mongoose

const requiredSkillSchema = new Schema(
  {
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
    importance: { type: String, enum: SKILL_IMPORTANCE_LEVELS, default: 'important' },
  },
  { _id: false },
)

const salarySchema = new Schema(
  {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 },
    currency: { type: String, trim: true, uppercase: true, minlength: 3, maxlength: 3, default: 'USD' },
  },
  { _id: false },
)

salarySchema.pre('validate', function validateSalaryRange() {
  if (this.min != null && this.max != null && this.max < this.min) {
    this.invalidate('max', 'Salary max cannot be less than salary min.')
  }
})

const careerSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 150,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 3_000 },
    domainId: { type: Schema.Types.ObjectId, ref: 'Domain', required: true },
    requiredSkills: {
      type: [requiredSkillSchema],
      default: [],
      validate: {
        validator: (skills) => new Set(skills.map(({ skillId }) => skillId.toString())).size === skills.length,
        message: 'A career cannot list the same required skill more than once.',
      },
    },
    educationPath: { type: String, trim: true, maxlength: 500 },
    expectedSalary: { type: salarySchema, default: () => ({}) },
    demand: { type: String, enum: CAREER_DEMAND_LEVELS, default: 'medium' },
    growthRatePercent: { type: Number, min: -100, max: 1_000 },
    iconKey: { type: String, trim: true, maxlength: 50 },
    colorTone: { type: String, trim: true, maxlength: 30 },
    tags: { type: [{ type: String, trim: true, maxlength: 60 }], default: [] },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'careers' },
)

careerSchema.index({ slug: 1 }, { unique: true })
careerSchema.index({ domainId: 1, active: 1 })
careerSchema.index({ demand: 1, active: 1 })
careerSchema.index({ tags: 1 })
careerSchema.index({ title: 'text', description: 'text' })

export const Career = mongoose.models.Career || mongoose.model('Career', careerSchema)
export default Career