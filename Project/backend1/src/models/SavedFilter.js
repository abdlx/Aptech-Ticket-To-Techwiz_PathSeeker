import mongoose from 'mongoose'
import { CAREER_DEMAND_LEVELS } from '../constants/database.js'

const { Schema } = mongoose

const savedFilterSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    domainIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Domain' }], default: [] },
    skillIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Skill' }], default: [] },
    skillIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Skill' }], default: [] },
    salaryMin: { type: Number, min: 0 },
    demand: { type: String, enum: [...CAREER_DEMAND_LEVELS, 'any'], default: 'any' },
    alerts: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'savedFilters' },
)

savedFilterSchema.index({ userId: 1, createdAt: -1 })

export const SavedFilter =
  mongoose.models.SavedFilter || mongoose.model('SavedFilter', savedFilterSchema)
export default SavedFilter
