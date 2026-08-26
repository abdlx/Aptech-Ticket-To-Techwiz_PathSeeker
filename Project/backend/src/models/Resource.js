import mongoose from 'mongoose'
import { RESOURCE_TYPES, USER_STAGES } from '../constants/database.js'
import { AssetSchema } from '../schemas/asset.schema.js'

const { Schema } = mongoose

const resourceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1_000 },
    type: { type: String, required: true, enum: RESOURCE_TYPES },
    file: { type: AssetSchema, required: true },
    pageCount: { type: Number, min: 0 },
    tags: { type: [{ type: String, trim: true, maxlength: 60 }], default: [] },
    targetAudience: { type: [{ type: String, enum: USER_STAGES }], default: [] },
    downloadCount: { type: Number, min: 0, default: 0 },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'resources' },
)

resourceSchema.index({ active: 1, type: 1 })
resourceSchema.index({ tags: 1 })
resourceSchema.index({ downloadCount: -1 })
resourceSchema.index({ title: 'text', description: 'text' })

export const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema)
export default Resource